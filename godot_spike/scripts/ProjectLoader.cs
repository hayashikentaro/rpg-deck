using Godot;
using Godot.Collections;

public partial class ProjectLoader : Node
{
    [Export]
    public string ProjectJsonPath { get; set; } = "res://data/project.json";

    public override void _Ready()
    {
        LoadProjectSummary();
    }

    private void LoadProjectSummary()
    {
        if (!FileAccess.FileExists(ProjectJsonPath))
        {
            GD.PushWarning(
                $"RPG Deck project JSON not found at '{ProjectJsonPath}'. " +
                "Copy Project JSON from the RPG Deck editor into godot_spike/data/project.json."
            );
            return;
        }

        using var file = FileAccess.Open(ProjectJsonPath, FileAccess.ModeFlags.Read);
        if (file == null)
        {
            GD.PushError($"Unable to open RPG Deck project JSON at '{ProjectJsonPath}'.");
            return;
        }

        var jsonText = file.GetAsText();
        var json = new Json();
        var parseError = json.Parse(jsonText);
        if (parseError != Error.Ok)
        {
            GD.PushError(
                $"Failed to parse RPG Deck project JSON at '{ProjectJsonPath}': " +
                $"{json.GetErrorMessage()} at line {json.GetErrorLine()}."
            );
            return;
        }

        if (json.Data.VariantType != Variant.Type.Dictionary)
        {
            GD.PushError("RPG Deck project JSON root must be an object.");
            return;
        }

        var summary = ExtractProjectSummary(json.Data.AsGodotDictionary());

        GD.Print("RPG Deck project loaded:");
        GD.Print($"  id: {summary.ProjectId}");
        GD.Print($"  title: {summary.Title}");
        GD.Print($"  start map: {summary.StartMap}");
        GD.Print($"  start position: {summary.StartPosition}");
        GD.Print($"  map count: {summary.MapCount}");
        GD.Print($"  event count: {summary.EventCount}");
        GD.Print($"  current map size: {summary.CurrentMap.Size}");
        GD.Print($"  current map collision count: {summary.CurrentMap.CollisionCount}");
        GD.Print($"  current map event count: {summary.CurrentMap.EventCount}");
        GD.Print("ProjectLoader skeleton stops after summary logging. Map rendering and gameplay are not implemented yet.");
    }

    private static ProjectSummary ExtractProjectSummary(Dictionary project)
    {
        var settings = GetDictionary(project, "settings", "project.settings");
        var start = GetDictionary(settings, "start", "settings.start");
        var maps = GetDictionary(project, "maps", "project.maps");
        var events = GetDictionary(project, "events", "project.events");

        var startMap = GetString(start, "map", "<missing start map>", "settings.start.map");
        var currentMap = GetMap(maps, startMap);

        return new ProjectSummary(
            GetString(project, "id", "<missing id>", "project.id"),
            GetString(project, "title", "<missing title>", "project.title"),
            startMap,
            FormatGridPosition(start, "position", "settings.start.position"),
            maps.Count,
            events.Count,
            ExtractMapSummary(currentMap, events, startMap)
        );
    }

    private static MapSummary ExtractMapSummary(Dictionary map, Dictionary events, string startMap)
    {
        if (map.Count == 0)
        {
            return new MapSummary("<missing current map>", 0, CountEventsOnMap(events, startMap));
        }

        return new MapSummary(
            FormatGridPosition(map, "size", $"maps.{startMap}.size"),
            CountArray(map, "collision", $"maps.{startMap}.collision"),
            CountEventsOnMap(events, startMap)
        );
    }

    private static Dictionary GetDictionary(Dictionary parent, string key, string path)
    {
        if (parent.Count == 0)
        {
            GD.PushWarning($"Cannot read '{path}' because its parent object is missing or invalid.");
            return new Dictionary();
        }

        if (!parent.ContainsKey(key))
        {
            GD.PushWarning($"Missing object field '{path}'.");
            return new Dictionary();
        }

        var value = parent[key];
        if (value.VariantType != Variant.Type.Dictionary)
        {
            GD.PushWarning($"Field '{path}' must be an object.");
            return new Dictionary();
        }

        return value.AsGodotDictionary();
    }

    private static Dictionary GetMap(Dictionary maps, string startMap)
    {
        if (maps.Count == 0 || startMap.StartsWith("<"))
        {
            return new Dictionary();
        }

        if (!maps.ContainsKey(startMap))
        {
            GD.PushWarning($"Start map '{startMap}' not found in maps.");
            return new Dictionary();
        }

        var value = maps[startMap];
        if (value.VariantType != Variant.Type.Dictionary)
        {
            GD.PushWarning($"Start map '{startMap}' must be an object.");
            return new Dictionary();
        }

        return value.AsGodotDictionary();
    }

    private static string GetString(Dictionary parent, string key, string fallback, string path)
    {
        if (parent.Count == 0)
        {
            GD.PushWarning($"Cannot read '{path}' because its parent object is missing or invalid.");
            return fallback;
        }

        if (!parent.ContainsKey(key))
        {
            GD.PushWarning($"Missing string field '{path}'.");
            return fallback;
        }

        var value = parent[key];
        if (value.VariantType != Variant.Type.String)
        {
            GD.PushWarning($"Field '{path}' must be a string.");
            return fallback;
        }

        return value.AsString();
    }

    private static string FormatGridPosition(Dictionary parent, string key, string path)
    {
        if (parent.Count == 0)
        {
            GD.PushWarning($"Cannot read '{path}' because its parent object is missing or invalid.");
            return "<missing position>";
        }

        if (!parent.ContainsKey(key))
        {
            GD.PushWarning($"Missing grid position field '{path}'.");
            return "<missing position>";
        }

        var value = parent[key];
        if (value.VariantType != Variant.Type.Array)
        {
            GD.PushWarning($"Field '{path}' must be a two-value array.");
            return "<invalid position>";
        }

        var position = value.AsGodotArray();
        if (position.Count < 2)
        {
            GD.PushWarning($"Field '{path}' must include x and y values.");
            return "<invalid position>";
        }

        if (!IsNumber(position[0]) || !IsNumber(position[1]))
        {
            GD.PushWarning($"Field '{path}' must contain numeric x and y values.");
            return "<invalid position>";
        }

        return $"[{position[0]}, {position[1]}]";
    }

    private static int CountArray(Dictionary parent, string key, string path)
    {
        if (parent.Count == 0)
        {
            GD.PushWarning($"Cannot read '{path}' because its parent object is missing or invalid.");
            return 0;
        }

        if (!parent.ContainsKey(key))
        {
            GD.PushWarning($"Missing array field '{path}'.");
            return 0;
        }

        var value = parent[key];
        if (value.VariantType != Variant.Type.Array)
        {
            GD.PushWarning($"Field '{path}' must be an array.");
            return 0;
        }

        return value.AsGodotArray().Count;
    }

    private static int CountEventsOnMap(Dictionary events, string mapId)
    {
        if (events.Count == 0 || mapId.StartsWith("<"))
        {
            return 0;
        }

        var count = 0;
        foreach (var eventEntry in events)
        {
            var eventValue = eventEntry.Value;
            if (eventValue.VariantType != Variant.Type.Dictionary)
            {
                GD.PushWarning($"Event '{eventEntry.Key}' must be an object.");
                continue;
            }

            var eventDefinition = eventValue.AsGodotDictionary();
            if (!eventDefinition.ContainsKey("map"))
            {
                GD.PushWarning($"Event '{eventEntry.Key}' is missing map.");
                continue;
            }

            var eventMap = eventDefinition["map"];
            if (eventMap.VariantType != Variant.Type.String)
            {
                GD.PushWarning($"Event '{eventEntry.Key}' map must be a string.");
                continue;
            }

            if (eventMap.AsString() == mapId)
            {
                count += 1;
            }
        }

        return count;
    }

    private static bool IsNumber(Variant value)
    {
        return value.VariantType == Variant.Type.Int || value.VariantType == Variant.Type.Float;
    }

    private readonly struct ProjectSummary
    {
        public ProjectSummary(
            string projectId,
            string title,
            string startMap,
            string startPosition,
            int mapCount,
            int eventCount,
            MapSummary currentMap
        )
        {
            ProjectId = projectId;
            Title = title;
            StartMap = startMap;
            StartPosition = startPosition;
            MapCount = mapCount;
            EventCount = eventCount;
            CurrentMap = currentMap;
        }

        public string ProjectId { get; }
        public string Title { get; }
        public string StartMap { get; }
        public string StartPosition { get; }
        public int MapCount { get; }
        public int EventCount { get; }
        public MapSummary CurrentMap { get; }
    }

    private readonly struct MapSummary
    {
        public MapSummary(string size, int collisionCount, int eventCount)
        {
            Size = size;
            CollisionCount = collisionCount;
            EventCount = eventCount;
        }

        public string Size { get; }
        public int CollisionCount { get; }
        public int EventCount { get; }
    }
}

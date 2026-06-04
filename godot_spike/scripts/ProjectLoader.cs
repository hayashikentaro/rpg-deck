using System.Collections.Generic;
using Godot;
using Godot.Collections;

public partial class ProjectLoader : Node
{
    [Export]
    public string ProjectJsonPath { get; set; } = "res://data/project.json";

    [Export]
    public int DebugCellSize { get; set; } = 24;

    [Export]
    public Vector2 DebugMapOffset { get; set; } = new Vector2(24, 80);

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

        RenderDebugMap(summary);
        GD.Print("ProjectLoader skeleton stops after static debug map rendering. Gameplay is not implemented yet.");
    }

    private void RenderDebugMap(ProjectSummary summary)
    {
        RenderDebugLegend();

        if (!summary.CurrentMap.SizePosition.IsValid)
        {
            GD.PushWarning("Cannot render debug map because current map size is invalid.");
            return;
        }

        var debugMap = new Node2D
        {
            Name = "DebugMap",
            Position = DebugMapOffset
        };
        AddChild(debugMap);

        var collisions = ToPositionSet(summary.CurrentMap.CollisionPositions);
        var events = ToPositionSet(summary.CurrentMap.EventPositions);

        for (var y = 0; y < summary.CurrentMap.SizePosition.Y; y += 1)
        {
            for (var x = 0; x < summary.CurrentMap.SizePosition.X; x += 1)
            {
                var position = new GridPosition(x, y, true);
                var marker = MarkerForPosition(position, summary.StartPositionValue, collisions, events);

                var label = new Label
                {
                    Name = $"Cell_{x}_{y}",
                    Text = marker,
                    Position = new Vector2(x * DebugCellSize, y * DebugCellSize)
                };
                debugMap.AddChild(label);
            }
        }
    }

    private void RenderDebugLegend()
    {
        var legend = new Label
        {
            Name = "DebugLegend",
            Text = "RPG Deck Debug Map\nP player start  E event  # collision  . empty",
            Position = new Vector2(24, 24)
        };
        AddChild(legend);
    }

    private static string MarkerForPosition(
        GridPosition position,
        GridPosition playerStart,
        HashSet<string> collisions,
        HashSet<string> events
    )
    {
        if (playerStart.IsValid && playerStart.X == position.X && playerStart.Y == position.Y)
        {
            return "P";
        }

        var key = PositionKey(position);
        if (events.Contains(key))
        {
            return "E";
        }

        if (collisions.Contains(key))
        {
            return "#";
        }

        return ".";
    }

    private static ProjectSummary ExtractProjectSummary(Dictionary project)
    {
        var settings = GetDictionary(project, "settings", "project.settings");
        var start = GetDictionary(settings, "start", "settings.start");
        var maps = GetDictionary(project, "maps", "project.maps");
        var events = GetDictionary(project, "events", "project.events");

        var startMap = GetString(start, "map", "<missing start map>", "settings.start.map");
        var startPosition = GetGridPosition(start, "position", "settings.start.position");
        var currentMap = GetMap(maps, startMap);

        return new ProjectSummary(
            GetString(project, "id", "<missing id>", "project.id"),
            GetString(project, "title", "<missing title>", "project.title"),
            startMap,
            FormatGridPosition(startPosition),
            startPosition,
            maps.Count,
            events.Count,
            ExtractMapSummary(currentMap, events, startMap)
        );
    }

    private static MapSummary ExtractMapSummary(Dictionary map, Dictionary events, string startMap)
    {
        if (map.Count == 0)
        {
            return new MapSummary(
                "<missing current map>",
                GridPosition.Invalid,
                new List<GridPosition>(),
                GetEventPositionsOnMap(events, startMap)
            );
        }

        var mapSize = GetGridPosition(map, "size", $"maps.{startMap}.size");
        var collisionPositions = GetGridPositionArray(map, "collision", $"maps.{startMap}.collision");
        var eventPositions = GetEventPositionsOnMap(events, startMap);

        return new MapSummary(
            FormatGridPosition(mapSize),
            mapSize,
            collisionPositions,
            eventPositions
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

    private static string FormatGridPosition(GridPosition position)
    {
        return position.IsValid ? $"[{position.X}, {position.Y}]" : "<invalid position>";
    }

    private static GridPosition GetGridPosition(Dictionary parent, string key, string path)
    {
        if (parent.Count == 0)
        {
            GD.PushWarning($"Cannot read '{path}' because its parent object is missing or invalid.");
            return GridPosition.Invalid;
        }

        if (!parent.ContainsKey(key))
        {
            GD.PushWarning($"Missing grid position field '{path}'.");
            return GridPosition.Invalid;
        }

        var value = parent[key];
        if (value.VariantType != Variant.Type.Array)
        {
            GD.PushWarning($"Field '{path}' must be a two-value array.");
            return GridPosition.Invalid;
        }

        return GetGridPositionFromArray(value.AsGodotArray(), path);
    }

    private static GridPosition GetGridPositionFromArray(Array position, string path)
    {
        if (position.Count < 2)
        {
            GD.PushWarning($"Field '{path}' must include x and y values.");
            return GridPosition.Invalid;
        }

        if (!IsNumber(position[0]) || !IsNumber(position[1]))
        {
            GD.PushWarning($"Field '{path}' must contain numeric x and y values.");
            return GridPosition.Invalid;
        }

        return new GridPosition(ToInt(position[0]), ToInt(position[1]), true);
    }

    private static List<GridPosition> GetGridPositionArray(Dictionary parent, string key, string path)
    {
        var positions = new List<GridPosition>();
        if (parent.Count == 0)
        {
            GD.PushWarning($"Cannot read '{path}' because its parent object is missing or invalid.");
            return positions;
        }

        if (!parent.ContainsKey(key))
        {
            GD.PushWarning($"Missing array field '{path}'.");
            return positions;
        }

        var value = parent[key];
        if (value.VariantType != Variant.Type.Array)
        {
            GD.PushWarning($"Field '{path}' must be an array.");
            return positions;
        }

        var array = value.AsGodotArray();
        for (var index = 0; index < array.Count; index += 1)
        {
            var item = array[index];
            if (item.VariantType != Variant.Type.Array)
            {
                GD.PushWarning($"Grid position entry '{path}[{index}]' must be an array.");
                continue;
            }

            var position = GetGridPositionFromArray(item.AsGodotArray(), $"{path}[{index}]");
            if (position.IsValid)
            {
                positions.Add(position);
            }
        }

        return positions;
    }

    private static List<GridPosition> GetEventPositionsOnMap(Dictionary events, string mapId)
    {
        var positions = new List<GridPosition>();
        if (events.Count == 0 || mapId.StartsWith("<"))
        {
            return positions;
        }

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

            if (eventMap.AsString() != mapId)
            {
                continue;
            }

            var position = GetGridPosition(eventDefinition, "position", $"events.{eventEntry.Key}.position");
            if (position.IsValid)
            {
                positions.Add(position);
            }
            else
            {
                GD.PushWarning($"Skipping event marker '{eventEntry.Key}' because its position is invalid.");
            }
        }

        return positions;
    }

    private static bool IsNumber(Variant value)
    {
        return value.VariantType == Variant.Type.Int || value.VariantType == Variant.Type.Float;
    }

    private static int ToInt(Variant value)
    {
        return value.VariantType == Variant.Type.Int ? value.AsInt32() : (int)value.AsDouble();
    }

    private static HashSet<string> ToPositionSet(List<GridPosition> positions)
    {
        var set = new HashSet<string>();
        foreach (var position in positions)
        {
            set.Add(PositionKey(position));
        }

        return set;
    }

    private static string PositionKey(GridPosition position)
    {
        return $"{position.X},{position.Y}";
    }

    private readonly struct ProjectSummary
    {
        public ProjectSummary(
            string projectId,
            string title,
            string startMap,
            string startPosition,
            GridPosition startPositionValue,
            int mapCount,
            int eventCount,
            MapSummary currentMap
        )
        {
            ProjectId = projectId;
            Title = title;
            StartMap = startMap;
            StartPosition = startPosition;
            StartPositionValue = startPositionValue;
            MapCount = mapCount;
            EventCount = eventCount;
            CurrentMap = currentMap;
        }

        public string ProjectId { get; }
        public string Title { get; }
        public string StartMap { get; }
        public string StartPosition { get; }
        public GridPosition StartPositionValue { get; }
        public int MapCount { get; }
        public int EventCount { get; }
        public MapSummary CurrentMap { get; }
    }

    private readonly struct MapSummary
    {
        public MapSummary(
            string size,
            GridPosition sizePosition,
            List<GridPosition> collisionPositions,
            List<GridPosition> eventPositions
        )
        {
            Size = size;
            SizePosition = sizePosition;
            CollisionPositions = collisionPositions;
            EventPositions = eventPositions;
        }

        public string Size { get; }
        public GridPosition SizePosition { get; }
        public List<GridPosition> CollisionPositions { get; }
        public List<GridPosition> EventPositions { get; }
        public int CollisionCount => CollisionPositions.Count;
        public int EventCount => EventPositions.Count;
    }

    private readonly struct GridPosition
    {
        public static readonly GridPosition Invalid = new GridPosition(0, 0, false);

        public GridPosition(int x, int y, bool isValid)
        {
            X = x;
            Y = y;
            IsValid = isValid;
        }

        public int X { get; }
        public int Y { get; }
        public bool IsValid { get; }
    }
}

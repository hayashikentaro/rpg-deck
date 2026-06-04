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

        var project = json.Data.AsGodotDictionary();
        var settings = GetDictionary(project, "settings");
        var start = GetDictionary(settings, "start");
        var maps = GetDictionary(project, "maps");
        var events = GetDictionary(project, "events");

        var projectId = GetString(project, "id", "<missing id>");
        var title = GetString(project, "title", "<missing title>");
        var startMap = GetString(start, "map", "<missing start map>");
        var startPosition = FormatPosition(start);

        GD.Print("RPG Deck project loaded:");
        GD.Print($"  id: {projectId}");
        GD.Print($"  title: {title}");
        GD.Print($"  start map: {startMap}");
        GD.Print($"  start position: {startPosition}");
        GD.Print($"  map count: {maps.Count}");
        GD.Print($"  event count: {events.Count}");
        GD.Print("ProjectLoader skeleton stops after summary logging. Map rendering and gameplay are not implemented yet.");
    }

    private static Dictionary GetDictionary(Dictionary parent, string key)
    {
        if (!parent.ContainsKey(key))
        {
            return new Dictionary();
        }

        var value = parent[key];
        if (value.VariantType != Variant.Type.Dictionary)
        {
            return new Dictionary();
        }

        return value.AsGodotDictionary();
    }

    private static string GetString(Dictionary parent, string key, string fallback)
    {
        if (!parent.ContainsKey(key))
        {
            return fallback;
        }

        var value = parent[key];
        return value.VariantType == Variant.Type.String ? value.AsString() : fallback;
    }

    private static string FormatPosition(Dictionary start)
    {
        if (!start.ContainsKey("position"))
        {
            return "<missing position>";
        }

        var value = start["position"];
        if (value.VariantType != Variant.Type.Array)
        {
            return "<invalid position>";
        }

        var position = value.AsGodotArray();
        if (position.Count < 2)
        {
            return "<invalid position>";
        }

        return $"[{position[0]}, {position[1]}]";
    }
}


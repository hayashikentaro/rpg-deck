using System.Collections.Generic;
using Godot;
using Godot.Collections;

public partial class ProjectLoader : Node
{
    private readonly System.Collections.Generic.Dictionary<string, Label> _debugCells =
        new System.Collections.Generic.Dictionary<string, Label>();
    private Label _debugStatusLabel;
    private HashSet<string> _collisionPositions = new HashSet<string>();
    private HashSet<string> _eventPositions = new HashSet<string>();
    private List<MapEventSummary> _currentMapEvents = new List<MapEventSummary>();
    private GridPosition _currentPlayerPosition = GridPosition.Invalid;
    private GridPosition _currentMapSize = GridPosition.Invalid;
    private FacingDirection _currentFacingDirection = FacingDirection.Down;
    private bool _debugMapLoaded;

    [Export]
    public string ProjectJsonPath { get; set; } = "res://data/project.json";

    [Export]
    public int DebugCellSize { get; set; } = 24;

    [Export]
    public Vector2 DebugMapOffset { get; set; } = new Vector2(24, 120);

    public override void _Ready()
    {
        LoadProjectSummary();
    }

    public override void _UnhandledInput(InputEvent @event)
    {
        var keyEvent = @event as InputEventKey;
        if (!_debugMapLoaded || keyEvent == null || !keyEvent.Pressed || keyEvent.Echo)
        {
            return;
        }

        if (IsInteractKey(keyEvent.Keycode))
        {
            TryInteract();
            GetViewport().SetInputAsHandled();
            return;
        }

        var delta = MovementDeltaForKey(keyEvent.Keycode);
        if (!delta.IsValid)
        {
            return;
        }

        TryMovePlayer(delta, FacingDirectionForDelta(delta));
        GetViewport().SetInputAsHandled();
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
        RenderDebugStatus();

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

        _debugCells.Clear();
        _collisionPositions = ToPositionSet(summary.CurrentMap.CollisionPositions);
        _eventPositions = ToPositionSet(summary.CurrentMap.EventPositions);
        _currentMapEvents = summary.CurrentMap.Events;
        _currentPlayerPosition = summary.StartPositionValue;
        _currentMapSize = summary.CurrentMap.SizePosition;
        _debugMapLoaded = _currentPlayerPosition.IsValid;

        for (var y = 0; y < summary.CurrentMap.SizePosition.Y; y += 1)
        {
            for (var x = 0; x < summary.CurrentMap.SizePosition.X; x += 1)
            {
                var position = new GridPosition(x, y, true);
                var marker = MarkerForPosition(position);

                var label = new Label
                {
                    Name = $"Cell_{x}_{y}",
                    Text = marker,
                    Position = new Vector2(x * DebugCellSize, y * DebugCellSize)
                };
                debugMap.AddChild(label);
                _debugCells[PositionKey(position)] = label;
            }
        }
    }

    private void RenderDebugLegend()
    {
        var legend = new Label
        {
            Name = "DebugLegend",
            Text = "RPG Deck Debug Map\n^v<> player facing  E event  # collision  . empty",
            Position = new Vector2(24, 24)
        };
        AddChild(legend);
    }

    private void RenderDebugStatus()
    {
        _debugStatusLabel = new Label
        {
            Name = "DebugStatus",
            Text = "Status: ready",
            Position = new Vector2(24, 72)
        };
        AddChild(_debugStatusLabel);
    }

    private string MarkerForPosition(GridPosition position)
    {
        if (_currentPlayerPosition.IsValid && _currentPlayerPosition.X == position.X && _currentPlayerPosition.Y == position.Y)
        {
            return PlayerMarkerForFacing();
        }

        var key = PositionKey(position);
        if (_eventPositions.Contains(key))
        {
            return "E";
        }

        if (_collisionPositions.Contains(key))
        {
            return "#";
        }

        return ".";
    }

    private void TryMovePlayer(GridPosition delta, FacingDirection facingDirection)
    {
        _currentFacingDirection = facingDirection;
        UpdateCell(_currentPlayerPosition);

        var nextPosition = new GridPosition(
            _currentPlayerPosition.X + delta.X,
            _currentPlayerPosition.Y + delta.Y,
            true
        );

        if (!IsWithinMapBounds(nextPosition))
        {
            var message = $"movement_blocked: map_bounds [{nextPosition.X}, {nextPosition.Y}] facing {FacingDirectionLabel()}";
            GD.Print(message);
            SetDebugStatus(message);
            return;
        }

        if (_collisionPositions.Contains(PositionKey(nextPosition)))
        {
            var message = $"movement_blocked: collision [{nextPosition.X}, {nextPosition.Y}] facing {FacingDirectionLabel()}";
            GD.Print(message);
            SetDebugStatus(message);
            return;
        }

        var previousPosition = _currentPlayerPosition;
        _currentPlayerPosition = nextPosition;
        UpdateCell(previousPosition);
        UpdateCell(_currentPlayerPosition);
        var movedMessage = $"player moved to [{_currentPlayerPosition.X}, {_currentPlayerPosition.Y}] facing {FacingDirectionLabel()}";
        GD.Print(movedMessage);
        SetDebugStatus(movedMessage);
        TryReportTouchEvent();
    }

    private void TryInteract()
    {
        var targetPosition = FacingTargetPosition();
        foreach (var eventSummary in _currentMapEvents)
        {
            if (
                eventSummary.Trigger == "interact" &&
                eventSummary.Position.X == targetPosition.X &&
                eventSummary.Position.Y == targetPosition.Y
            )
            {
                var message = $"interact_event: {eventSummary.Id} at [{targetPosition.X}, {targetPosition.Y}]";
                GD.Print(message);
                SetDebugStatus(message);
                PreviewEventCommands(eventSummary);
                return;
            }
        }

        var noneMessage = $"interact_event: none at [{targetPosition.X}, {targetPosition.Y}]";
        GD.Print(noneMessage);
        SetDebugStatus(noneMessage);
    }

    private void TryReportTouchEvent()
    {
        foreach (var eventSummary in _currentMapEvents)
        {
            if (
                eventSummary.Trigger == "touch" &&
                eventSummary.Position.X == _currentPlayerPosition.X &&
                eventSummary.Position.Y == _currentPlayerPosition.Y
            )
            {
                var message = $"touch_event: {eventSummary.Id} at [{_currentPlayerPosition.X}, {_currentPlayerPosition.Y}]";
                GD.Print(message);
                SetDebugStatus(message);
                PreviewEventCommands(eventSummary);
                return;
            }
        }
    }

    private void PreviewEventCommands(MapEventSummary eventSummary)
    {
        if (eventSummary.Commands.Count == 0)
        {
            var emptyMessage = $"command_preview: {eventSummary.Id} commands=0";
            GD.Print(emptyMessage);
            SetDebugStatus(emptyMessage);
            return;
        }

        for (var index = 0; index < eventSummary.Commands.Count; index += 1)
        {
            GD.Print(FormatCommandPreview(eventSummary.Id, index, eventSummary.Commands[index]));
        }

        SetDebugStatus($"command_preview: {eventSummary.Id} commands={eventSummary.Commands.Count}");
    }

    private static string FormatCommandPreview(string eventId, int index, Variant commandValue)
    {
        var prefix = $"command_preview: {eventId}[{index}]";
        if (commandValue.VariantType != Variant.Type.Dictionary)
        {
            return $"{prefix} malformed_command";
        }

        var command = commandValue.AsGodotDictionary();
        var type = GetPreviewString(command, "type");

        if (type == "show_message")
        {
            return $"{prefix} show_message speaker={GetPreviewString(command, "speaker")} " +
                $"text=\"{GetPreviewText(command, "text")}\"";
        }

        if (type == "choice")
        {
            return $"{prefix} choice prompt=\"{GetPreviewText(command, "prompt")}\" " +
                $"options={GetPreviewArrayCount(command, "options")}";
        }

        if (type == "set_flag" || type == "unset_flag" || type == "if_flag")
        {
            return $"{prefix} {type} flag={GetPreviewString(command, "flag")}";
        }

        if (type == "give_item" || type == "take_item")
        {
            return $"{prefix} {type} item={GetPreviewString(command, "item")} " +
                $"quantity={GetPreviewNumber(command, "quantity")}";
        }

        if (type == "transfer_player")
        {
            return $"{prefix} transfer_player map={GetPreviewString(command, "map")} " +
                $"position={GetPreviewPosition(command, "position")}";
        }

        if (type == "start_battle")
        {
            return $"{prefix} start_battle enemy={GetPreviewString(command, "enemy")}";
        }

        if (type == "play_bgm")
        {
            return $"{prefix} play_bgm bgm={GetPreviewString(command, "bgm")}";
        }

        if (type == "play_sfx")
        {
            return $"{prefix} play_sfx sfx={GetPreviewString(command, "sfx")}";
        }

        return $"{prefix} unsupported_command type={type}";
    }

    private static string GetPreviewString(Dictionary command, string key)
    {
        if (!command.ContainsKey(key) || command[key].VariantType != Variant.Type.String)
        {
            return "?";
        }

        return SanitizePreviewText(command[key].AsString());
    }

    private static string GetPreviewText(Dictionary command, string key)
    {
        return TruncatePreviewText(GetPreviewString(command, key));
    }

    private static string GetPreviewNumber(Dictionary command, string key)
    {
        if (!command.ContainsKey(key) || !IsNumber(command[key]))
        {
            return "?";
        }

        return command[key].ToString();
    }

    private static string GetPreviewArrayCount(Dictionary command, string key)
    {
        if (!command.ContainsKey(key) || command[key].VariantType != Variant.Type.Array)
        {
            return "?";
        }

        return command[key].AsGodotArray().Count.ToString();
    }

    private static string GetPreviewPosition(Dictionary command, string key)
    {
        if (!command.ContainsKey(key) || command[key].VariantType != Variant.Type.Array)
        {
            return "?";
        }

        var position = command[key].AsGodotArray();
        if (position.Count < 2 || !IsNumber(position[0]) || !IsNumber(position[1]))
        {
            return "?";
        }

        return $"[{ToInt(position[0])}, {ToInt(position[1])}]";
    }

    private static string SanitizePreviewText(string value)
    {
        return value.Replace("\r", " ").Replace("\n", " ").Replace("\"", "\\\"");
    }

    private static string TruncatePreviewText(string value)
    {
        const int maxLength = 40;
        const int prefixLength = 37;
        return value.Length > maxLength ? $"{value.Substring(0, prefixLength)}..." : value;
    }

    private void SetDebugStatus(string message)
    {
        if (_debugStatusLabel != null)
        {
            _debugStatusLabel.Text = $"Status: {message}";
        }
    }

    private void UpdateCell(GridPosition position)
    {
        if (_debugCells.TryGetValue(PositionKey(position), out var label))
        {
            label.Text = MarkerForPosition(position);
        }
    }

    private bool IsWithinMapBounds(GridPosition position)
    {
        return position.X >= 0 &&
            position.Y >= 0 &&
            position.X < _currentMapSize.X &&
            position.Y < _currentMapSize.Y;
    }

    private string PlayerMarkerForFacing()
    {
        if (_currentFacingDirection == FacingDirection.Up)
        {
            return "^";
        }

        if (_currentFacingDirection == FacingDirection.Down)
        {
            return "v";
        }

        if (_currentFacingDirection == FacingDirection.Left)
        {
            return "<";
        }

        return ">";
    }

    private string FacingDirectionLabel()
    {
        if (_currentFacingDirection == FacingDirection.Up)
        {
            return "up";
        }

        if (_currentFacingDirection == FacingDirection.Down)
        {
            return "down";
        }

        if (_currentFacingDirection == FacingDirection.Left)
        {
            return "left";
        }

        return "right";
    }

    private GridPosition FacingTargetPosition()
    {
        var delta = DeltaForFacingDirection();
        return new GridPosition(
            _currentPlayerPosition.X + delta.X,
            _currentPlayerPosition.Y + delta.Y,
            true
        );
    }

    private GridPosition DeltaForFacingDirection()
    {
        if (_currentFacingDirection == FacingDirection.Up)
        {
            return new GridPosition(0, -1, true);
        }

        if (_currentFacingDirection == FacingDirection.Down)
        {
            return new GridPosition(0, 1, true);
        }

        if (_currentFacingDirection == FacingDirection.Left)
        {
            return new GridPosition(-1, 0, true);
        }

        return new GridPosition(1, 0, true);
    }

    private static GridPosition MovementDeltaForKey(Key key)
    {
        if (key == Key.Up || key == Key.W)
        {
            return new GridPosition(0, -1, true);
        }

        if (key == Key.Down || key == Key.S)
        {
            return new GridPosition(0, 1, true);
        }

        if (key == Key.Left || key == Key.A)
        {
            return new GridPosition(-1, 0, true);
        }

        if (key == Key.Right || key == Key.D)
        {
            return new GridPosition(1, 0, true);
        }

        return GridPosition.Invalid;
    }

    private static bool IsInteractKey(Key key)
    {
        return key == Key.Enter || key == Key.Space || key == Key.Z;
    }

    private static FacingDirection FacingDirectionForDelta(GridPosition delta)
    {
        if (delta.Y < 0)
        {
            return FacingDirection.Up;
        }

        if (delta.Y > 0)
        {
            return FacingDirection.Down;
        }

        if (delta.X < 0)
        {
            return FacingDirection.Left;
        }

        return FacingDirection.Right;
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
                GetEventsOnMap(events, startMap)
            );
        }

        var mapSize = GetGridPosition(map, "size", $"maps.{startMap}.size");
        var collisionPositions = GetGridPositionArray(map, "collision", $"maps.{startMap}.collision");
        var mapEvents = GetEventsOnMap(events, startMap);

        return new MapSummary(
            FormatGridPosition(mapSize),
            mapSize,
            collisionPositions,
            mapEvents
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

    private static List<MapEventSummary> GetEventsOnMap(Dictionary events, string mapId)
    {
        var mapEvents = new List<MapEventSummary>();
        if (events.Count == 0 || mapId.StartsWith("<"))
        {
            return mapEvents;
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

            var eventId = GetString(eventDefinition, "id", eventEntry.Key.ToString(), $"events.{eventEntry.Key}.id");
            var trigger = GetString(eventDefinition, "trigger", "<missing trigger>", $"events.{eventEntry.Key}.trigger");
            var position = GetGridPosition(eventDefinition, "position", $"events.{eventEntry.Key}.position");
            var commands = GetCommandArray(eventDefinition, $"events.{eventEntry.Key}.commands");
            if (position.IsValid)
            {
                mapEvents.Add(new MapEventSummary(eventId, trigger, position, commands));
            }
            else
            {
                GD.PushWarning($"Skipping event marker '{eventEntry.Key}' because its position is invalid.");
            }
        }

        mapEvents.Sort((left, right) => string.CompareOrdinal(left.Id, right.Id));
        return mapEvents;
    }

    private static Array GetCommandArray(Dictionary eventDefinition, string path)
    {
        if (!eventDefinition.ContainsKey("commands"))
        {
            GD.PushWarning($"Missing array field '{path}'.");
            return new Array();
        }

        var commands = eventDefinition["commands"];
        if (commands.VariantType != Variant.Type.Array)
        {
            GD.PushWarning($"Field '{path}' must be an array.");
            return new Array();
        }

        return commands.AsGodotArray();
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
            List<MapEventSummary> events
        )
        {
            Size = size;
            SizePosition = sizePosition;
            CollisionPositions = collisionPositions;
            Events = events;
        }

        public string Size { get; }
        public GridPosition SizePosition { get; }
        public List<GridPosition> CollisionPositions { get; }
        public List<MapEventSummary> Events { get; }
        public List<GridPosition> EventPositions
        {
            get
            {
                var positions = new List<GridPosition>();
                foreach (var eventSummary in Events)
                {
                    positions.Add(eventSummary.Position);
                }

                return positions;
            }
        }
        public int CollisionCount => CollisionPositions.Count;
        public int EventCount => Events.Count;
    }

    private readonly struct MapEventSummary
    {
        public MapEventSummary(string id, string trigger, GridPosition position, Array commands)
        {
            Id = id;
            Trigger = trigger;
            Position = position;
            Commands = commands;
        }

        public string Id { get; }
        public string Trigger { get; }
        public GridPosition Position { get; }
        public Array Commands { get; }
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

    private enum FacingDirection
    {
        Up,
        Down,
        Left,
        Right
    }
}

using Godot;

public partial class BattleSpike : Node
{
    private const string HeroName = "Hero";
    private const int HeroMaxHp = 30;
    private const int HeroDamage = 6;
    private const string EnemyName = "Slime";
    private const int EnemyMaxHp = 16;
    private const int EnemyDamage = 3;

    private Label _enemyHpLabel;
    private Label _heroHpLabel;
    private Label _messageLabel;
    private Label _inputLabel;

    private int _heroHp = HeroMaxHp;
    private int _enemyHp = EnemyMaxHp;
    private BattlePhase _phase = BattlePhase.AwaitingInput;
    private string _message = "A Slime appears!";

    public override void _Ready()
    {
        DisplayServer.WindowSetMinSize(new Vector2I(900, 520));
        DisplayServer.WindowSetSize(new Vector2I(900, 520));

        CreateLabel("BattleTitle", "Battle Spike", new Vector2(32, 32), 34);
        _enemyHpLabel = CreateLabel("EnemyHp", "", new Vector2(32, 96), 28);
        _heroHpLabel = CreateLabel("HeroHp", "", new Vector2(32, 140), 28);
        _messageLabel = CreateLabel("BattleMessage", "", new Vector2(32, 216), 28);
        _inputLabel = CreateLabel("BattleInput", "", new Vector2(32, 400), 22);

        UpdateHud();
        GD.Print("battle_spike: A Slime appears!");
    }

    public override void _UnhandledInput(InputEvent @event)
    {
        var keyEvent = @event as InputEventKey;
        if (keyEvent == null || !keyEvent.Pressed || keyEvent.Echo)
        {
            return;
        }

        if (!IsConfirmKey(keyEvent.Keycode))
        {
            return;
        }

        AdvanceBattle();
        GetViewport().SetInputAsHandled();
    }

    private Label CreateLabel(string name, string text, Vector2 position, int fontSize)
    {
        var label = new Label
        {
            Name = name,
            Text = text,
            Position = position
        };
        label.AddThemeFontSizeOverride("font_size", fontSize);
        AddChild(label);
        return label;
    }

    private void AdvanceBattle()
    {
        if (_phase != BattlePhase.AwaitingInput)
        {
            return;
        }

        _enemyHp = System.Math.Max(0, _enemyHp - HeroDamage);
        if (_enemyHp <= 0)
        {
            _message = "Hero attacks!\nSlime takes 6 damage.\nSlime is defeated!\nVictory!";
            _phase = BattlePhase.Victory;
            UpdateHud();
            GD.Print("battle_spike: victory");
            return;
        }

        _heroHp = System.Math.Max(0, _heroHp - EnemyDamage);
        if (_heroHp <= 0)
        {
            _message = "Hero attacks!\nSlime takes 6 damage.\nSlime attacks!\nHero takes 3 damage.\nHero is defeated...\nDefeat.";
            _phase = BattlePhase.Defeat;
            UpdateHud();
            GD.Print("battle_spike: defeat");
            return;
        }

        _message = "Hero attacks!\nSlime takes 6 damage.\nSlime attacks!\nHero takes 3 damage.";
        UpdateHud();
        GD.Print($"battle_spike: round_complete hero_hp={_heroHp} slime_hp={_enemyHp}");
    }

    private void UpdateHud()
    {
        _enemyHpLabel.Text = $"{EnemyName} HP: {_enemyHp}/{EnemyMaxHp}";
        _heroHpLabel.Text = $"{HeroName} HP: {_heroHp}/{HeroMaxHp}";
        _messageLabel.Text = $"Message:\n{_message}";
        _inputLabel.Text = _phase == BattlePhase.AwaitingInput
            ? "Input: Enter / Space / Z = Attack"
            : "Input: battle ended";
    }

    private static bool IsConfirmKey(Key key)
    {
        return key == Key.Enter || key == Key.KpEnter || key == Key.Space || key == Key.Z;
    }

    private enum BattlePhase
    {
        AwaitingInput,
        Victory,
        Defeat
    }
}

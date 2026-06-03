import type { ReactNode } from "react";
import { joinClassNames } from "./shared.js";

export type CommandListItem = {
  id: string;
  label: string;
  description?: ReactNode;
  status?: "normal" | "warning" | "error" | "disabled";
  children?: CommandListItem[];
};

export type CommandListProps = {
  commands: CommandListItem[];
  renderCommand?: (command: CommandListItem) => ReactNode;
  onAdd?: (parentId?: string) => void;
  onRemove?: (id: string) => void;
  onMove?: (id: string, direction: "up" | "down") => void;
  onSelect?: (id: string) => void;
  className?: string;
};

export function CommandList({ commands, renderCommand, onAdd, onRemove, onMove, onSelect, className }: CommandListProps) {
  return (
    <div className={joinClassNames("rdk-command-list", className)}>
      <CommandItems commands={commands} renderCommand={renderCommand} onAdd={onAdd} onMove={onMove} onRemove={onRemove} onSelect={onSelect} />
      {onAdd ? (
        <button className="rdk-command-list__add" type="button" onClick={() => onAdd()}>
          Add
        </button>
      ) : null}
    </div>
  );
}

function CommandItems(props: Required<Pick<CommandListProps, "commands">> & Omit<CommandListProps, "commands" | "className">) {
  const { commands, renderCommand, onAdd, onRemove, onMove, onSelect } = props;

  return (
    <ol className="rdk-command-list__items">
      {commands.map((command) => (
        <li className="rdk-command-list__item" data-status={command.status ?? "normal"} key={command.id}>
          <div className="rdk-command-list__row">
            <button disabled={command.status === "disabled"} type="button" onClick={() => onSelect?.(command.id)}>
              {renderCommand ? renderCommand(command) : <DefaultCommand command={command} />}
            </button>
            {onMove ? (
              <span className="rdk-command-list__move">
                <button type="button" onClick={() => onMove(command.id, "up")}>
                  Up
                </button>
                <button type="button" onClick={() => onMove(command.id, "down")}>
                  Down
                </button>
              </span>
            ) : null}
            {onRemove ? (
              <button type="button" onClick={() => onRemove(command.id)}>
                Remove
              </button>
            ) : null}
          </div>
          {command.children?.length ? (
            <CommandItems commands={command.children} renderCommand={renderCommand} onAdd={onAdd} onMove={onMove} onRemove={onRemove} onSelect={onSelect} />
          ) : null}
          {onAdd ? (
            <button className="rdk-command-list__add-child" type="button" onClick={() => onAdd(command.id)}>
              Add child
            </button>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function DefaultCommand({ command }: { command: CommandListItem }) {
  return (
    <span className="rdk-command-list__content">
      <strong>{command.label}</strong>
      {command.description ? <span>{command.description}</span> : null}
    </span>
  );
}

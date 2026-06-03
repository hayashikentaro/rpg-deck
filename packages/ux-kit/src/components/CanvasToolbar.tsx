import { joinClassNames } from "./shared.js";

export type CanvasToolbarAction = {
  id: string;
  label: string;
  title?: string;
  disabled?: boolean;
};

export type CanvasToolbarProps = {
  actions: CanvasToolbarAction[];
  activeActionId?: string;
  onAction?: (id: string) => void;
  className?: string;
};

export function CanvasToolbar({ actions, activeActionId, onAction, className }: CanvasToolbarProps) {
  return (
    <div className={joinClassNames("rdk-canvas-toolbar", className)} role="toolbar">
      {actions.map((action) => (
        <button
          aria-pressed={activeActionId === action.id}
          data-active={activeActionId === action.id}
          disabled={action.disabled}
          key={action.id}
          title={action.title}
          type="button"
          onClick={() => onAction?.(action.id)}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}

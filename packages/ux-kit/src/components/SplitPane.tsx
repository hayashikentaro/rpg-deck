import type { ReactNode } from "react";
import { joinClassNames } from "./shared.js";

export type SplitPaneProps = {
  direction: "horizontal" | "vertical";
  primary: ReactNode;
  secondary: ReactNode;
  defaultSize?: number;
  sizeLabel?: string;
  className?: string;
};

export function SplitPane({ direction, primary, secondary, defaultSize, sizeLabel, className }: SplitPaneProps) {
  return (
    <section
      aria-label={sizeLabel}
      className={joinClassNames("rdk-split-pane", `rdk-split-pane--${direction}`, className)}
      data-default-size={defaultSize}
      data-direction={direction}
    >
      <div className="rdk-split-pane__primary">{primary}</div>
      <div className="rdk-split-pane__secondary">{secondary}</div>
    </section>
  );
}

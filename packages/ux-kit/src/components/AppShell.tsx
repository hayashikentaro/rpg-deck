import type { ReactNode } from "react";
import { joinClassNames } from "./shared.js";

export type AppShellProps = {
  header?: ReactNode;
  sidebar?: ReactNode;
  main: ReactNode;
  inspector?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function AppShell({ header, sidebar, main, inspector, footer, className }: AppShellProps) {
  return (
    <div className={joinClassNames("rdk-app-shell", className)}>
      {header ? <header className="rdk-app-shell__header">{header}</header> : null}
      <div className="rdk-app-shell__body">
        {sidebar ? <aside className="rdk-app-shell__sidebar">{sidebar}</aside> : null}
        <main className="rdk-app-shell__main">{main}</main>
        {inspector ? <aside className="rdk-app-shell__inspector">{inspector}</aside> : null}
      </div>
      {footer ? <footer className="rdk-app-shell__footer">{footer}</footer> : null}
    </div>
  );
}

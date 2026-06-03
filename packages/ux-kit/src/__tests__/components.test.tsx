import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  AppShell,
  CanvasToolbar,
  CommandList,
  DiffCard,
  InspectorPanel,
  PropertyGrid,
  ReferencePicker,
  ValidationIssueList
} from "../index.js";

describe("ux-kit components", () => {
  it("AppShell renders supplied regions", () => {
    const html = renderToStaticMarkup(
      <AppShell header="Header" sidebar="Sidebar" main="Main" inspector="Inspector" footer="Footer" />
    );

    expect(html).toContain("Header");
    expect(html).toContain("Sidebar");
    expect(html).toContain("Main");
    expect(html).toContain("Inspector");
    expect(html).toContain("Footer");
  });

  it("InspectorPanel renders section and field labels", () => {
    const html = renderToStaticMarkup(
      <InspectorPanel
        title="Inspector"
        sections={[
          {
            id: "identity",
            title: "Identity",
            fields: [{ id: "name", label: "Name", value: "Example" }]
          }
        ]}
      />
    );

    expect(html).toContain("Identity");
    expect(html).toContain("Name");
    expect(html).toContain("Example");
  });

  it("PropertyGrid renders text, select, boolean, and reference fields", () => {
    const html = renderToStaticMarkup(
      <PropertyGrid
        fields={[
          { id: "title", kind: "text", label: "Title", value: "Draft" },
          { id: "mode", kind: "select", label: "Mode", value: "a", options: [{ value: "a", label: "Mode A" }] },
          { id: "enabled", kind: "boolean", label: "Enabled", value: true },
          { id: "owner", kind: "reference", label: "Owner", value: "person-1", options: [{ value: "person-1", label: "Person 1" }] }
        ]}
      />
    );

    expect(html).toContain("Title");
    expect(html).toContain("Mode A");
    expect(html).toContain("Enabled");
    expect(html).toContain("Person 1");
  });

  it("CommandList renders nested command labels", () => {
    const html = renderToStaticMarkup(
      <CommandList
        commands={[
          {
            id: "parent",
            label: "Parent command",
            children: [{ id: "child", label: "Child command" }]
          }
        ]}
      />
    );

    expect(html).toContain("Parent command");
    expect(html).toContain("Child command");
  });

  it("DiffCard renders accept, reject, and hold actions when provided", () => {
    const html = renderToStaticMarkup(
      <DiffCard
        title="Review"
        changes={[{ id: "change-1", type: "changed", entityType: "entity", entityId: "entity-1", path: "entities.entity-1" }]}
        actions={{ onAccept: () => {}, onReject: () => {}, onHold: () => {} }}
      />
    );

    expect(html).toContain("Accept");
    expect(html).toContain("Reject");
    expect(html).toContain("Hold");
  });

  it("ValidationIssueList renders error, warning, and info issues", () => {
    const html = renderToStaticMarkup(
      <ValidationIssueList
        issues={[
          { severity: "error", code: "required", message: "Required" },
          { severity: "warning", code: "risky", message: "Risky" },
          { severity: "info", code: "note", message: "Note" }
        ]}
      />
    );

    expect(html).toContain("error");
    expect(html).toContain("warning");
    expect(html).toContain("info");
  });

  it("ReferencePicker renders options", () => {
    const html = renderToStaticMarkup(
      <ReferencePicker
        value="alpha"
        options={[
          { id: "alpha", label: "Alpha", group: "Group A" },
          { id: "beta", label: "Beta" }
        ]}
      />
    );

    expect(html).toContain("Alpha");
    expect(html).toContain("Beta");
    expect(html).toContain("Group A");
  });

  it("CanvasToolbar renders actions", () => {
    const html = renderToStaticMarkup(
      <CanvasToolbar activeActionId="select" actions={[{ id: "select", label: "Select" }, { id: "pan", label: "Pan" }]} />
    );

    expect(html).toContain("Select");
    expect(html).toContain("Pan");
    expect(html).toContain("aria-pressed=\"true\"");
  });
});

import { joinClassNames } from "./shared.js";

export type ReferencePickerOption = {
  id: string;
  label: string;
  description?: string;
  group?: string;
  disabled?: boolean;
};

export type ReferencePickerProps = {
  value?: string;
  options: ReferencePickerOption[];
  placeholder?: string;
  onChange?: (value: string) => void;
  onCreate?: () => void;
  onJumpToTarget?: (value: string) => void;
  className?: string;
};

export function ReferencePicker({ value = "", options, placeholder, onChange, onCreate, onJumpToTarget, className }: ReferencePickerProps) {
  return (
    <div className={joinClassNames("rdk-reference-picker", className)}>
      <select aria-label={placeholder ?? "Reference"} value={value} onChange={(event) => onChange?.(event.target.value)}>
        {placeholder ? <option value="">{placeholder}</option> : null}
        {groupOptions(options).map((group) =>
          group.label ? (
            <optgroup key={group.label} label={group.label}>
              {group.options.map((option) => (
                <option disabled={option.disabled} key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </optgroup>
          ) : (
            group.options.map((option) => (
              <option disabled={option.disabled} key={option.id} value={option.id}>
                {option.label}
              </option>
            ))
          )
        )}
      </select>
      {onCreate ? (
        <button type="button" onClick={onCreate}>
          Create
        </button>
      ) : null}
      {onJumpToTarget ? (
        <button disabled={!value} type="button" onClick={() => onJumpToTarget(value)}>
          Jump
        </button>
      ) : null}
      {selectedOptionDescription(options, value) ? <p>{selectedOptionDescription(options, value)}</p> : null}
    </div>
  );
}

function groupOptions(options: ReferencePickerOption[]) {
  const groups = new Map<string, ReferencePickerOption[]>();
  for (const option of options) {
    const group = option.group ?? "";
    groups.set(group, [...(groups.get(group) ?? []), option]);
  }
  return [...groups.entries()].map(([label, groupOptions]) => ({ label, options: groupOptions }));
}

function selectedOptionDescription(options: ReferencePickerOption[], value: string) {
  return options.find((option) => option.id === value)?.description;
}

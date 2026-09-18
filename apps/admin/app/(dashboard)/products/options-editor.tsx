"use client";

import { XIcon } from "lucide-react";

import type { OptionDefinition, OptionType } from "@storepulse/api-client";
import { Button } from "@storepulse/ui/components/button";
import { Input } from "@storepulse/ui/components/input";

const OPTION_TYPES: { value: OptionType; label: string }[] = [
  { value: "select", label: "Choice list (e.g. size, color)" },
  { value: "text", label: "Free text (e.g. engraving, note)" },
  { value: "number", label: "Number (e.g. custom length)" },
];

/**
 * Generic product-options editor — no category-specific UI (no "flavor" or
 * "color" hardcoded anywhere). A tenant defines any option as a name + one
 * of three generic types; `choices` only applies to `select`. Mirrors the
 * backend's `OptionDefinition` shape exactly (`app/schemas/product.py`) so
 * what's built here round-trips through create/edit without transformation.
 */
export function OptionsEditor({
  options,
  onChange,
}: {
  options: OptionDefinition[];
  onChange: (options: OptionDefinition[]) => void;
}) {
  function addOption() {
    onChange([...options, { name: "", type: "select", choices: [], required: false }]);
  }

  function updateOption(index: number, patch: Partial<OptionDefinition>) {
    onChange(options.map((opt, i) => (i === index ? { ...opt, ...patch } : opt)));
  }

  function removeOption(index: number) {
    onChange(options.filter((_, i) => i !== index));
  }

  function addChoice(index: number) {
    const option = options[index];
    if (!option) return;
    updateOption(index, { choices: [...option.choices, ""] });
  }

  function updateChoice(optionIndex: number, choiceIndex: number, value: string) {
    const option = options[optionIndex];
    if (!option) return;
    const choices = option.choices.map((c, i) => (i === choiceIndex ? value : c));
    updateOption(optionIndex, { choices });
  }

  function removeChoice(optionIndex: number, choiceIndex: number) {
    const option = options[optionIndex];
    if (!option) return;
    updateOption(optionIndex, { choices: option.choices.filter((_, i) => i !== choiceIndex) });
  }

  return (
    <div className="flex flex-col gap-4">
      {options.map((option, index) => (
        <div key={index} className="flex flex-col gap-3 rounded-md border p-3">
          <div className="flex items-start gap-2">
            <div className="flex flex-1 flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Option name</label>
              <Input
                value={option.name}
                onChange={(e) => updateOption(index, { name: e.target.value })}
                placeholder="e.g. Size"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Type</label>
              <select
                value={option.type}
                onChange={(e) =>
                  updateOption(index, {
                    type: e.target.value as OptionType,
                    choices: e.target.value === "select" ? option.choices : [],
                  })
                }
                className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
              >
                {OPTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mt-5"
              onClick={() => removeOption(index)}
              aria-label="Remove option"
            >
              <XIcon />
            </Button>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={option.required}
              onChange={(e) => updateOption(index, { required: e.target.checked })}
              className="size-4"
            />
            Required
          </label>

          {option.type === "select" ? (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-muted-foreground">Choices</label>
              {option.choices.map((choice, choiceIndex) => (
                <div key={choiceIndex} className="flex items-center gap-2">
                  <Input
                    value={choice}
                    onChange={(e) => updateChoice(index, choiceIndex, e.target.value)}
                    placeholder="e.g. Small"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeChoice(index, choiceIndex)}
                    aria-label="Remove choice"
                  >
                    <XIcon />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-start"
                onClick={() => addChoice(index)}
              >
                Add choice
              </Button>
              {option.choices.length === 0 ? (
                <p className="text-xs text-destructive">
                  A choice-list option needs at least one choice.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" className="self-start" onClick={addOption}>
        Add option
      </Button>
    </div>
  );
}

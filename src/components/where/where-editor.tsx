"use client";

import { EditorButton, EditorInput } from "@/components/ui/editor-controls";

export type WhereLocationFormValue = {
  label: string;
  coordinates: string;
  atLocal: string;
  note: string;
};

type WhereEditorProps = {
  title: string;
  value: WhereLocationFormValue;
  submitLabel: string;
  disabled?: boolean;
  onChange: (nextValue: WhereLocationFormValue) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  testId?: string;
};

export function WhereEditor({
  title,
  value,
  submitLabel,
  disabled = false,
  onChange,
  onSubmit,
  onCancel,
  testId,
}: WhereEditorProps) {
  return (
    <section className="where-editor" aria-label={title} data-testid={testId}>
      <div className="where-editor__grid">
        <label className="where-editor__field">
          <span className="where-editor__label">location</span>
          <EditorInput
            value={value.label}
            onChange={(event) => onChange({ ...value, label: event.target.value })}
            disabled={disabled}
          />
        </label>

        <label className="where-editor__field">
          <span className="where-editor__label">time</span>
          <EditorInput
            type="datetime-local"
            value={value.atLocal}
            onChange={(event) => onChange({ ...value, atLocal: event.target.value })}
            disabled={disabled}
          />
        </label>

        <label className="where-editor__field where-editor__field--full">
          <span className="where-editor__label">coordinates</span>
          <EditorInput
            value={value.coordinates}
            onChange={(event) => onChange({ ...value, coordinates: event.target.value })}
            disabled={disabled}
            placeholder="37.7749, -122.4194"
          />
        </label>
      </div>

      <label className="where-editor__field">
        <span className="where-editor__label">note</span>
        <textarea
          className="editor-input where-editor__textarea"
          value={value.note}
          onChange={(event) => onChange({ ...value, note: event.target.value })}
          disabled={disabled}
        />
      </label>

      <div className="where-editor__actions">
        <EditorButton
          onClick={onSubmit}
          disabled={disabled}
        >
          {submitLabel}
        </EditorButton>
        {onCancel ? (
          <EditorButton onClick={onCancel} disabled={disabled}>
            cancel
          </EditorButton>
        ) : null}
      </div>
    </section>
  );
}

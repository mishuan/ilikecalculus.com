import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { classNames } from "@/components/ui/class-names";

type EditorInputProps = InputHTMLAttributes<HTMLInputElement>;

export function EditorInput({ className, ...props }: EditorInputProps) {
  return <input className={classNames("editor-input", className)} {...props} />;
}

type EditorTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function EditorTextarea({ className, ...props }: EditorTextareaProps) {
  return <textarea className={classNames("editor-input", "editor-textarea", className)} {...props} />;
}

type EditorButtonVariant = "default" | "danger";

type EditorButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: EditorButtonVariant;
};

export function EditorButton({
  className,
  variant = "default",
  type = "button",
  ...props
}: EditorButtonProps) {
  return (
    <button
      type={type}
      className={classNames(
        "editor-button",
        variant === "danger" ? "editor-button--danger" : "editor-button--default",
        className,
      )}
      {...props}
    />
  );
}

type EditorChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
  add?: boolean;
};

export function EditorChip({
  className,
  selected = false,
  add = false,
  type = "button",
  ...props
}: EditorChipProps) {
  return (
    <button
      type={type}
      className={classNames(
        "editor-chip",
        selected && "editor-chip--selected",
        add && "editor-chip--add",
        className,
      )}
      {...props}
    />
  );
}

type EditorStatusTone = "muted" | "success" | "error";

type EditorStatusProps = HTMLAttributes<HTMLElement> & {
  as?: "span" | "p";
  tone?: EditorStatusTone;
};

export function EditorStatus({
  as = "span",
  tone = "muted",
  className,
  ...props
}: EditorStatusProps) {
  const Tag = as;

  return (
    <Tag
      className={classNames(
        "editor-status",
        tone === "error"
          ? "editor-status--error"
          : tone === "success"
            ? "editor-status--success"
            : "editor-status--muted",
        className,
      )}
      {...props}
    />
  );
}

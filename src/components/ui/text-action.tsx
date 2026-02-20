import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes } from "react";

type TextActionTone = "default" | "muted";
type TextActionUnderline = "underline" | "none";

type TextActionOptions = {
  tone?: TextActionTone;
  underline?: TextActionUnderline;
  className?: string;
};

function joinClassNames(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(" ");
}

export function textActionClassName({
  tone = "default",
  underline = "underline",
  className,
}: TextActionOptions = {}) {
  return joinClassNames(
    "text-action",
    tone === "muted" ? "text-action--muted" : "text-action--default",
    underline === "none" ? "text-action--plain" : "text-action--underline",
    className,
  );
}

type TextActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & TextActionOptions;

export function TextActionButton({
  tone,
  underline,
  className,
  type = "button",
  ...props
}: TextActionButtonProps) {
  return <button type={type} className={textActionClassName({ tone, underline, className })} {...props} />;
}

type TextActionLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & TextActionOptions;

export function TextActionLink({
  tone,
  underline,
  className,
  ...props
}: TextActionLinkProps) {
  return <a className={textActionClassName({ tone, underline, className })} {...props} />;
}

type TextActionLabelProps = HTMLAttributes<HTMLSpanElement> & TextActionOptions;

export function TextActionLabel({ tone, underline, className, ...props }: TextActionLabelProps) {
  return <span className={textActionClassName({ tone, underline, className })} {...props} />;
}

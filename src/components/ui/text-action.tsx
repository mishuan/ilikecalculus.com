import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { classNames } from "@/components/ui/class-names";

type TextActionTone = "default" | "muted";
type TextActionUnderline = "underline" | "none" | "hover";

type TextActionOptions = {
  tone?: TextActionTone;
  underline?: TextActionUnderline;
  className?: string;
};

export function textActionClassName({
  tone = "default",
  underline = "underline",
  className,
}: TextActionOptions = {}) {
  return classNames(
    "text-action",
    "interactive-lift",
    tone === "muted" ? "text-action--muted" : "text-action--default",
    underline === "none"
      ? "text-action--plain"
      : underline === "hover"
        ? "text-action--hover"
        : "text-action--underline",
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

type ExternalTextLinkProps = Omit<TextActionLinkProps, "target"> & {
  marker?: ReactNode;
  markerClassName?: string;
  showMarker?: boolean;
};

function mergeExternalRel(value?: string) {
  const tokens = new Set((value ?? "").split(/\s+/).filter(Boolean));
  tokens.add("noopener");
  tokens.add("noreferrer");
  return Array.from(tokens).join(" ");
}

export function ExternalTextLink({
  underline = "hover",
  marker = "↗",
  markerClassName,
  showMarker = true,
  rel,
  className,
  children,
  ...props
}: ExternalTextLinkProps) {
  return (
    <TextActionLink
      {...props}
      target="_blank"
      rel={mergeExternalRel(rel)}
      underline={underline}
      className={classNames("external-text-link", className)}
    >
      {children}
      {showMarker ? (
        <span className={classNames("external-text-link__marker", markerClassName)} aria-hidden="true">
          {marker}
        </span>
      ) : null}
    </TextActionLink>
  );
}

type TextActionLabelProps = HTMLAttributes<HTMLSpanElement> & TextActionOptions;

export function TextActionLabel({ tone, underline, className, ...props }: TextActionLabelProps) {
  return <span className={textActionClassName({ tone, underline, className })} {...props} />;
}

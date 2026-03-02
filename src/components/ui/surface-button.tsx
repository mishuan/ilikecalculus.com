import type { ButtonHTMLAttributes } from "react";
import { classNames } from "@/components/ui/class-names";

type SurfaceButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
};

export function SurfaceButton({
  className,
  selected = false,
  type = "button",
  ...props
}: SurfaceButtonProps) {
  return (
    <button
      type={type}
      className={classNames("surface-button", selected && "surface-button--selected", className)}
      {...props}
    />
  );
}

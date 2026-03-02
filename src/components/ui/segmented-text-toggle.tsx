import { classNames } from "@/components/ui/class-names";
import { TextActionButton, TextActionLabel, TextActionLink } from "@/components/ui/text-action";

type SegmentedTextToggleOption<TValue extends string> = {
  value: TValue;
  label: string;
  testId?: string;
  href?: string;
  onSelect?: (value: TValue) => void;
};

type SegmentedTextToggleProps<TValue extends string> = {
  value: TValue;
  options: ReadonlyArray<SegmentedTextToggleOption<TValue>>;
  ariaLabel?: string;
  testId?: string;
  className?: string;
  itemWrapClassName?: string;
  itemClassName?: string;
  selectedItemClassName?: string;
  separatorClassName?: string;
  separator?: string;
};

function SegmentedTextToggleItem<TValue extends string>({
  option,
  isSelected,
  itemClassName,
  selectedItemClassName,
}: {
  option: SegmentedTextToggleOption<TValue>;
  isSelected: boolean;
  itemClassName?: string;
  selectedItemClassName?: string;
}) {
  const className = classNames(itemClassName, isSelected && selectedItemClassName);

  if (option.onSelect) {
    return (
      <TextActionButton
        type="button"
        className={className}
        underline={isSelected ? "underline" : "hover"}
        aria-pressed={isSelected}
        data-testid={option.testId}
        onClick={() => option.onSelect?.(option.value)}
      >
        {option.label}
      </TextActionButton>
    );
  }

  if (option.href && !isSelected) {
    return (
      <TextActionLink
        href={option.href}
        className={className}
        underline="hover"
        data-testid={option.testId}
      >
        {option.label}
      </TextActionLink>
    );
  }

  return (
    <TextActionLabel
      className={className}
      underline="underline"
      data-testid={option.testId}
    >
      {option.label}
    </TextActionLabel>
  );
}

export function SegmentedTextToggle<TValue extends string>({
  value,
  options,
  ariaLabel,
  testId,
  className,
  itemWrapClassName,
  itemClassName,
  selectedItemClassName,
  separatorClassName,
  separator = "/",
}: SegmentedTextToggleProps<TValue>) {
  return (
    <div className={className} data-testid={testId} role="group" aria-label={ariaLabel}>
      {options.map((option, index) => {
        const isSelected = option.value === value;
        return (
          <span key={option.value} className={itemWrapClassName}>
            <SegmentedTextToggleItem
              option={option}
              isSelected={isSelected}
              itemClassName={itemClassName}
              selectedItemClassName={selectedItemClassName}
            />
            {index < options.length - 1 ? (
              <span className={separatorClassName} aria-hidden="true">
                {separator}
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  value?: string;
  onChange?: (e: { target: { value: string; name?: string } }) => void;
  options?: SelectOption[];
  children?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  sizeVariant?: "sm" | "md";
  fullWidth?: boolean;
  className?: string;
}

/**
 * vite-js (Minimals UI) ArrowDownIcon
 * https://icon-sets.iconify.design/eva/arrow-ios-downward-fill/
 */
function ArrowDownIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 16a1 1 0 0 1-.64-.23l-6-5a1 1 0 1 1 1.28-1.54L12 13.71l5.36-4.32a1 1 0 0 1 1.41.15a1 1 0 0 1-.14 1.46l-6 4.83A1 1 0 0 1 12 16" />
    </svg>
  );
}

export function Select({
  value = "",
  onChange,
  options,
  children,
  placeholder,
  disabled = false,
  required = false,
  name,
  sizeVariant = "sm",
  fullWidth = false,
  className = "",
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract options either from options prop or by parsing <option> children
  const parsedOptions: SelectOption[] = useMemo(() => {
    if (options && options.length > 0) return options;

    const items: SelectOption[] = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement<React.OptionHTMLAttributes<HTMLOptionElement>>(child)) {
        const val = child.props.value !== undefined ? String(child.props.value) : "";
        const label =
          child.props.children !== undefined
            ? String(child.props.children)
            : val;
        items.push({
          value: val,
          label: label,
          disabled: Boolean(child.props.disabled),
        });
      }
    });
    return items;
  }, [options, children]);

  // Handle click outside to close popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = useMemo(
    () => parsedOptions.find((opt) => opt.value === value),
    [parsedOptions, value]
  );

  const displayLabel = useMemo(() => {
    if (selectedOption) return selectedOption.label;
    if (placeholder) return placeholder;
    return parsedOptions[0]?.label || "";
  }, [selectedOption, placeholder, parsedOptions]);

  const isPlaceholderSelected = !value || selectedOption?.disabled;

  const sizeStyles = {
    sm: "h-9 text-xs px-3",
    md: "h-10 text-sm px-3.5",
  };

  const handleSelect = (optValue: string) => {
    if (onChange) {
      onChange({ target: { value: optValue, name } });
    }
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${fullWidth ? "w-full" : ""}`}
    >
      {/* Custom Trigger Button matching vite-js Select */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`flex items-center justify-between gap-2.5 rounded-lg border border-[var(--hairline)] bg-[var(--surface-raised)]/60 transition-all duration-150 font-sans ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:border-[var(--amber)]"
        } ${
          isOpen
            ? "border-[var(--amber)] ring-1 ring-[var(--amber)] shadow-xs"
            : ""
        } ${sizeStyles[sizeVariant]} ${fullWidth ? "w-full" : ""} ${className}`}
      >
        <span
          className={`truncate text-left ${
            isPlaceholderSelected
              ? "text-[var(--ink-faint)] font-normal"
              : "text-[var(--ink)] font-semibold"
          }`}
        >
          {displayLabel}
        </span>
        <ArrowDownIcon
          className={`h-4 w-4 text-[var(--amber)] shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Floating Popover Dropdown Menu matching vite-js MenuItem style */}
      {isOpen && (
        <div className="absolute left-0 right-0 z-[120] mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-[var(--hairline)] bg-[var(--surface)] p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-100 space-y-0.5">
          {parsedOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                disabled={opt.disabled}
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 flex items-center justify-between ${
                  opt.disabled
                    ? "text-[var(--ink-faint)] opacity-40 cursor-not-allowed italic"
                    : isSelected
                    ? "bg-[var(--amber)]/15 text-[var(--amber)] font-bold"
                    : "text-[var(--ink)] hover:bg-[var(--surface-raised)] hover:text-[var(--amber)] cursor-pointer"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && !opt.disabled && (
                  <span className="text-[var(--amber)] text-xs font-bold shrink-0 ml-2">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

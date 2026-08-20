"use client";

import React, { ButtonHTMLAttributes, forwardRef } from "react";

export type ButtonVariant = "contained" | "outlined" | "soft" | "text";
export type ButtonColor = "primary" | "inherit" | "error" | "success" | "warning" | "info";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "contained",
      color = "primary",
      size = "md",
      fullWidth = false,
      startIcon,
      endIcon,
      className = "",
      disabled = false,
      type = "button",
      ...props
    },
    ref
  ) => {
    // Base Minimals UI Button style: 8px border-radius, Public Sans, font-bold 700, no uppercase transform
    const baseStyles =
      "inline-flex items-center justify-center font-bold font-sans rounded-lg transition-all duration-150 active:scale-98 focus:outline-none disabled:opacity-45 disabled:pointer-events-none disabled:shadow-none select-none";

    const widthStyles = fullWidth ? "w-full" : "";

    // Size variants matching vite-js height and padding
    const sizeStyles: Record<ButtonSize, string> = {
      sm: "h-7 text-xs px-2.5 gap-1.5",
      md: "h-9 text-sm px-3.5 gap-2",
      lg: "h-12 text-base px-4.5 gap-2.5",
    };

    // Style matrix for variants & colors matching Minimals UI Kit (vite-js)
    let colorStyles = "";

    if (variant === "contained") {
      if (color === "primary") {
        colorStyles =
          "bg-[var(--amber)] text-[#FFFFFF] hover:opacity-90 hover:shadow-md shadow-xs shadow-[var(--amber)]/30";
      } else if (color === "inherit") {
        colorStyles =
          "bg-[var(--ink)] text-[var(--bg)] hover:opacity-85 shadow-xs";
      } else if (color === "error") {
        colorStyles =
          "bg-[var(--danger)] text-[#FFFFFF] hover:opacity-90 shadow-xs shadow-[var(--danger)]/30";
      } else if (color === "success") {
        colorStyles =
          "bg-[var(--sage)] text-[#FFFFFF] hover:opacity-90 shadow-xs";
      } else if (color === "info") {
        colorStyles =
          "bg-[#00B8D9] text-[#FFFFFF] hover:opacity-90 shadow-xs";
      } else if (color === "warning") {
        colorStyles =
          "bg-[#FFAB00] text-[#1C252E] hover:opacity-90 shadow-xs";
      }
    } else if (variant === "soft") {
      if (color === "primary") {
        colorStyles =
          "bg-[var(--amber)]/15 text-[var(--amber)] hover:bg-[var(--amber)]/25";
      } else if (color === "inherit") {
        colorStyles =
          "bg-[var(--hairline)]/40 text-[var(--ink)] hover:bg-[var(--hairline)]/70";
      } else if (color === "error") {
        colorStyles =
          "bg-[var(--danger)]/15 text-[var(--danger)] hover:bg-[var(--danger)]/25";
      } else if (color === "success") {
        colorStyles =
          "bg-[var(--sage)]/15 text-[var(--sage)] hover:bg-[var(--sage)]/25";
      } else if (color === "info") {
        colorStyles =
          "bg-[#00B8D9]/15 text-[#00B8D9] hover:bg-[#00B8D9]/25";
      } else if (color === "warning") {
        colorStyles =
          "bg-[#FFAB00]/15 text-[#FFAB00] hover:bg-[#FFAB00]/25";
      }
    } else if (variant === "outlined") {
      if (color === "primary") {
        colorStyles =
          "border border-[var(--amber)]/60 text-[var(--amber)] hover:bg-[var(--amber)]/10 hover:border-[var(--amber)]";
      } else if (color === "inherit") {
        colorStyles =
          "border border-[var(--hairline)] text-[var(--ink)] hover:bg-[var(--hairline)]/30 hover:border-[var(--ink-muted)]";
      } else if (color === "error") {
        colorStyles =
          "border border-[var(--danger)]/60 text-[var(--danger)] hover:bg-[var(--danger)]/10";
      } else {
        colorStyles =
          "border border-[var(--hairline)] text-[var(--ink)] hover:bg-[var(--hairline)]/20";
      }
    } else if (variant === "text") {
      if (color === "primary") {
        colorStyles =
          "text-[var(--amber)] hover:bg-[var(--amber)]/12";
      } else if (color === "inherit") {
        colorStyles =
          "text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--hairline)]/30";
      } else if (color === "error") {
        colorStyles =
          "text-[var(--danger)] hover:bg-[var(--danger)]/12";
      } else {
        colorStyles =
          "text-[var(--ink)] hover:bg-[var(--hairline)]/20";
      }
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={`${baseStyles} ${sizeStyles[size]} ${widthStyles} ${colorStyles} ${className}`}
        {...props}
      >
        {startIcon && <span className="inline-flex shrink-0">{startIcon}</span>}
        <span>{children}</span>
        {endIcon && <span className="inline-flex shrink-0">{endIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

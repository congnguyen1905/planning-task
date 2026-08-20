"use client";

import React from "react";
import { useThemeContext, PRIMARY_COLOR_PRESETS, PrimaryColorPreset } from "@/contexts/ThemeContext";

export function SettingsDrawer() {
  const {
    settings,
    canReset,
    openDrawer,
    onCloseDrawer,
    onOpenDrawer,
    onUpdateField,
    onReset,
  } = useThemeContext();

  return (
    <>
      {/* Floating Settings Button */}
      <button
        type="button"
        onClick={onOpenDrawer}
        title="Theme Settings"
        aria-label="Open Theme Settings"
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--hairline)] bg-[var(--surface)] text-[var(--ink)] shadow-xl transition-all duration-200 hover:scale-105 hover:border-[var(--amber)] hover:text-[var(--amber)] active:scale-95"
      >
        <svg
          className="h-6 w-6 animate-spin-slow"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {/* Backdrop */}
      {openDrawer && (
        <div
          onClick={onCloseDrawer}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Slide-over Drawer Panel */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-80 max-w-full border-l border-[var(--hairline)] bg-[var(--surface)] p-6 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col justify-between overflow-y-auto ${
          openDrawer ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-4">
            <h2 className="font-display text-xl italic text-[var(--ink)]">Theme Settings</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onReset}
                disabled={!canReset}
                title="Reset to defaults"
                className="rounded p-1.5 text-xs font-mono text-[var(--ink-muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--amber)] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={onCloseDrawer}
                className="rounded p-1.5 text-[var(--ink-muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--ink)] transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Style Option */}
          <div className="space-y-2">
            <label className="font-mono text-xs uppercase tracking-wider text-[var(--ink-faint)]">
              Style
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onUpdateField("style", "minimal")}
                className={`flex flex-col items-center justify-center rounded border p-3 text-xs font-mono transition-all ${
                  (settings.style || "minimal") === "minimal"
                    ? "border-[var(--amber)] bg-[var(--surface-raised)] text-[var(--amber)] shadow-sm"
                    : "border-[var(--hairline)] text-[var(--ink-muted)] hover:border-[var(--ink-faint)]"
                }`}
              >
                <span className="mb-1 text-base">✨</span>
                Minimal
              </button>
              <button
                type="button"
                onClick={() => onUpdateField("style", "classic")}
                className={`flex flex-col items-center justify-center rounded border p-3 text-xs font-mono transition-all ${
                  settings.style === "classic"
                    ? "border-[var(--amber)] bg-[var(--surface-raised)] text-[var(--amber)] shadow-sm"
                    : "border-[var(--hairline)] text-[var(--ink-muted)] hover:border-[var(--ink-faint)]"
                }`}
              >
                <span className="mb-1 text-base">🏛️</span>
                Classic
              </button>
            </div>
          </div>

          {/* Mode Option */}
          <div className="space-y-2">
            <label className="font-mono text-xs uppercase tracking-wider text-[var(--ink-faint)]">
              Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onUpdateField("colorScheme", "light")}
                className={`flex flex-col items-center justify-center rounded border p-3 text-xs font-mono transition-all ${
                  settings.colorScheme === "light"
                    ? "border-[var(--amber)] bg-[var(--surface-raised)] text-[var(--amber)] shadow-sm"
                    : "border-[var(--hairline)] text-[var(--ink-muted)] hover:border-[var(--ink-faint)]"
                }`}
              >
                <span className="mb-1 text-base">☀️</span>
                Light
              </button>
              <button
                type="button"
                onClick={() => onUpdateField("colorScheme", "dark")}
                className={`flex flex-col items-center justify-center rounded border p-3 text-xs font-mono transition-all ${
                  settings.colorScheme === "dark"
                    ? "border-[var(--amber)] bg-[var(--surface-raised)] text-[var(--amber)] shadow-sm"
                    : "border-[var(--hairline)] text-[var(--ink-muted)] hover:border-[var(--ink-faint)]"
                }`}
              >
                <span className="mb-1 text-base">🌙</span>
                Dark
              </button>
            </div>
          </div>

          {/* Contrast Option */}
          <div className="space-y-2">
            <label className="font-mono text-xs uppercase tracking-wider text-[var(--ink-faint)]">
              Contrast
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onUpdateField("contrast", "default")}
                className={`rounded border p-2.5 text-center text-xs font-mono transition-all ${
                  settings.contrast === "default"
                    ? "border-[var(--amber)] bg-[var(--surface-raised)] text-[var(--amber)]"
                    : "border-[var(--hairline)] text-[var(--ink-muted)] hover:border-[var(--ink-faint)]"
                }`}
              >
                Default
              </button>
              <button
                type="button"
                onClick={() => onUpdateField("contrast", "bold")}
                className={`rounded border p-2.5 text-center text-xs font-mono transition-all ${
                  settings.contrast === "bold"
                    ? "border-[var(--amber)] bg-[var(--surface-raised)] text-[var(--amber)]"
                    : "border-[var(--hairline)] text-[var(--ink-muted)] hover:border-[var(--ink-faint)]"
                }`}
              >
                Bold
              </button>
            </div>
          </div>

          {/* Presets Option */}
          <div className="space-y-2">
            <label className="font-mono text-xs uppercase tracking-wider text-[var(--ink-faint)]">
              Presets Color
            </label>
            <div className="grid grid-cols-3 gap-3 pt-1">
              {PRIMARY_COLOR_PRESETS.map((preset) => {
                const selected = settings.primaryColor === preset.name;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => onUpdateField("primaryColor", preset.name as PrimaryColorPreset)}
                    className={`flex flex-col items-center justify-center rounded border p-2.5 text-xs font-mono transition-all ${
                      selected
                        ? "border-[var(--amber)] bg-[var(--surface-raised)]"
                        : "border-[var(--hairline)] hover:border-[var(--ink-faint)]"
                    }`}
                  >
                    <span
                      className={`h-6 w-6 rounded-full border transition-transform ${
                        selected ? "scale-110 ring-2 ring-offset-2 ring-offset-[var(--surface)]" : ""
                      }`}
                      style={{
                        backgroundColor: preset.main,
                        borderColor: selected ? "var(--amber)" : "transparent",
                      }}
                    />
                    <span
                      className={`mt-1 text-[11px] capitalize ${
                        selected ? "text-[var(--amber)] font-bold" : "text-[var(--ink-muted)]"
                      }`}
                    >
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Compact Layout Option */}
          <div className="space-y-2 pt-2 border-t border-[var(--hairline)]">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-mono text-xs uppercase tracking-wider text-[var(--ink-faint)]">
                Compact Layout
              </span>
              <input
                type="checkbox"
                checked={settings.compactLayout}
                onChange={(e) => onUpdateField("compactLayout", e.target.checked)}
                className="h-4 w-4 rounded border border-[var(--hairline)] bg-[var(--bg)] accent-[var(--amber)] cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-6 border-t border-[var(--hairline)] text-center">
          <p className="font-mono text-[11px] text-[var(--ink-faint)]">
            Minimal Theme Preset System
          </p>
        </div>
      </aside>
    </>
  );
}

"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export type ColorScheme = "dark" | "light";
export type PrimaryColorPreset = "default" | "cyan" | "purple" | "blue" | "orange" | "red";
export type ContrastMode = "default" | "bold";
export type LayoutStyle = "minimal" | "classic";

export interface ThemeSettings {
  colorScheme: ColorScheme;
  primaryColor: PrimaryColorPreset;
  contrast: ContrastMode;
  compactLayout: boolean;
  style: LayoutStyle;
}

export const defaultSettings: ThemeSettings = {
  colorScheme: "dark",
  primaryColor: "default",
  contrast: "default",
  compactLayout: false,
  style: "minimal",
};

// Exact color palettes from vite-js (Minimals UI Kit v6)
export const PRIMARY_COLOR_PRESETS: { name: PrimaryColorPreset; label: string; main: string; light: string; dark: string }[] = [
  { name: "default", label: "Emerald (Default)", main: "#00A76F", light: "#5BE49B", dark: "#007867" },
  { name: "cyan", label: "Cyan", main: "#078DEE", light: "#68CDF9", dark: "#0351AB" },
  { name: "purple", label: "Purple", main: "#7635dc", light: "#B985F4", dark: "#431A9E" },
  { name: "blue", label: "Blue", main: "#0C68E9", light: "#6BB1F8", dark: "#063BA7" },
  { name: "orange", label: "Orange", main: "#fda92d", light: "#FED680", dark: "#B66816" },
  { name: "red", label: "Red", main: "#FF3030", light: "#FFC1AC", dark: "#B71833" },
];

interface ThemeContextType {
  settings: ThemeSettings;
  canReset: boolean;
  openDrawer: boolean;
  onToggleDrawer: () => void;
  onCloseDrawer: () => void;
  onOpenDrawer: () => void;
  onUpdateField: <K extends keyof ThemeSettings>(field: K, value: ThemeSettings[K]) => void;
  onReset: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { state: settings, setField, resetState, canReset } = useLocalStorage<ThemeSettings>("app-settings", defaultSettings);
  const [openDrawer, setOpenDrawer] = useState(false);

  const onToggleDrawer = useCallback(() => setOpenDrawer((prev) => !prev), []);
  const onCloseDrawer = useCallback(() => setOpenDrawer(false), []);
  const onOpenDrawer = useCallback(() => setOpenDrawer(true), []);

  const onUpdateField = useCallback(
    <K extends keyof ThemeSettings>(field: K, value: ThemeSettings[K]) => {
      setField(field, value);
    },
    [setField]
  );

  useEffect(() => {
    const root = document.documentElement;
    
    // Apply data attributes
    root.setAttribute("data-theme", settings.colorScheme);
    root.setAttribute("data-color", settings.primaryColor);
    root.setAttribute("data-contrast", settings.contrast);
    root.setAttribute("data-compact", settings.compactLayout ? "true" : "false");
    root.setAttribute("data-style", settings.style || "minimal");

    // Dynamic primary color CSS variable updates matching vite-js
    const preset = PRIMARY_COLOR_PRESETS.find((p) => p.name === settings.primaryColor) || PRIMARY_COLOR_PRESETS[0];
    root.style.setProperty("--amber", preset.main);
    root.style.setProperty("--amber-light", preset.light);
    root.style.setProperty("--amber-dark", preset.dark);
  }, [settings]);

  const value = useMemo(
    () => ({
      settings,
      canReset,
      openDrawer,
      onToggleDrawer,
      onCloseDrawer,
      onOpenDrawer,
      onUpdateField,
      onReset: resetState,
    }),
    [settings, canReset, openDrawer, onToggleDrawer, onCloseDrawer, onOpenDrawer, onUpdateField, resetState]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
}

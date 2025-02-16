import { createContext, useContext } from "react";
import { Theme } from "./types";

const theme: Theme = {
  colors: {
    primary: "#1a365d",
    secondary: "#2b4c7e",
    accent: "#3182ce",
    background: "#f7fafc",
    surface: "#ffffff",
    text: "#1a202c",
    error: "#e53e3e",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

const ThemeContext = createContext<Theme>(theme);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext); 
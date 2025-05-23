export const lightTheme = {
  background: "#FFFFFF",
  card: "#F9FAFB",
  foreground: "#111827",
  border: "#E5E7EB",
  primary: "#EC8500", // Orange
  "primary-foreground": "#FFFFFF",
  "primary-muted": "rgba(236, 133, 0, 0.1)",
  muted: "#F3F4F6",
  "muted-foreground": "#6B7280",
  success: "#10B981",
  "success-foreground": "#FFFFFF",
  destructive: "#EF4444",
  "destructive-foreground": "#FFFFFF",
};

export const darkTheme = {
  background: "#1F2937",
  card: "#111827",
  foreground: "#F9FAFB",
  border: "#374151",
  primary: "#EC8500", // Orange
  "primary-foreground": "#FFFFFF",
  "primary-muted": "rgba(236, 133, 0, 0.2)",
  muted: "#374151",
  "muted-foreground": "#9CA3AF",
  success: "#10B981",
  "success-foreground": "#FFFFFF",
  destructive: "#EF4444",
  "destructive-foreground": "#FFFFFF",
};

// Helper to get current theme values
export function getThemeValues(isDark: boolean) {
  return isDark ? darkTheme : lightTheme;
}

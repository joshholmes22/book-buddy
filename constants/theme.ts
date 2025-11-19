/**
 * Book Buddy Theme Colors
 * Beautiful, warm colors inspired by classic libraries and cozy reading nooks
 */

import { Platform } from "react-native";

const tintColorLight = "#8B4513"; // Saddle Brown - classic book spine color
const tintColorDark = "#F4A460"; // Sandy Brown - warm reading light

export const Colors = {
  light: {
    text: "#2C1810", // Dark chocolate brown
    background: "#FFF8F0", // Warm off-white like aged paper
    tint: tintColorLight,
    icon: "#8B7355", // Muted brown
    tabIconDefault: "#A0826D",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#F5E6D3", // Cream text
    background: "#1A1410", // Deep espresso
    tint: tintColorDark,
    icon: "#9B8B7E",
    tabIconDefault: "#8B7969",
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

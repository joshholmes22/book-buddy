// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolViewProps, SymbolWeight } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<
  SymbolViewProps["name"],
  ComponentProps<typeof MaterialIcons>["name"]
>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // Original mappings
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",

  // Tab bar icons
  "books.vertical.fill": "library-books",
  "books.vertical": "library-books",
  "qrcode.viewfinder": "qr-code-scanner",
  qrcode: "qr-code",
  sparkles: "auto-awesome",
  casino: "casino",
  shuffle: "shuffle",

  // Other app icons
  "camera.fill": "camera-alt",
  xmark: "close",
  magnifyingglass: "search",
  "line.3.horizontal.decrease.circle.fill": "filter-list",
  "chevron.up.circle.fill": "expand-less",
  "chevron.down.circle.fill": "expand-more",
  "star.fill": "star",
  star: "star-border",
  trash: "delete",
  "square.and.pencil": "edit",
  "checkmark.circle.fill": "check-circle",
  "xmark.circle.fill": "cancel",
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name]}
      style={style}
    />
  );
}

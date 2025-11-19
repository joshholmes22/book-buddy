import { useTheme } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";

export default function TabBarBackground() {
  const { colors } = useTheme();
  return (
    <View
      style={[StyleSheet.absoluteFill, { backgroundColor: colors.card + "f0" }]}
    />
  );
}

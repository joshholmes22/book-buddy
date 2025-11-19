import { Tabs } from "expo-router";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import TabBarBackground from "@/components/ui/tab-bar-background";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useTheme } from "@react-navigation/native";

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          position: "absolute",
          height: 85,
          paddingBottom: 10,
          paddingTop: 8,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0.1,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: -5 },
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: -4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Library",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              name={focused ? "books.vertical.fill" : "books.vertical"}
              size={28}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              name={focused ? "qrcode.viewfinder" : "qrcode"}
              size={28}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="wheel"
        options={{
          title: "Pick",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="casino" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Stats",
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              name={focused ? "chart.bar.fill" : "chart.bar"}
              size={28}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

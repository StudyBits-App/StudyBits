import { Tabs, router } from "expo-router";
import React from "react";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useSession } from "@/context/ctx";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, isLoading } = useSession();

  if (!user) router.replace("/authentication/signIn");

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          unmountOnBlur: true,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "home" : "home-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="question"
        options={{
          title: "Create",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "add-circle" : "add-circle-sharp"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="answer"
        options={{
          title: "Answer",
          unmountOnBlur: true,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "pencil" : "pencil-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="channelPages"
        options={{
          headerShown: true,
          title: "My Channel",
          unmountOnBlur: true,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "person-circle" : "person-circle-sharp"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          unmountOnBlur: true,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? "cog" : "cog-outline"} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="homePages"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="channelExternalPages"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="viewChannelPages"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

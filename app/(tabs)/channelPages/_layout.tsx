import React from "react";
import {
  createMaterialTopTabNavigator,
  MaterialTopTabNavigationOptions,
  MaterialTopTabNavigationEventMap,
} from "@react-navigation/material-top-tabs";
import { withLayoutContext } from "expo-router";
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import { useUserChannel } from "@/context/userChannel";
import CreateChannelPage from "@/screens/CreateChannel";
import LoadingScreen from "@/screens/LoadingScreen";

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default function ChannelLayout() {
  const { hasChannel, loading } = useUserChannel();

  if (loading) {
    return <LoadingScreen />;
  }

  return hasChannel ? (
    <MaterialTopTabs
      screenOptions={{
        tabBarStyle: { backgroundColor: "#1E1E1E" },
        tabBarLabelStyle: { color: "#fff" },
        tabBarIndicatorStyle: { backgroundColor: "#3B9EBF" },
      }}
    >
      <MaterialTopTabs.Screen
        name="channelPage"
        options={{ title: "Channel" }}
      />
      <MaterialTopTabs.Screen
        name="questionPage"
        options={{ title: "Questions" }}
      />
    </MaterialTopTabs>
  ) : (
    <CreateChannelPage />
  );
}

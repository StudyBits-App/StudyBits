import React from "react";
import {
  createMaterialTopTabNavigator,
  MaterialTopTabNavigationOptions,
  MaterialTopTabNavigationEventMap,
} from "@react-navigation/material-top-tabs";
import { useLocalSearchParams, withLayoutContext } from "expo-router";
import { ParamListBase, TabNavigationState } from "@react-navigation/native";

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default function ViewChannelLayout() {
  const { id } = useLocalSearchParams();

  return (
    <MaterialTopTabs
      screenOptions={{
        tabBarContentContainerStyle: {marginTop: 70},
        tabBarStyle: { backgroundColor: "#1E1E1E" },
        tabBarLabelStyle: { color: "#fff" },
        tabBarIndicatorStyle: { backgroundColor: "#3B9EBF" },
      }}
    >
      <MaterialTopTabs.Screen
        name="channelPageView"
        options={{ title: "Channel" }}
        initialParams={{id}}
      />
      <MaterialTopTabs.Screen
        name="questionPageView"
        options={{ title: "Questions" }}
        initialParams={{id}}
      />
    </MaterialTopTabs>
  )
}

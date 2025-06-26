import React, { useState } from "react";
import { useWindowDimensions } from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { useLocalSearchParams } from "expo-router";
import ViewChannelPage from "@/screens/ViewChannelPage";
import UserQuestionsPage from "@/screens/ViewQuestions";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ViewChannelLayout() {
  const layout = useWindowDimensions();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets(); 

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "channelPageView", title: "Channel" },
    { key: "questionPageView", title: "Questions" },
  ]);

  const renderScene = SceneMap({
    channelPageView: () => <ViewChannelPage componentId={id as string} />,
    questionPageView: () => <UserQuestionsPage componentId={id as string} />,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#1E1E1E" }}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        style={{ backgroundColor: "#1E1E1E" }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            style={{
              backgroundColor: "#1E1E1E",
              paddingTop: insets.top,
            }}
            labelStyle={{ color: "white" }}
            indicatorStyle={{ backgroundColor: "#3B9EBF" }}
          />
        )}
      />
    </GestureHandlerRootView>
  );
}

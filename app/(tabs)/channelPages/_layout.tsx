import React, { useState } from "react";
import { useWindowDimensions } from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { useUserChannel } from "@/context/userChannel";
import CreateChannelPage from "@/screens/CreateChannel";
import LoadingScreen from "@/screens/LoadingScreen";
import UserChannelPage from "@/screens/ChannelPage";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import UserQuestionsPage from "@/screens/ViewQuestions";

export default function ChannelLayout() {
  const layout = useWindowDimensions();
  const { hasChannel, loading } = useUserChannel();

  const [index, setIndex] = useState(0);

  const [routes] = useState([
    { key: "channelPage", title: "Channel" },
    { key: "questionPage", title: "Questions" },
  ]);

  const renderScene = SceneMap({
    channelPage: UserChannelPage,
    questionPage: UserQuestionsPage,
  });

  if (loading) {
    return <LoadingScreen />;
  }

  if (!hasChannel) {
    return <CreateChannelPage />;
  }

  return (
    <GestureHandlerRootView>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            style={{ backgroundColor: "#1E1E1E" }}
            labelStyle={{ color: "white" }}
            indicatorStyle={{ backgroundColor: "#3B9EBF" }}
          />
        )}
      />
    </GestureHandlerRootView>
  );
}

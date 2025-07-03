import React, { useEffect, useState } from "react";
import { useWindowDimensions } from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { useSession } from "@/context/ctx";
import CreateChannelPage from "@/screens/CreateChannel";
import LoadingScreen from "@/screens/LoadingScreen";
import UserChannelPage from "@/screens/ChannelPage";
import UserQuestionsPage from "@/screens/ViewQuestions";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import firestore from "@react-native-firebase/firestore";

export default function ChannelLayout() {
  const layout = useWindowDimensions();
  const { user } = useSession();

  const [loading, setLoading] = useState(true);
  const [hasChannel, setHasChannel] = useState(false);
  const [index, setIndex] = useState(0);

  const [routes] = useState([
    { key: "channelPage", title: "Channel" },
    { key: "questionPage", title: "Questions" },
  ]);

  const renderScene = {
    channelPage: UserChannelPage,
    questionPage: UserQuestionsPage,
  };

  useEffect(() => {
    const checkChannel = async () => {
      if (!user) return;

      try {
        const snapshot = await firestore()
          .collection("channels")
          .doc(user.uid)
          .get();

        setHasChannel(snapshot.exists);
      } catch (err) {
        console.error("Error checking user channel:", err);
      } finally {
        setLoading(false);
      }
    };

    checkChannel();
  }, [user]);

  if (loading) return <LoadingScreen />;
  if (!hasChannel) return <CreateChannelPage />;

  return (
    <GestureHandlerRootView>
      <TabView
        navigationState={{ index, routes }}
        renderScene={SceneMap(renderScene)}
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

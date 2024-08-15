import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import UserChannelPage from "@/screens/ChannelPage";
import UserQuestionsPage from "@/screens/ViewQuestions";
import { useUserChannel } from "@/context/userChannel";
import CreateChannelPage from "@/screens/CreateChannel";
import LoadingScreen from "@/screens/LoadingScreen";

const Tab = createMaterialTopTabNavigator();

const ChannelTopTabs = () => {
  const { hasChannel, loading } = useUserChannel();

  if (loading) {
    return <LoadingScreen />;
  }
  
  return hasChannel ? (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: "#1E1E1E" },
        tabBarLabelStyle: { color: "#fff" },
        tabBarIndicatorStyle: { backgroundColor: "#3B9EBF" },
      }}
    >
      <Tab.Screen name="Channel" component={UserChannelPage} />
      <Tab.Screen name="Questions" component={UserQuestionsPage} />
    </Tab.Navigator>
  ) : (
    <CreateChannelPage />
  );
};

export default ChannelTopTabs;

import UserQuestionsPage from "@/screens/ViewQuestions";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function ViewQuestions() {
  return (
    <GestureHandlerRootView>
      <UserQuestionsPage />
    </GestureHandlerRootView>
  );
}

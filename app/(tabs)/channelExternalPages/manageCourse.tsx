import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ManageCoursesPage from "@/screens/ManageCourse";

export default function ManageCourse() {
  return (
    <GestureHandlerRootView>
      <ManageCoursesPage />
    </GestureHandlerRootView>
  );
}

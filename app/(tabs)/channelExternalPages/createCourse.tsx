import React from "react";
import CreateCourse from "@/screens/CreateCourse";
import { ToastProvider } from "react-native-toast-notifications";
import { View, Text } from "react-native";

export default function createCourse() {
  return (
    <ToastProvider
      renderType={{
        custom_type: (toast) => (
          <View style={{ padding: 15, backgroundColor: "grey" }}>
            <Text>{toast.message}</Text>
          </View>
        ),
      }}
    >
      <CreateCourse />
    </ToastProvider>
  );
}

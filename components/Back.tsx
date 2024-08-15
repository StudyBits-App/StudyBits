import React from "react";
import { router } from "expo-router";
import { StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

interface BackProps {
  link: string;
  params: { [key: string]: string | number };
  title: string;
}

const Back: React.FC<BackProps> = ({ link, params }) => {
  const redirect = () => {
    router.push({
      pathname: link as any,
      params: params,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AntDesign
        name="leftcircle"
        size={30}
        color={"#3B9EBF"}
        onPress={redirect}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#1E1E1E",
  },
});

export default Back;
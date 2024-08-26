import React from "react";
import { router } from "expo-router";
import { StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

interface BackProps {
  link?: string;
  params?: { [key: string]: string | number };
  trueBack?: boolean;
}

const Back: React.FC<BackProps> = ({ link, params, trueBack }) => {
  const redirect = () => {
    if (trueBack) {
      router.back();
    } else if (link) {
      router.push({
        pathname: link as any,
        params: params,
      });
    }
  };

  return (
      <AntDesign
        name="leftcircle"
        size={30}
        color={"#3B9EBF"}
        onPress={redirect}
      />
  );
};

export default Back;

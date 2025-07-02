import React from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSession } from "@/context/ctx";
import auth from "@react-native-firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SettingsScreen: React.FC = () => {
  const { user } = useSession();
  const insets = useSafeAreaInsets();

  const logout = async () => {
    try {
      await AsyncStorage.clear();
      await auth().signOut();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Settings</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.userInfo}>Logged in as {user?.displayName}</Text>
        <Pressable style={styles.button} onPress={logout}>
          <Text style={styles.text}>Logout</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  userInfo: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    backgroundColor: "black",
    elevation: 3,
  },
  text: {
    color: "white",
    fontSize: 16,
  },
});

export default SettingsScreen;

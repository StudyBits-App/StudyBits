import React from "react";
import { StyleSheet, View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSession } from "@/context/ctx";
import { router } from "expo-router";
import auth from "@react-native-firebase/auth";

const HomeScreen: React.FC = () => {
  const { user } = useSession();

  const addLearning = () => {
    router.push("/homePages/addLearning");
  };

  const viewLearning = () => {
    router.push("/homePages/viewLearning");
  };

  const search = () => {
    router.push("/homePages/search");
  };

  const logout = async () => {
    auth().signOut();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>{user?.displayName}</Text>
          <Pressable style={styles.profileButton} onPress={search}>
            <Ionicons name="search" size={40} color="#fff" />
          </Pressable>
        </View>

        <Pressable style={styles.learnContainer} onPress={viewLearning}>
          <LinearGradient
            colors={["#4c669f", "#3b5998", "#192f6a"]}
            style={styles.learnCard}
          >
            <Text style={styles.learnText}>What i'm learning</Text>
          </LinearGradient>
        </Pressable>
        <Pressable style={styles.addButton} onPress={addLearning}>
          <Ionicons name="add" size={30} color="#fff" />
        </Pressable>
      </ScrollView>
      {/* <Pressable style={styles.button} onPress={logout}>
        <Text style={styles.text}>Logout</Text>
      </Pressable> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  profileButton: {
    padding: 5,
  },
  learnContainer: {
    marginBottom: 20,
  },
  learnCard: {
    borderRadius: 15,
    padding: 20,
  },
  learnText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 10,
  },
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#4c669f",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  button: {
    marginVertical: "10%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: "black",
  },
  text: {
    color: "white",
  },
});

export default HomeScreen;

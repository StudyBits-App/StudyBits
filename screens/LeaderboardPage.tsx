import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome";
import Back from "@/components/Back";
import { fetchLeaderboardUsers } from "@/services/leaderboardServices";
import { Participant } from "@/utils/interfaces";

const LeaderboardPage: React.FC = () => {

  const [users, setUsers] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    try {
      const leaderboardUsers = await fetchLeaderboardUsers();
      setUsers(leaderboardUsers);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ marginLeft: 25 }}>
        <Back link="/" />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Points Leaderboard</Text>
        <Text style={styles.description}>
          Earn points by answering questions correctly!
        </Text>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <ScrollView style={styles.scrollview}>
            {users.map((info, index) => {
              if (info == null) return null;

              let trophyColor;
              if (index === 0) trophyColor = "#FFD700"; // Gold
              else if (index === 1) trophyColor = "#C0C0C0"; // Silver
              else if (index === 2) trophyColor = "#CD7F32"; // Bronze

              return (
                <View key={index} style={styles.docContainer}>
                  {index < 3 && (
                    <Icon
                      name="trophy"
                      size={20}
                      color={trophyColor}
                      style={styles.icon}
                    />
                  )}
                  <Text style={styles.rank}>{index + 1}.</Text>
                  <Text style={styles.text}>{info.name}</Text>
                  <Text style={styles.points}>{info.points}</Text>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  contentContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    color: "#FFF",
    marginVertical: 20,
    fontWeight: "bold",
  },
  description: {
    fontSize: 16,
    color: "#AAA",
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: "10%",
  },
  scrollview: {
    width: "90%",
  },
  points: {
    position: "absolute",
    right: 15,
    color: "#5AFF5A",
    fontSize: 18,
  },
  docContainer: {
    backgroundColor: "#333333",
    borderRadius: 8,
    paddingVertical: "6%",
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: "5%",
  },
  icon: {
    marginRight: 10,
  },
  rank: {
    color: "#FFF",
    fontSize: 18,
    marginRight: 10,
  },
  text: {
    color: "#FFF",
    fontSize: 18,
  },
});

export default LeaderboardPage;

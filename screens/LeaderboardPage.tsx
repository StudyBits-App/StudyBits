import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import firestore from "@react-native-firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from 'react-native-vector-icons/FontAwesome';

const LeaderboardPage: React.FC = () => {
    type Participant = {
        name: string;
        points: number;
    };
    const [users, setUsers] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDocuments = async () => {
        try {
            const querySnapshot = await firestore()
                .collection('learning')
                .orderBy('accuracy', 'desc')
                .get();
            const docNames = querySnapshot.docs.map(doc => [doc.id, doc.data().accuracy]);

            for (const docName of docNames) {
                let docID = docName[0];
                let points = docName[1];
                const user = await firestore().collection('channels').doc(docID).get();
                if (user.data()?.displayName) setUsers((prev) => [...prev, {
                    name: user.data()?.displayName,
                    points: points
                }]);
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Points Leaderboard</Text>
            <Text style={styles.description}>Earn points by answering questions correctly!</Text>
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
                                    <Icon name="trophy" size={20} color={trophyColor} style={styles.icon} />
                                )}
                                <Text style={styles.rank}>{index + 1}.</Text>
                                <Text style={styles.text}>{info.name}</Text>
                                <Text style={styles.points}>{info.points}</Text>
                            </View>
                        );
                    })}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1E1E1E",
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontSize: 24,
        color: "#FFF",
        marginVertical: 20,
        fontWeight: 'bold'
    },
    description: {
        fontSize: 16,
        color: "#AAA",
        marginBottom: 20,
        textAlign: 'center',
        paddingHorizontal: '10%'
    },
    scrollview: {
        width: '90%'
    },
    points: {
        position: 'absolute',
        right: '10%',
        color: "#5AFF5A",
        fontSize: 18,
    },
    docContainer: {
        backgroundColor: "#333333",
        borderRadius: 8,
        paddingVertical: '6%',
        marginBottom: 15,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: '5%'
    },
    icon: {
        marginRight: 10
    },
    rank: {
        color: "#FFF",
        fontSize: 18,
        marginRight: 10
    },
    text: {
        color: "#FFF",
        fontSize: 18
    }
});

export default LeaderboardPage;
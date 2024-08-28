import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import firestore from "@react-native-firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from 'react-native-vector-icons/FontAwesome';

const LeaderboardPage: React.FC = () => {
    const [users, setUsers] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDocuments = async () => {
        try {
            const querySnapshot = await firestore()
                .collection('learning')
                .orderBy('accuracy', 'desc')
                .get();
            const docNames = querySnapshot.docs.map(doc => doc.id);

            for (const docName of docNames) {
                const user = await firestore().collection('channels').doc(docName).get();
                if (user.data()?.displayName) setUsers((prev) => [...prev, user.data()?.displayName]);
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
            <Text style={styles.title}>Leaderboard</Text>
            {loading ? (
                <ActivityIndicator size="large" />
            ) : (
                <ScrollView style={styles.scrollview}>
                    {users.map((name, index) => {
                        if (name == null) return null;

                        let trophyColor;
                        if (index === 0) trophyColor = "#FFD700"; // Gold
                        else if (index === 1) trophyColor = "#C0C0C0"; // Silver
                        else if (index === 2) trophyColor = "#CD7F32"; // Bronze

                        return (
                            <View key={index} style={styles.docContainer}>
                                {index < 3 && (
                                    <Icon name="trophy" size={20} color={trophyColor} style={styles.icon} />
                                )}
                                <Text style={styles.text}>{name}</Text>
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
        marginVertical: 20
    },
    scrollview: {
        width: '75%'
    },
    docContainer: {
        backgroundColor: "#333333",
        borderRadius: 8,
        paddingVertical: '4%',
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: '5%'
    },
    icon: {
        marginRight: 10
    },
    text: {
        color: "#FFF"
    }
});

export default LeaderboardPage;
import React, { useEffect, useState } from "react"
import { SafeAreaView, ScrollView, StyleSheet, Text, View, FlatList } from "react-native"
import firestore from "@react-native-firebase/firestore"

interface Hint {
    key: string;
    title: string;
    content: string;
    image: string;
}

interface Answer {
    key: string;
    content: string,
    answer: boolean,
}

const AnswerPage: React.FC = () => {
    const [hints, setHints] = useState<Hint[]>([]);
    const [answerChoices, setAnswerChoices] = useState<React.Component[]>([]);
    const [question, setQuestion] = useState<string>();
    const [questionInfo, setQuestionInfo] = useState<any>();

    const fetchQuestionInfo = async () => {
        try {
            const querySnapshot = await firestore().collection('questions').get();
            const data = querySnapshot.docs[Math.floor(Math.random() * querySnapshot.size)].data();
            setQuestionInfo(data);
        } catch (error) {
            console.error('Error fetching question info:', error);
        }
    };

    useEffect(() => {
        fetchQuestionInfo();
    }, [])

    useEffect(() => {
        if (questionInfo) {
            setAnswerChoices(renderAnswer(questionInfo.answers));
            setHints(questionInfo.text);
            setQuestion(questionInfo.question);
        };

    }, [questionInfo]);

    const renderHint = ({ item }: { item: Hint }) => {
        return (
            <View>
                <Text>{item.title}</Text>
            </View>
        )
    }

    const renderAnswer = (answers: Answer[]) => {
        let components: React.Component[] = []
        for (const answer of answers) {
            components.push(
                <View key={answer.key}>
                    <Text>{answer.content}</Text>
                </View>
            );
        }
        return components
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.container}>
                {answerChoices}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1E1E1E",
        paddingHorizontal: 16,
    },
});



export default AnswerPage;
import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import firestore from "@react-native-firebase/firestore";

interface Hint {
    key: string;
    title: string;
    content: string;
    image: string;
}

interface Answer {
    key: string;
    content: string;
    answer: boolean;
}

interface QuestionInfo {
    question: string;
    hints: Hint[];
    answers: Answer[];
}

const AnswerPage: React.FC = () => {
    const [hints, setHints] = useState<Hint[]>([]);
    const [answerChoices, setAnswerChoices] = useState<Answer[]>([]);
    const [question, setQuestion] = useState<string>();
    const [questionInfo, setQuestionInfo] = useState<QuestionInfo | null>(null);

    const fetchQuestionInfo = async () => {
        try {
            const querySnapshot = await firestore().collection('questions').get();
            const data = querySnapshot.docs[Math.floor(Math.random() * querySnapshot.size)].data() as QuestionInfo;
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
            setAnswerChoices(questionInfo.answers);
            setHints(questionInfo.hints);
            setQuestion(questionInfo.question);
        }
    }, [questionInfo]);

    
    const renderHint = ({ item }: { item: Hint }) => (
        <View key={item.key} style={styles.hintContainer}>
            <Text style={styles.text}>{item.title}</Text>
        </View>
    );

    const renderAnswer = ({ item }: { item: Answer }) => (
        <View key={item.key} style={styles.answerContainer}>
            <Text style={styles.text}>{item.content}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.container}>
                {question && <Text style={styles.text}>{question}</Text>}
                {hints.map(hint => renderHint({ item: hint }))}
                {answerChoices.map(answer => renderAnswer({ item: answer }))}
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
    text: {
        color: "#FFF",
    },
    hintContainer: {
        marginVertical: 8,
    },
    answerContainer: {
        marginVertical: 8,
    },
});

export default AnswerPage;

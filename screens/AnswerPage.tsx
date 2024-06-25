import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View, ActivityIndicator, Image, Pressable, Modal, Button } from "react-native";
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
    isSelected: false;
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

    const [hintModalVisible, setHintModalVisible] = useState(false);
    const [hintModalContent, setHintModalContent] = useState<string>('');
    const [hintModalTitle, setHintModalTitle] = useState<string>('');
    const [hintModalImage, setHintModalImage] = useState<string>('');

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

    const toggleSelectedAnswer = (answerKey: string) => {
        setAnswerChoices(prevAnswers =>
            prevAnswers.map(answer =>
                answer.key === answerKey ? { ...answer, answer: !answer.isSelected } : answer
            )
        );
    }

    const handleCancelViewHint = () => {
        setHintModalVisible(false);
        setHintModalContent('');
        setHintModalTitle('');
        setHintModalImage('');
    }

    const trimText = (text: string, maxTitleLength: number): string => {
        if (text.length <= maxTitleLength) {
            return text;
        }
        let trimmedText = text.substring(0, maxTitleLength - 2);
        const lastSpaceIndex = trimmedText.lastIndexOf(' ');

        if (lastSpaceIndex !== -1) {
            trimmedText = trimmedText.substring(0, lastSpaceIndex);
        }
        return trimmedText + '...';
    };

    const renderHint = ({ item }: { item: Hint }) => {
        const truncatedTitle = trimText(item.title, 10);
        const truncatedContent = trimText(item.content, 85);

        return (
            <View key={item.key} style={styles.hintContainer}>
                <Pressable onPress={() => setHintModalVisible(true)}>
                    <View style={styles.hint}>
                        <Text style={[styles.text, styles.title, item.image && item.title ? styles.imageTitle : null]}>{truncatedTitle}</Text>
                        {item.image ? (
                            <View style={styles.imageContainer}>
                                <Image source={{ uri: item.image }} style={styles.image} resizeMode='contain' />
                            </View>
                        ) : null}
                        <Text style={[styles.text, item.image && item.content ? styles.imageContent : null]}>{truncatedContent}</Text>
                    </View>
                </Pressable>
            </View>
        )
    };

    const renderAnswer = ({ item }: { item: Answer }) => (
        <View key={item.key} style={styles.sectionContainer}>
            <Pressable onPress={() => toggleSelectedAnswer}>
                <Text style={styles.text}>{item.content}</Text>
            </Pressable>
        </View>

    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollview}>
                {
                    questionInfo ? (
                        <View>
                            {question && <Text style={[styles.text, styles.question]}>{question}</Text>}
                            {hints.map(hint => renderHint({ item: hint }))}
                            {answerChoices.map(answer => renderAnswer({ item: answer }))}
                        </View>
                    ) : (
                        <ActivityIndicator size="large" />
                    )
                }
            </ScrollView>

            <Modal visible={hintModalVisible} animationType="slide">
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalContentContainer}>
                        <Text style={styles.text}>{hintModalTitle}</Text>
                        <View style={styles.imageContainer}>
                            {hintModalImage ? (
                                <Image source={{ uri: hintModalImage }} style={styles.image} resizeMode='contain' />
                            ) : null}
                        </View>
                        <Text style={styles.text}>{hintModalContent}</Text>
                        <Button onPress={handleCancelViewHint} title="Cancel" color="#FF0D0D" />
                    </View>
                </SafeAreaView>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    title: {
        fontWeight: 'bold'
    },
    scrollview: {
        width: '75%'
    },
    hintContainer: {
        backgroundColor: "#333333",
        borderRadius: 8,
        paddingVertical: '4%',
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: '5%'
    },
    hint: {
        flex: 1
    },
    container: {
        flex: 1,
        backgroundColor: "#1E1E1E",
        justifyContent: 'center',
        alignItems: 'center'
    },
    question: {
        fontWeight: 'bold',
        textAlign: 'center'
    },
    text: {
        color: "#FFF"
    },
    sectionContainer: {
        marginVertical: 8,
    },
    imageContainer: {
        maxWidth: '100%',
        maxHeight: 150
    },
    image: {
        width: '100%',
        height: '100%'
    },
    imageTitle: {
        textAlign: 'center',
        marginBottom: 15
    },
    imageContent: {
        textAlign: 'center',
        marginTop: 15
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "#1E1E1E",
        paddingHorizontal: 16,
    },
    modalContentContainer: {
        flex: 1,
        justifyContent: "center",
    },
});

export default AnswerPage;

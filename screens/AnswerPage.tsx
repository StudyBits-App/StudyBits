import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View, ActivityIndicator, Image, Pressable, Modal, Button } from "react-native";
import firestore from "@react-native-firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import { Hint, QuestionAnswer, QuestionInfo } from "@/utils/interfaces";
import { trimText } from "@/utils/utils";

const AnswerPage: React.FC = () => {
    const [hints, setHints] = useState<Hint[]>([]);
    const [answerChoices, setAnswerChoices] = useState<QuestionAnswer[]>([]);

    const [question, setQuestion] = useState<string>();
    const [questionInfo, setQuestionInfo] = useState<QuestionInfo | null>(null);

    const [hintModalVisible, setHintModalVisible] = useState(false);
    const [hintModalContent, setHintModalContent] = useState<string>('');
    const [hintModalTitle, setHintModalTitle] = useState<string>('');
    const [hintModalImage, setHintModalImage] = useState<string>('');

    const [answersSubmitted, setAnswersSubmitted] = useState(false);

    const fetchQuestionInfo = async () => {
        try {
            const querySnapshot = await firestore().collection('questions').get();
            const data = querySnapshot.docs[Math.floor(Math.random() * querySnapshot.size)].data() as QuestionInfo;
            setQuestionInfo(data);
        } catch (error) {
            console.error('Error fetching question info:', error);
        }
    };

    const nextQuestion = () => {
        setQuestionInfo(null);
        setAnswersSubmitted(false);
        fetchQuestionInfo();
    }

    useEffect(() => {
        fetchQuestionInfo();
    }, [])

    useEffect(() => {
        if (questionInfo) {
            setAnswerChoices(questionInfo.answers.map((item) => {
                item.isSelected = false
                return item
            }));
            setHints(questionInfo.hints);
            setQuestion(questionInfo.question);
        }
    }, [questionInfo]);

    const toggleSelectedAnswer = (inputAnswer: QuestionAnswer) => {
        setAnswerChoices(prevAnswers =>
            prevAnswers.map(answer =>
                answer.key === inputAnswer.key ? { ...answer, isSelected: !inputAnswer.isSelected } : answer
            )
        );
    }

    const handleCancelViewHint = () => {
        setHintModalVisible(false);
        setHintModalContent('');
        setHintModalTitle('');
        setHintModalImage('');
    }

    const handleOpenViewHint = (item: Hint) => {
        setHintModalContent(item.content);
        setHintModalTitle(item.title);
        setHintModalImage(item.image);
        setHintModalVisible(true);

    }

    const renderHint = ({ item }: { item: Hint }) => {
        const truncatedTitle = trimText(item.title, 10);
        const truncatedContent = trimText(item.content, 85);

        return (
            <View key={item.key} style={styles.hintContainer}>
                <Pressable style={styles.hint} onPress={() => handleOpenViewHint(item)}>
                    <Text style={[styles.text, styles.title, item.image && item.title ? styles.imageTitle : null]}>{truncatedTitle}</Text>
                    {item.image ? (
                        <View style={styles.imageContainer}>
                            <Image source={{ uri: item.image }} style={styles.image} resizeMode='contain' />
                        </View>
                    ) : null}
                    <Text style={[styles.text, item.image && item.content ? styles.imageContent : null]}>{truncatedContent}</Text>
                </Pressable>
            </View>
        )
    };

    const renderAnswer = ({ item }: { item: QuestionAnswer }) => (
        <Pressable key={item.key} disabled={answersSubmitted} onPress={() => toggleSelectedAnswer(item)}>
            <View style={[
                styles.answerContainer,
                item.isSelected ? styles.selectedAnswerContainer : {},
                answersSubmitted && item.isSelected && item.answer
                    ? styles.correctAnswerContainer // Selected correct answer
                    : answersSubmitted && !item.isSelected && item.answer
                        ? styles.correctButNotSelectedContainer // Correct but not selected
                        : answersSubmitted && item.isSelected && !item.answer
                            ? styles.incorrectAnswerContainer // Selected incorrect answer
                            : {},
            ]}>
                <Text style={styles.text}>{item.content}</Text>
            </View >
        </Pressable>

    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollview}>
                {
                    questionInfo ? (
                        <View>
                            <Text style={[styles.text, styles.question]}>{question}</Text>
                            {hints.map(hint => renderHint({ item: hint }))}
                            {answerChoices.map(answer => renderAnswer({ item: answer }))}
                            <Pressable style={styles.button} onPress={() => answersSubmitted ? nextQuestion() : setAnswersSubmitted(true)}>
                                <Text>{answersSubmitted ? "Next Question" : "Check"}</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <ActivityIndicator size="large" />
                    )
                }
            </ScrollView>

            <Modal visible={hintModalVisible} animationType="slide">
                <SafeAreaView style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={styles.modalContentContainer}>
                        <Text style={[styles.text, styles.modalTitleText]}>{hintModalTitle}</Text>
                        <View style={styles.imageContainer}>
                            {hintModalImage ? (
                                <Image source={{ uri: hintModalImage }} style={styles.image} resizeMode='contain' />
                            ) : null}
                        </View>
                        <Text style={[styles.text, styles.modalText]}>{hintModalContent}</Text>
                        <Pressable style={{ alignItems: 'center' }} onPress={handleCancelViewHint}>
                            <Text style={{ color: '#FF0D0D', fontSize: 17 }} >Cancel</Text>
                        </Pressable>
                    </ScrollView>
                </SafeAreaView>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    modalText: {
        paddingHorizontal: '10%',
        marginVertical: '5%'
    },
    title: {
        fontWeight: 'bold'
    },
    scrollview: {
        width: '75%'
    },
    button: {
        backgroundColor: "#ffffff",
        padding: 10,
        alignItems: "center",
        borderRadius: 5,
        marginVertical: '5%',
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
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
        textAlign: 'center',
        fontSize: 20,
        marginBottom: '5%'
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
        justifyContent: "center"
    },
    modalTitleText: {
        padding: 10,
        marginBottom: 10,
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: 'center'
    },
    answerContainer: {
        marginBottom: 10,
        padding: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ccc',
        width: '100%',
        alignItems: 'center',
    },
    selectedAnswerContainer: {
        backgroundColor: '#00e3ff80',
    },
    correctAnswerContainer: {
        backgroundColor: '#8bc34a',
    },
    incorrectAnswerContainer: {
        backgroundColor: '#e57373',
    },
    correctButNotSelectedContainer: {
        borderColor: '#8bc34a',
        borderWidth: 4,
    },
});

export default AnswerPage;

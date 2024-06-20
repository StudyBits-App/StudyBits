import React, { useRef, useState } from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
    Keyboard,
    Button,
    TouchableWithoutFeedback
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";
import { Swipeable } from "react-native-gesture-handler";
import { AntDesign } from "@expo/vector-icons";

interface Hint {
    key: string;
    title: string;
    content: string;
    image?: string;
    delete: () => void;
}

interface Answer {
    key: string;
    content: string,
    answer: boolean,
    delete: () => void;
}

const NewQuestionPortal: React.FC = () => {
    const [question, setQuestion] = useState<string>('');
    const [hints, setHints] = useState<Hint[]>([]);
    const [answerChoice, setAnswerChoices] = useState<Answer[]>([]);
    const [hintModalVisible, setHintModalVisible] = useState(false);
    const [hintModalContent, setHintModalContent] = useState<string>('');
    const [hintModalTitle, setHintModalTitle] = useState<string>('');
    const [editingHint, setEditingHint] = useState<Hint | null>(null);
    const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

    const handleHintDelete = (key: string) => {
        setHints(prevHints => prevHints.filter(item => item.key !== key));
    }

    const handleAnswerDelete = (key: string) => {
        setAnswerChoices(prevAnswers => prevAnswers.filter(answer => answer.key !== key));
    }

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const image: Hint = {
                key: uuidv4(),
                title: "",
                content: "",
                image: result.assets[0].uri,
                delete: () => handleHintDelete(image.key)
            }
            setHints(prevHints => [...prevHints, image]);
        }
    };

    const addHint = () => {
        const text = hintModalContent.trim();
        const title = hintModalTitle.trim();
        if (text) {
            const newItem: Hint = {
                key: uuidv4(),
                title: title,
                content: text,
                delete: () => handleHintDelete(newItem.key)
            };
            setHints(prevHints => [...prevHints, newItem]);
            setHintModalContent('');
            setHintModalTitle('');
            setHintModalVisible(false);
        }
    }

    const addAnswer = () => {
        if (answerChoice.length != 0 && answerChoice[answerChoice.length - 1].content === "") return;
        const newItem: Answer = {
            key: uuidv4(),
            content: "",
            answer: false,
            delete: () => handleAnswerDelete(newItem.key)
        }
        setAnswerChoices(prevAnswers => [...prevAnswers, newItem]);
    }

    const updateHint = () => {
        const text = hintModalContent.trim();
        const title = hintModalTitle.trim();
        if (text && editingHint && title) {
            setHints(prevHints =>
                prevHints.map(hint =>
                    hint.key === editingHint.key ? { ...hint, content: text, title: title } : hint
                )
            );
            swipeableRefs.current[editingHint.key]?.close();
            setHintModalTitle('');
            setHintModalContent('');
            setEditingHint(null);
            setHintModalVisible(false);
        }
    }

    const handleCancelHint = () => {
        setHintModalVisible(false);
        setHintModalContent('');
        setHintModalTitle('');
        setEditingHint(null);
        if (editingHint) {
            swipeableRefs.current[editingHint.key]?.close();
        }
    }

    const openEditModal = (hint: Hint) => {
        setEditingHint(hint);
        setHintModalContent(hint.content);
        setHintModalTitle(hint.title);
        setHintModalVisible(true);
    }

    const renderHint = ({ item, drag }: RenderItemParams<Hint>) => {
        const maxTitleLength = 7;

        const trimmedTitle = item.title.length > maxTitleLength
            ? item.title.substring(0, maxTitleLength - 2).substring(0, item.title.substring(0, maxTitleLength - 2).includes(' ') ? item.title.substring(0, maxTitleLength - 2).lastIndexOf(' ') : maxTitleLength - 2) + '...'
            : item.title;

        return (
            <Swipeable
                ref={ref => {
                    if (ref && item.key) {
                        swipeableRefs.current[item.key] = ref;
                    }
                }}
                renderRightActions={() => (
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', width: '40%', paddingBottom: '3%' }}>
                        <Pressable onPress={() => openEditModal(item)} style={{ backgroundColor: '#0D99FF', justifyContent: 'center', alignItems: 'center', width: '50%' }}>
                            <Text style={{ color: 'white' }}>Edit</Text>
                        </Pressable>
                        <Pressable onPress={item.delete} style={{ backgroundColor: '#FF0D0D', justifyContent: 'center', alignItems: 'center', width: '50%' }}>
                            <Text style={{ color: 'white' }}>Delete</Text>
                        </Pressable>
                    </View >
                )}
            >
                <Pressable
                    style={styles.hint}
                    onLongPress={() => {
                        drag();
                    }}
                >
                    <Text style={{ color: 'white', width: '15%', marginRight: '3%' }}>{trimmedTitle}</Text>
                    <Text style={{ width: '76%', color: 'white' }}>{item.content}</Text>
                    <AntDesign name="menufold" size={20} color="white" />
                </Pressable>
            </Swipeable >
        );
    }

    const renderAnswer = ({ item, drag }: RenderItemParams<Answer>) => {

        const handleAnswerContent = (text: string) => {
            const updatedContent: Answer = {
                ...item,
                content: text
            }
        }
        return (
            <View>
                <TextInput
                    placeholder="tricky answer choice"
                    onChangeText={handleAnswerContent}
                />
            </View>
        )

    }

    return (
        <SafeAreaView style={styles.safeview}>
            <View style={styles.container}>
                <Pressable onPress={pickImage}>
                    <Text style={styles.imageInsert}>Add Image</Text>
                </Pressable>
                <View style={styles.questionContainer}>
                    <Text style={styles.label}>Question</Text>
                    <TextInput
                        multiline
                        style={styles.input}
                        onChangeText={text => setQuestion(text)}
                        placeholder="Why is the sky blue?"
                    />
                </View>
                <View style={styles.infoContainer}>
                    <View style={styles.infoHeader}>
                        <Text style={[styles.label, styles.safeview]}>Additional Information (optional)</Text>
                        <Pressable onPress={() => setHintModalVisible(true)}>
                            <Text style={styles.add}>+</Text>
                        </Pressable>
                    </View>
                    <DraggableFlatList
                        data={hints}
                        renderItem={renderHint}
                        keyExtractor={(item) => item.key}
                        onDragEnd={({ data: newData }) => setHints(newData)}
                    />
                </View>
                <View style={styles.infoContainer}>
                    <View style={styles.infoHeader}>
                        <Text style={[styles.label, styles.safeview]}>Answers</Text>
                        <Pressable onPress={() => addAnswer()}>
                            <Text style={styles.add}>+</Text>
                        </Pressable>
                    </View>
                    <DraggableFlatList
                        data={answerChoice}
                        renderItem={renderAnswer}
                        keyExtractor={(item) => item.key}
                        onDragEnd={({ data: newData }) => setAnswerChoices(newData)}
                    />
                </View>
                <Pressable style={styles.button}><Text>Submit</Text></Pressable>
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={hintModalVisible}
                onRequestClose={handleCancelHint}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <TextInput
                                multiline
                                style={styles.modalInput}
                                onChangeText={text => setHintModalTitle(text)}
                                value={hintModalTitle}
                                placeholder="Add title"
                            />
                            <TextInput
                                multiline
                                style={styles.modalInput}
                                onChangeText={text => setHintModalContent(text)}
                                value={hintModalContent}
                                placeholder="Add content"
                            />
                            <View style={styles.modalButtons}>
                                {editingHint ? (
                                    <Button title="Update" onPress={updateHint} />
                                ) : (
                                    <Button title="Save" onPress={addHint} />
                                )}
                                <Button title="Cancel" onPress={handleCancelHint} />
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: "#ffffff",
        padding: '3%',
        alignItems: "center",
        borderRadius: 5,
        width: '75%',
        marginVertical: '5%',
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
    },
    add: {
        color: '#00FF00',
        fontWeight: 'medium',
        fontSize: 20,
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoContainer: {
        width: '90%',
        marginBottom: 10,
    },
    questionContainer: {
        width: '90%',
        marginVertical: 10,
    },
    label: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15,
        marginBottom: 10,
    },
    input: {
        backgroundColor: "#000000",
        padding: 10,
        borderRadius: 5,
        borderColor: 'white',
        borderWidth: 1,
        color: 'white',
        fontSize: 18,
        textAlignVertical: 'top',
    },
    safeview: {
        flex: 1,
    },
    container: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
    },
    imageInsert: {
        color: '#0D99FF',
        fontWeight: 'bold',
        fontSize: 14,
        marginVertical: 20,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#1f1e1e',
        padding: 30,
        borderRadius: 10,
        width: '90%',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    modalInput: {
        borderColor: "gray",
        borderWidth: 1,
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 5,
        width: '100%',
        color: 'white',
    },
    hint: {
        backgroundColor: '#333333',
        padding: '3%',
        borderRadius: 5,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default NewQuestionPortal;

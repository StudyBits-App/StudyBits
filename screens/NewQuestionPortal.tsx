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


const NewQuestionPortal: React.FC = () => {
    const [question, setQuestion] = useState<string>('');
    const [hints, setHints] = useState<Hint[]>([]);
    const [hintModalVisible, setHintModalVisible] = useState(false);
    const [hintModalContent, setHintModalContent] = useState<string>('');
    const [hintModalTitle, setHintModalTitle] = useState<string>('');
    const [editingHint, setEditingHint] = useState<Hint | null>(null);
    const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

    const handleDelete = (key: string) => {
        setHints(prevHints => prevHints.filter(item => item.key !== key));
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
                delete: () => handleDelete(image.key)
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
                title: hintModalTitle,
                content: text,
                delete: () => handleDelete(newItem.key)
            };
            setHints(prevHints => [...prevHints, newItem]);
            setHintModalContent('');
            setHintModalVisible(false);
        }
    }

    const updateHint = () => {
        const text = hintModalContent.trim();
        const title = hintModalTitle.trim()
        if (text && editingHint) {
            setHints(prevHints =>
                prevHints.map(hint =>
                    hint.key === editingHint.key ? { ...hint, content: text, title: hintModalTitle } : hint
                )
            );
            if (swipeableRefs.current[editingHint.key]) {
                swipeableRefs.current[editingHint.key]?.close();
            }
            setHintModalTitle('')
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
    }

    const openEditModal = (hint: Hint) => {
        console.log(hint)
        setEditingHint(hint);
        setHintModalContent(hint.content);
        setHintModalTitle(hint.title);
        setHintModalVisible(true);
    }

    const renderHint = ({ item, drag }: RenderItemParams<Hint>) => {
        return (
            <Swipeable
                ref={ref => {
                    if (ref && item.key) {
                        swipeableRefs.current[item.key] = ref;
                    }
                }}
                renderRightActions={() => (
                    <View style={{ flexDirection: 'row' }}>
                        <Pressable onPress={() => openEditModal(item)} style={{ backgroundColor: '#0D99FF', justifyContent: 'center' }}>
                            <Text style={{ color: 'white' }}>Edit</Text>
                        </Pressable>
                        <Pressable onPress={item.delete} style={{ marginRight: 10, backgroundColor: '#FF0D0D', justifyContent: 'center' }}>
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

                    <Text style={{ color: 'white', marginRight: 10 }}>{item.title}</Text>
                    <Text style={{ width: '75%', color: 'white' }}>{item.content}</Text>
                    <AntDesign style={{}} name="menufold" size={20} color="white" />

                </Pressable>
            </Swipeable >
        );

    }


    return (
        <SafeAreaView style={styles.safeview}>
            <View style={styles.container}>
                <Pressable
                    onPress={pickImage}>
                    <Text style={styles.imageInsert}>Add Image</Text>
                </Pressable>
                <View style={styles.questionContainer}>
                    <Text style={[styles.label, styles.regularLabel]}>Question</Text>
                    <TextInput
                        multiline
                        style={styles.input}
                        onChangeText={text => setQuestion(text)}
                        placeholder="Why is the sky blue?"
                    />
                </View>
                <View style={styles.infoContainer}>
                    <View style={styles.infoText}>
                        <Text style={[styles.label, styles.labelWithPlus]}>Additional Information (optional)</Text>
                        <Pressable onPress={() => setHintModalVisible(true)}><Text style={styles.add}>+</Text></Pressable>
                    </View>
                    <DraggableFlatList
                        data={hints}
                        renderItem={renderHint}
                        keyExtractor={(item) => { return item.key; }}
                        onDragEnd={({ data: newData }) => setHints(newData)}
                    />

                </View>
                <View style={styles.infoContainer}>
                    <View style={styles.infoText}>
                        <Text style={[styles.label, styles.labelWithPlus]}>Answers</Text>
                        <Pressable><Text style={styles.add}>+</Text></Pressable>
                    </View>
                </View>
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
    add: {
        color: '#00FF00',
        fontWeight: 'medium',
        fontSize: 20,
        alignSelf: 'flex-end',
        flex: 1
    },
    labelWithPlus: {
        flex: 1
    },
    infoText: {
        alignItems: 'center',
        flexDirection: 'row',
        width: '75%'
    },
    infoContainer: {
        flex: 1,
        textAlign: 'center',
        alignItems: 'center'
    },
    questionContainer: {
        width: '100%',
        textAlign: 'left',
        alignItems: 'center'
    },
    regularLabel: {
        width: '75%'
    },
    label: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15,
        marginVertical: '2%'
    },
    input: {
        backgroundColor: "#000000",
        padding: 10,
        alignItems: "center",
        borderRadius: 5,
        width: '75%',
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderColor: 'white',
        borderStyle: 'solid',
        borderWidth: 1,
        fontSize: 18
    },
    safeview: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        flex: 1
    },
    imageInsert: {
        color: '#0D99FF',
        fontWeight: 'bold',
        fontSize: 14
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width: '90%',
        height: '50%'
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
        borderRadius: 10,
        width: '100%',
        height: '80%',
        flex: 1,
    },
    deleteButton: {
        color: 'white',
        padding: 10,
        justifyContent: 'center',
    },
    hint: {
        flex: 1,
        paddingVertical: '2%',
        fontSize: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    }
});

export default NewQuestionPortal;
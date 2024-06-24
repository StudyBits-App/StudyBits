import React, { useRef, useState } from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
    Button,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { NestableDraggableFlatList, NestableScrollContainer, RenderItemParams } from "react-native-draggable-flatlist";
import { Swipeable } from "react-native-gesture-handler";
import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons";
import uploadImageToFirebase from "@/services/uploadImage";
import firestore from '@react-native-firebase/firestore';

interface Hint {
    key: string;
    title: string;
    content: string;
    image: string;
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
    const [answerChoices, setAnswerChoices] = useState<Answer[]>([]);

    const [hintModalVisible, setHintModalVisible] = useState(false);
    const [hintModalContent, setHintModalContent] = useState<string>('');
    const [hintModalTitle, setHintModalTitle] = useState<string>('');
    const [hintModalImage, setHintModalImage] = useState<string>('');
    const [editingHint, setEditingHint] = useState<Hint | null>(null);
    const [hintModalError, setHintModalError] = useState<string>('');

    const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

    const handleSubmit = async () => {

        const updatedHints = await Promise.all(hints.map(async hint => {
            if (hint.image) {
                const imageRef = await uploadImageToFirebase(hint.image, "questions");
                if (imageRef) {
                    return {
                        ...hint,
                        image: imageRef
                    };
                }
            }
            return hint;
        }));

        const filteredHints = updatedHints.map(hint => {
            const { delete: _, ...filteredComponent } = hint;
            return filteredComponent;
        });

        const filteredAnswers = answerChoices.map(answerChoice => {
            const { delete: _, ...filteredComponent } = answerChoice;
            return filteredComponent;
        });

        firestore().collection('questions').add({ question: question, hints: filteredHints, answers: filteredAnswers });
    };

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
            setHintModalImage(result.assets[0].uri)
        }
    };

    const addHint = () => {
        const text = hintModalContent.trim();
        const title = hintModalTitle.trim();

        if(!(hintModalImage || text && title)){
            setHintModalError("Missing information! Questions must have a title and content or an image.")
            return
        }

        const newItem: Hint = {
            key: uuidv4(),
            title: title,
            content: text,
            image: hintModalImage,
            delete: () => handleHintDelete(newItem.key)
        };
        setHints(prevHints => [...prevHints, newItem]);
        setHintModalContent('');
        setHintModalTitle('');
        setHintModalImage('');
        setHintModalError('');
        setHintModalVisible(false);
    }

    const addAnswer = () => {
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

        if(!(hintModalImage  && editingHint || text && editingHint && title)){
            setHintModalError("Missing information! Questions must have a title and content or an image.")
            return
        }
        if(hintModalImage  && editingHint){
            setHints(prevHints =>
                prevHints.map(hint =>
                    hint.key === editingHint.key ? {
                        ...hint,
                        content: text,
                        title: title,
                        image: hintModalImage
                    } : hint
                )
            );
        }
        else if (text && editingHint && title) {
            setHints(prevHints =>
                prevHints.map(hint =>
                    hint.key === editingHint.key ? {
                        ...hint,
                        content: text,
                        title: title,
                        image: hintModalImage
                    } : hint
                )
            );
        }
        swipeableRefs.current[editingHint.key]?.close();
        setHintModalTitle('');
        setHintModalContent('');
        setHintModalImage('');
        setHintModalError('');
        setEditingHint(null);
        setHintModalVisible(false);
    }
    

    const handleCancelHint = () => {
        if (editingHint) {
            swipeableRefs.current[editingHint.key]?.close();
        }
        setHintModalVisible(false);
        setHintModalContent('');
        setHintModalTitle('');
        setHintModalImage('');
        setHintModalError('');
        setEditingHint(null);

    }

    const openHintEditModal = (hint: Hint) => {
        setEditingHint(hint);
        setHintModalContent(hint.content);
        setHintModalTitle(hint.title);
        setHintModalImage(hint.image);
        setHintModalVisible(true);
    }

    const toggleAnswer = (answerKey: string) => {
        setAnswerChoices(prevAnswers =>
            prevAnswers.map(answer =>
                answer.key === answerKey ? { ...answer, answer: !answer.answer } : answer
            )
        );
        swipeableRefs.current[answerKey]?.close();
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
    
    const renderHint = ({ item, drag }: RenderItemParams<Hint>) => {
        const truncatedTitle = trimText(item.title, 10);
        const truncatedContent = trimText(item.content, 85);

        return (
            <Swipeable
                ref={ref => {
                    if (ref && item.key) {
                        swipeableRefs.current[item.key] = ref;
                    }
                }}
                renderRightActions={() => (
                    <View style={styles.swipeActionsContainer}>
                        <Pressable onPress={() => openHintEditModal(item)} style={{ ...styles.swipeButton, backgroundColor: '#0D99FF' }}>
                            <Text style={{ color: 'white' }}>Edit</Text>
                        </Pressable>
                        <Pressable onPress={item.delete} style={{ ...styles.swipeButton, backgroundColor: '#FF0D0D' }}>
                            <Text style={{ color: 'white' }}>Delete</Text>
                        </Pressable>
                    </View>
                )}
            >
                <Pressable
                    style={styles.contentContainer}
                    onLongPress={() => {
                        drag();
                    }}
                >
                    <View style={{flex: 1}}>
                        <Text style={[styles.contentTitle, item.image && item.title? styles.imageTitle : null]}>{truncatedTitle}</Text>
                            {item.image ? (
                                <View style = {styles.imageContainer}>
                                    <Image source={{ uri: item.image }} style={styles.image}  resizeMode='contain' />
                                </View>
                            ) : null}
                            
                            <Text style={[styles.contentText, item.image && item.content ? styles.imageContent : null]}>{truncatedContent}</Text>
                    </View>
                    <AntDesign name="menufold" size={20} color="white" style={{ marginLeft: 'auto' }} />
                </Pressable>
            </Swipeable>
        );
    }

    const renderAnswer = ({ item, drag }: RenderItemParams<Answer>) => {
        const handleAnswerContent = (text: string) => {
            setAnswerChoices(prevAnswers =>
                prevAnswers.map(answer =>
                    answer.key === item.key ? { ...answer, content: text } : answer
                )
            );
        }

        return (
            <Swipeable
                ref={ref => {
                    if (ref && item.key) {
                        swipeableRefs.current[item.key] = ref;
                    }
                }}
                renderRightActions={() => (
                    <View style={styles.swipeActionsContainer}>
                        <Pressable onPress={() => toggleAnswer(item.key)} style={styles.swipeButton}>
                            {item.answer ? (
                                <FontAwesome name="times" size={20} color="red" />
                            ) : (
                                <FontAwesome name="check" size={20} color="green" />
                            )}
                        </Pressable>
                        <Pressable onPress={item.delete} style={{ ...styles.swipeButton, backgroundColor: '#FF0D0D' }}>
                            <Text style={{ color: 'white' }}>Delete</Text>
                        </Pressable>
                    </View>
                )}
            >
                <Pressable
                    style={[
                        styles.contentContainer,
                        item.answer && styles.correctAnswer,
                        !item.answer && styles.incorrectAnswer
                    ]}
                    onLongPress={() => {
                        drag();
                    }}
                >
                    <TextInput
                        multiline
                        style={styles.contentText}
                        placeholder="Tricky answer choice"
                        onChangeText={handleAnswerContent}
                        value={item.content}
                    />
                    <AntDesign name="menufold" size={20} color="white" />
                </Pressable>
            </Swipeable>
        );
    }



    return (
        <SafeAreaView style={styles.container}>
            
            <NestableScrollContainer>
                
                <Text style={styles.headerText}>Question</Text>

                <TextInput
                    placeholderTextColor={"rgba(255, 255, 255, 0.7)"}
                    placeholder="Add Question Here"
                    value={question}
                    onChangeText={setQuestion}
                    style={styles.questionInput}
                    multiline
                />

                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeaderContainer}>
                        <Text style={styles.sectionTitle}>Additional Information</Text>
                        <Pressable onPress={() => setHintModalVisible(true)}>
                            <Ionicons name="add-circle" size={40} color={'#3B9EBF'}/>
                        </Pressable>
                    </View>

                    <NestableDraggableFlatList
                            data={hints}
                            renderItem={renderHint}
                            keyExtractor={item => item.key}
                            onDragEnd={({ data }) => setHints(data)}
                     />
                </View>
                    
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeaderContainer}>
                        <Text style={styles.sectionTitle}>Answer Choices</Text>
                        <Pressable onPress={addAnswer}>
                            <Ionicons name = "add-circle" size={40} color={'#3B9EBF'}/>
                        </Pressable>
                    </View>
                        <NestableDraggableFlatList
                            data={answerChoices}
                            renderItem={renderAnswer}
                            keyExtractor={item => item.key}
                            onDragEnd={({ data }) => setAnswerChoices(data)}
                        />
                </View>
                <Pressable style={styles.button} onPress={handleSubmit}>
                    <Text>Submit</Text>
                </Pressable>
            </NestableScrollContainer>

            <Modal visible={hintModalVisible} animationType="slide">
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalContentContainer}>
                        <Text style={styles.modalTitle}>Additional Info</Text>
                        <TextInput
                            multiline
                            placeholderTextColor={"rgba(255, 255, 255, 0.7)"}
                            placeholder="Title"
                            value={hintModalTitle}
                            onChangeText={setHintModalTitle}
                            style={styles.modalHintInputContent}
                        />
                        <Pressable style={styles.modalHintInputContent} onPress={pickImage}>
                            <Text style={styles.modalImageButtonText}>Pick an image from camera roll</Text>
                        </Pressable>
                        <View style = {styles.imageContainer}>
                        {hintModalImage ? (
                            <Pressable onPress={() => setHintModalImage('')}>
                                <Image source={{ uri: hintModalImage }} style={styles.image} resizeMode='contain'/>
                            </Pressable>
                        ) : null}
                        </View>
                        <TextInput
                            placeholderTextColor={"rgba(255, 255, 255, 0.7)"}
                            placeholder="Content"
                            value={hintModalContent}
                            onChangeText={setHintModalContent}
                            style={styles.modalHintInputContent}
                            multiline
                        />
                        {hintModalError ? (
                            <View style={styles.modalHintErrorContainer}>
                                <Text style={styles.modalHintError}>{hintModalError}</Text>
                                <Pressable onPress={() => setHintModalError('')} style={styles.closeButton}>
                                    <Text style={styles.modalHintError}>X</Text>
                                </Pressable>
                            </View>
                        ) : null}

                        <View style={styles.modalButtonContainer}>
                            <Button title="Cancel" onPress={handleCancelHint} color="#FF0D0D" />
                            <Button title={editingHint ? "Update Hint" : "Add Hint"} onPress={editingHint ? updateHint : addHint} color="#0D99FF" />
                        </View>
                    </View>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1E1E1E",
        paddingHorizontal: 16,
    },
    headerText: {
        padding: 10,
        marginBottom: 10,
        color: "#FFFFFF",
        fontSize: 24,
        fontWeight: "bold",
    },
    questionInput: {
        backgroundColor: "#333333",
        color: "#FFFFFF",
        borderRadius: 8,
        padding: 16,
        fontSize: 16,
        marginBottom: 20,
    },
    sectionTitle: {
        flex: 1,
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "bold"
    },
    sectionContainer: {
        marginBottom: 20
    },
    sectionHeaderContainer: {
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center'
    },
    contentContainer: {
        backgroundColor: "#333333",
        borderRadius: 8,
        padding: 16,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
    },
    contentTitle: {
        fontWeight: 'bold',
        color: 'white',
        fontSize: 16,
    },
    contentText: {
        flex: 1,
        color: 'white'
    },
    button: {
        backgroundColor: "#ffffff",
        padding: '3%',
        alignItems: "center",
        borderRadius: 5,
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
    modalTitle: {
        color: "#FFFFFF",
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    modalHintInputContent: {
        backgroundColor: "#333333",
        color: "#FFFFFF",
        borderRadius: 8,
        padding: 16,
        fontSize: 16,
        marginBottom: 10,
        marginTop: 10
    },
    modalImageButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
    },
    modalHintErrorContainer: {
        backgroundColor: "#FF474C",
        padding: 16,
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalHintError: {
        color: "#FFFFFF",
        fontSize: 16,
        flex: 1,
    },
    closeButton: {
        padding: 5,
    },
    modalButtonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    swipeActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        width: '40%',
        paddingBottom: '3%',
    },
    swipeButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '50%',
    },
    correctAnswer: {
        borderColor: 'green',
        borderWidth: 2,
    },
    incorrectAnswer: {
        borderColor: 'red',
        borderWidth: 2,
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
        marginBottom:15
    },
    imageContent: {
        textAlign: 'center',
        marginTop:15 
    }

});

export default NewQuestionPortal;

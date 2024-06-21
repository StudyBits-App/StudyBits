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
    TouchableWithoutFeedback,
    Image,
    ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import DraggableFlatList, { NestableDraggableFlatList, NestableScrollContainer, RenderItemParams } from "react-native-draggable-flatlist";
import { Swipeable } from "react-native-gesture-handler";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import uploadImageToFirebase from "@/services/uploadImage";
import firestore from '@react-native-firebase/firestore';

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

interface hintImage {
    key: string;
    title: string;
    image: string;
}

const NewQuestionPortal: React.FC = () => {
    const [question, setQuestion] = useState<string>('');

    const [hints, setHints] = useState<Hint[]>([]);
    const [answerChoices, setAnswerChoices] = useState<Answer[]>([]);
    const [images, setImages] = useState<hintImage[]>([]);

    const [hintModalVisible, setHintModalVisible] = useState(false);
    const [hintModalContent, setHintModalContent] = useState<string>('');
    const [hintModalTitle, setHintModalTitle] = useState<string>('');
    const [editingHint, setEditingHint] = useState<Hint | hintImage | null>(null);

    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [imageModalImage, setImageModalImage] = useState<string>('');

    const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

    const handleSubmit = async () => {

        const updatedImages = Promise.all(images.map(async image => {
            if (image.image) {
                const imageRef = await uploadImageToFirebase(image.image, "questions");
                if (imageRef) {
                    return {
                        ...image,
                        image: imageRef
                    };
                }
            }
            return image;
        }));

        const filteredHints = hints.map(hint => {
            const { delete: _, ...filteredComponent } = hint;
            return filteredComponent;
        });

        const filteredAnswers = answerChoices.map(answerChoice => {
            const { delete: _, ...filteredComponent } = answerChoice;
            return filteredComponent;
        });

        firestore().collection('questions').add({ question: question, images: updatedImages, hints: hints, answers: answerChoices });
    };

    const handleHintDelete = (key: string) => {
        setHints(prevHints => prevHints.filter(item => item.key !== key));
    }

    const handleAnswerDelete = (key: string) => {
        setAnswerChoices(prevAnswers => prevAnswers.filter(answer => answer.key !== key));
    }

    const handleDeleteImage = () => {
        setImages(prevImages => prevImages.filter(images => images.key !== editingHint?.key));
        setImageModalVisible(false);
    }

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImageModalImage(result.assets[0].uri)
        }
    };

    const addHint = () => {
        const text = hintModalContent.trim();
        const title = hintModalTitle.trim();
        if (text && title) {
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
        else {
            console.error("Missing data");
        }
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

    const addImage = () => {
        const newItem: hintImage = {
            key: uuidv4(),
            title: hintModalTitle,
            image: imageModalImage,
        }
        setImages(prevImages => [...prevImages, newItem]);
        setHintModalTitle('');
        setImageModalImage('');
        setImageModalVisible(false);
    }

    const updateHint = () => {
        const text = hintModalContent.trim();
        const title = hintModalTitle.trim();
        if (text && editingHint && title) {
            setHints(prevHints =>
                prevHints.map(hint =>
                    hint.key === editingHint.key ? {
                        ...hint,
                        content: text,
                        title: title,
                        image: hint.image ? imageModalImage : undefined
                    } : hint
                )
            );
            swipeableRefs.current[editingHint.key]?.close();
            setHintModalTitle('');
            setHintModalContent('');
            setEditingHint(null);
            setHintModalVisible(false);
        }
    }
    const updateImage = () => {
        const title = hintModalTitle.trim();
        if (imageModalImage && editingHint && title) {
            setImages(prevImages =>
                prevImages.map(images =>
                    images.key === editingHint.key ? {
                        ...images,
                        title: title,
                        image: imageModalImage
                    } : images
                )
            );
            setHintModalTitle('');
            setImageModalImage('');
            setEditingHint(null);
            setImageModalVisible(false);
        }
    }

    const handleCancelHint = () => {
        if (editingHint && !imageModalVisible) {
            swipeableRefs.current[editingHint.key]?.close();
        }
        setHintModalVisible(false);
        setImageModalVisible(false)
        setHintModalContent('');
        setHintModalTitle('');
        setImageModalImage('');
        setEditingHint(null);
    }

    const openHintEditModal = (hint: Hint) => {
        setEditingHint(hint);
        setHintModalContent(hint.content);
        setHintModalTitle(hint.title);
        setHintModalVisible(true);
    }

    const openImageEditModal = (image: hintImage) => {
        setEditingHint(image);
        setHintModalTitle(image.title);
        if (image.image) {
            setImageModalImage(image.image);
        }
        setImageModalVisible(true);
    }

    const toggleAnswer = (answerKey: string) => {
        setAnswerChoices(prevAnswers =>
            prevAnswers.map(answer =>
                answer.key === answerKey ? { ...answer, answer: !answer.answer } : answer
            )
        );
        swipeableRefs.current[answerKey]?.close();
    }

    function hintCharacterLimit(hint: Hint, maxTitleLength: number): [string, string] {
        const trimmedTitle = hint.title.length > maxTitleLength
            ? hint.title.substring(0, maxTitleLength - 2).substring(0, hint.title.substring(0, maxTitleLength - 2).includes(' ')
                ? hint.title.substring(0, maxTitleLength - 2).lastIndexOf(' ') : maxTitleLength - 2) + '...'
            : hint.title;

        const trimmedContent = hint.content.length > maxTitleLength
            ? hint.content.substring(0, maxTitleLength - 2).substring(0, hint.content.substring(0, maxTitleLength - 2).includes(' ')
                ? hint.content.substring(0, maxTitleLength - 2).lastIndexOf(' ') : maxTitleLength - 2) + '...'
            : hint.content;

        return [trimmedTitle, trimmedContent];
    }
    const renderImage = ({ item, drag }: RenderItemParams<hintImage>) => {
        return (
            <Pressable onLongPress={drag}>
                <View style={styles.imageContainer}>
                    <Pressable onPress={() => openImageEditModal(item)}>
                        <Image
                            source={{ uri: item.image }}
                            style={styles.image}
                            resizeMode="contain"
                        />
                    </Pressable>
                </View>
            </Pressable>
        );
    }
    const renderHint = ({ item, drag }: RenderItemParams<Hint>) => {
        const truncatedTitle = hintCharacterLimit(item, 10)[0] + "  :  ";
        const truncatedContent = hintCharacterLimit(item, 85)[1];

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
                    style={styles.hint}
                    onLongPress={() => {
                        drag();
                    }}
                >
                    <Text style={{ color: 'white' }}>{truncatedTitle}</Text>
                    <Text style={styles.hintContent}>{truncatedContent}</Text>
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
                        styles.hint,
                        item.answer && styles.correctAnswer,
                        !item.answer && styles.incorrectAnswer
                    ]}
                    onLongPress={() => {
                        drag();
                    }}
                >
                    <TextInput
                        multiline
                        style={styles.answerInput}
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
        <SafeAreaView style={styles.safeview}>
            <NestableScrollContainer contentContainerStyle={styles.container}>
                <View style={styles.infoContainer}>
                    <NestableDraggableFlatList
                        data={images}
                        renderItem={renderImage}
                        keyExtractor={(item) => item.key}
                        onDragEnd={({ data: newData }) => setImages(newData)}
                    />
                </View>
                <Pressable onPress={() => setImageModalVisible(true)}>
                    <Text style={styles.imageInsert}>Add Image</Text>
                </Pressable>
                <View style={styles.infoContainer}>
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
                    <NestableDraggableFlatList
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
                    <NestableDraggableFlatList
                        data={answerChoices}
                        renderItem={renderAnswer}
                        keyExtractor={(item) => item.key}
                        onDragEnd={({ data: newData }) => setAnswerChoices(newData)}
                    />
                </View>
                <Pressable style={styles.button} onPress={handleSubmit}>
                    <Text>Submit</Text>
                </Pressable>
            </NestableScrollContainer>

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
                                placeholderTextColor="gray"
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

            <Modal
                animationType="slide"
                transparent={true}
                visible={imageModalVisible}
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
                                placeholder="Add caption"
                            />
                            {imageModalImage ? (
                                <View style={styles.imageContainer}>
                                    <Pressable onPress={() => console.log(imageModalImage)}>
                                        <Image
                                            source={{ uri: imageModalImage }}
                                            style={styles.image}
                                            resizeMode="contain"
                                        />
                                    </Pressable>
                                </View>
                            ) : (
                                <Button title="Add image" onPress={pickImage} />
                            )
                            }
                            <View style={styles.modalButtons}>
                                {editingHint ? (
                                    <Button title="Update" onPress={updateImage} />
                                ) : (
                                    <Button title="Save" onPress={addImage} />
                                )}
                                <Button title="Cancel" onPress={handleCancelHint} />
                            </View>
                            {editingHint && (
                                <Pressable onPress={handleDeleteImage}>
                                    <Text style={styles.imageDeleteButton}>Delete</Text>
                                </Pressable>
                            )}
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
        fontSize: 20
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'baseline'
    },
    infoContainer: {
        width: '90%',
        marginBottom: '3%'
    },
    label: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15,
        marginBottom: '3%'
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
        justifyContent: 'flex-start'
    },
    container: {
        alignItems: 'center'
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
        padding: '3%',
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

    hintContent: {
        color: 'white',
        paddingRight: 15,
    },
    correctAnswer: {
        borderColor: 'green',
        borderWidth: 2,
    },
    incorrectAnswer: {
        borderColor: 'red',
        borderWidth: 2,
    },
    answerInput: {
        color: 'white',
        flex: 1,
        paddingRight: 15
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
    imageDeleteButton: {
        marginTop: 30,
        color: 'white',
        backgroundColor: '#FF474C',
        textAlign: 'center',
        padding: 7,
    },
    imageContainer: {
        width: 300,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        flex: 1,
        width: 200,
        height: 300,
    },

});

export default NewQuestionPortal;

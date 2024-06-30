import { v4 as uuidv4 } from 'uuid';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';


const uploadImageToFirebase = async (uri: string, folder: string) => {
    const filename = `${uuidv4()}-${uri.substring(uri.lastIndexOf('/') + 1)}`;
    const storageRef = storage().ref(`${folder}/${filename}`);
    const response = await fetch(uri);
    const blob = await response.blob();

    await storageRef.put(blob);
    const downloadURL = await storageRef.getDownloadURL();

    return downloadURL;
  };



const deleteImageFromFirebase = async (imageUrl: string) => {
  try {
    const filePath = imageUrl.split('/').slice(-1)[0].split('?')[0];
    await storage().ref(filePath).delete();
  } catch (error) {
    console.error('Error deleting image: ', error);
  }
};


export {uploadImageToFirebase, deleteImageFromFirebase}
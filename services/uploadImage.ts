import { v4 as uuidv4 } from 'uuid';
import storage from '@react-native-firebase/storage';

const uploadImageToFirebase = async (uri: string, folder: string) => {
    const filename = `${uuidv4()}-${uri.substring(uri.lastIndexOf('/') + 1)}`;
    const storageRef = storage().ref(`${folder}/${filename}`);
    const response = await fetch(uri);
    const blob = await response.blob();

    await storageRef.put(blob);
    const downloadURL = await storageRef.getDownloadURL();

    return downloadURL;
  };

export default uploadImageToFirebase
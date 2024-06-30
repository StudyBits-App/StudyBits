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

  const deleteImageFromFirebase = async (imageUrl: string) => {
    try {
      console.log(imageUrl);
      const decodedUrl = decodeURIComponent(imageUrl);
      const startIndex = decodedUrl.indexOf('/o/') + 3;
      const endIndex = decodedUrl.indexOf('?');
      const filePath = decodedUrl.substring(startIndex, endIndex);
  
      await storage().ref(filePath).delete();
      console.log('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image: ', error);
    }
  };
  


export {uploadImageToFirebase, deleteImageFromFirebase}
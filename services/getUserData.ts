import firestore from '@react-native-firebase/firestore';

const getChannelData = async (userId: string | undefined) => {
    if (!userId) {
        throw new Error('User ID is not provided'); 
    }
    try {
        const channelsSnapshot = await firestore()
            .collection('channels')
            .doc(userId)
            .get();
        return channelsSnapshot;
    } catch (error) {
        console.error('Error fetching channel data: ', error);
        throw error; 
    }
}

const getCourseData = async (courseId: string) => {
    try {
      const courseDoc = await firestore().collection('courses').doc(courseId).get();
      if (!courseDoc.exists) {
        throw new Error('Course not found');
      }
      return courseDoc;
    } catch (error) {
      console.error('Error fetching course data: ', error);
      throw error;
    }
  };
  
export { getChannelData, getCourseData };
import firestore from '@react-native-firebase/firestore';

const getChannelData = async (userId: string | undefined) => {
    if (!userId) {
        throw new Error('User ID is not provided'); 
    }
    try {
        const channelsSnapshot = await firestore()
            .collection('channels')
            .where('user', '==', userId)
            .get();
        return channelsSnapshot;
    } catch (error) {
        console.error('Error fetching channel data: ', error);
        throw error; 
    }
}

export {getChannelData};
import { ActivityIndicator, SafeAreaView } from "react-native";


const LoadingScreen = () => {
    return (
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
        </SafeAreaView>
    );
}

export default LoadingScreen;
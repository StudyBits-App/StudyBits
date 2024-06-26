import React from 'react';
import { useUserChannel } from '@/context/userChannel';
import { Stack } from 'expo-router';
import CreateChannelPage from '@/screens/CreateChannel';
import { ActivityIndicator, SafeAreaView } from 'react-native';
import LoadingScreen from '@/screens/LoadingScreen';

export default function StackLayout() {
    const { hasChannel, loading } = useUserChannel();

    if (loading) {
        return <LoadingScreen />
    }
    return hasChannel ? (
        <Stack>
            <Stack.Screen
                name="channelPage"
                options={{
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="createCourse"
                options={{
                    headerShown: false
                }}
            />
        </Stack>
    ) : (
        <CreateChannelPage />
    )

}
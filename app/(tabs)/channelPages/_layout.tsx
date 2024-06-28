import React from 'react';
import { useUserChannel } from '@/context/userChannel';
import { Stack } from 'expo-router';
import CreateChannelPage from '@/screens/CreateChannel';
import LoadingScreen from '@/screens/LoadingScreen';

export default function channelLayout() {
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
                    title: 'Create a course',
                    headerBackTitle: 'Channel'
                }}
            />
            <Stack.Screen
                name="manageCourse"
                options={{
                    headerTitle: "Manage Course",
                    headerBackTitle: 'Channel'
                }}
            />
        </Stack>
    ) : (
        <CreateChannelPage />
    )

}
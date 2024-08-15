import React from 'react';
import { Stack } from 'expo-router';

export default function channelExternalLayout() {
    return   (
        <Stack>
            <Stack.Screen
                name="createCourse"
                options={{
                    title: 'Course',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="manageCourse"
                options={{
                    headerShown: false,
                }}
            />
        </Stack>
    );
}
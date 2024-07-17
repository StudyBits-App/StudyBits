import React from 'react';
import { Stack } from 'expo-router';

export default function homePageLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="addLearning"
                options={{
                    headerShown: false
                }}
            />
        </Stack>
    ) 
}
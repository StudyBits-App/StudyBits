import { Stack } from 'expo-router';
import React from 'react';


export default function StackLayout() {

  return (
    <Stack> 
      <Stack.Screen
        name="channelPage"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="createChannel"
        options={{
          headerShown: false
        }}
      />
    </Stack>
  );
}

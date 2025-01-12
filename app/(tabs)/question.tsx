import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import QuestionPortal from '@/screens/QuestionPortal';
import { ToastProvider } from 'react-native-toast-notifications';
import { View, Text } from 'react-native';

export default function Question() {
  return (
    <GestureHandlerRootView>
       <ToastProvider
        renderType={{
          custom_type: (toast) => (
            <View style={{padding: 15, backgroundColor: 'grey'}}>
              <Text>{toast.message}</Text>
            </View>
          )
        }}
      >
      <QuestionPortal />
      </ToastProvider>
    </GestureHandlerRootView>
  );
}


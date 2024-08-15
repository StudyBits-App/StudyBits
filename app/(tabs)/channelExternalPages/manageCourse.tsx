import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ManageCoursesPage from '@/screens/ManageCourse';
import { ToastProvider } from 'react-native-toast-notifications'
import { View, Text } from 'react-native';

export default function ManageCourse() {
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
        <ManageCoursesPage />
      </ToastProvider>
    </GestureHandlerRootView>
  );
}


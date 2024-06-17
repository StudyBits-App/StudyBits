import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CoursePortal from '@/screens/CreateCourse';
export default function Question() {
    
  return (
    <GestureHandlerRootView>
      <CoursePortal />
    </GestureHandlerRootView>
  );
}


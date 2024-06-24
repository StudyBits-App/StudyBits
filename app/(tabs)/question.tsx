import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import QuestionPortal from '@/screens/QuestionPortal';

export default function Question() {
  return (
    <GestureHandlerRootView>
      <QuestionPortal />
    </GestureHandlerRootView>
  );
}


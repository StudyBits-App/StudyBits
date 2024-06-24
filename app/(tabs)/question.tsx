import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import NewQuestionPortal from '@/screens/NewQuestionPortal';

export default function Question() {
  return (
    <GestureHandlerRootView>
      <NewQuestionPortal />
    </GestureHandlerRootView>
  );
}


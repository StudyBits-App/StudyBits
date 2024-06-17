import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import QuestionPortal from '@/screens/QuestionPortal';
import NewQuestionPortal from '@/screens/NewQuestionPortal';

export default function Question() {
  return (
    <GestureHandlerRootView>
      <NewQuestionPortal />
    </GestureHandlerRootView>
  );
}


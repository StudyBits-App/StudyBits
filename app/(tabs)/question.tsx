import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import QuestionPortal from '../questionPortal';

export default function Question() {

  return (
    <GestureHandlerRootView>
        <QuestionPortal />
    </GestureHandlerRootView>
  );
}


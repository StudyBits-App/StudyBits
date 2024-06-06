import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, theme } from "react-native-design-system";
import QuestionPortal from '../questionPortal';
//get it to stop whining
const components = {};

export default function Question() {

  return (
    <GestureHandlerRootView>
      <ThemeProvider theme={theme} components={components}>
        <QuestionPortal />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}


import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Button } from 'react-native';

interface AnswerChoice {
  content: string;
  identifier: string;
  selected: boolean;
  correct: boolean;
}

interface Component {
  content: string;
  identifier: string;
  selected: boolean;
}

const initialComponents: Component[] = [
  {
    "content": "",
    "identifier": "image",
    "selected": false
  },
  {
    "content": "1",
    "identifier": "text",
    "selected": false
  },
  {
    "content": "3",
    "identifier": "text",
    "selected": false
  },
  {
    "content": "2",
    "identifier": "text",
    "selected": false
  }
];

const initialAnswerChoices: AnswerChoice[] = [
  {
    "content": "Ans3",
    "identifier": "answer",
    "selected": false,
    "correct": false
  },
  {
    "content": "Ans1",
    "identifier": "answer",
    "selected": false,
    "correct": true
  },
  {
    "content": "Ans2",
    "identifier": "answer",
    "selected": false,
    "correct": false
  }
];

const initialQuestion = "This is a question";

const ComponentList = () => {
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [answersSubmitted, setAnswersSubmitted] = useState(false);
  const [answerChoices, setAnswerChoices] = useState<AnswerChoice[]>(initialAnswerChoices);
  const [components, setComponents] = useState<Component[]>(initialComponents);
  const [question, setQuestion] = useState(initialQuestion);

  const handleAnswerClick = (index: number) => {
    if (!answersSubmitted) {
      const newSelectedAnswers = [...selectedAnswers];
      if (newSelectedAnswers.includes(index)) {
        newSelectedAnswers.splice(newSelectedAnswers.indexOf(index), 1);
      } else {
        newSelectedAnswers.push(index);
      }
      setSelectedAnswers(newSelectedAnswers);

      // Update answerChoices to reflect selection
      const updatedChoices = answerChoices.map((choice, i) => ({
        ...choice,
        selected: newSelectedAnswers.includes(i)
      }));
      setAnswerChoices(updatedChoices);
    }
  };

  const handleSubmit = () => {
    setAnswersSubmitted(true);
  };

  const handleNext = () => {
    setSelectedAnswers([]);
    setAnswersSubmitted(false);
    setAnswerChoices(initialAnswerChoices.map(choice => ({ ...choice, selected: false })));
    setComponents(initialComponents.map(component => ({ ...component, selected: false })));
    setQuestion(initialQuestion);
  };

  return (
    <View style={styles.container}>
      {components.map((component, index) => {
        if (component.identifier === 'text') {
          return (
            <View key={index} style={styles.textContainer}>
              <Text>{component.content}</Text>
            </View>
          );
        }
        return null;
      })}

      <View style={styles.questionContainer}>
        <Text style={styles.text}>{question}</Text>
      </View>

      {answerChoices.map((choice, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.answerContainer,
            choice.selected ? styles.selectedAnswerContainer : {},
            answersSubmitted && choice.selected && choice.correct ? styles.correctAnswerContainer : {},
            answersSubmitted && choice.selected && !choice.correct ? styles.incorrectAnswerContainer : {},
          ]}
          onPress={() => handleAnswerClick(index)}
          disabled={answersSubmitted}
        >
          <Text style={styles.answerText}>{choice.content}</Text>
        </TouchableOpacity>
      ))}

      <Button
        title={answersSubmitted ? "Next" : "Submit"}
        onPress={answersSubmitted ? handleNext : handleSubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  textContainer: {
    marginBottom: 10,
  },
  questionContainer: {
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
  },
  answerContainer: {
    marginBottom: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    width: '100%',
    alignItems: 'center',
  },
  selectedAnswerContainer: {
    backgroundColor: '#aaf',
  },
  correctAnswerContainer: {
    backgroundColor: '#8bc34a', // Green for correct
  },
  incorrectAnswerContainer: {
    backgroundColor: '#e57373', // Red for incorrect
  },
  answerText: {
    fontSize: 16,
  },
  text: {
    fontSize: 10,
  },
});

export default ComponentList;

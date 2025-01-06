import React, { useEffect, useRef } from 'react';
import { 
  View, 
  ActivityIndicator, 
  Animated, 
  StyleSheet 
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

const LoadingScreen = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loadingContainer}>
        <View style={styles.circlesContainer}>
          <Animated.View
            style={[
              styles.outerCircle,
              {
                transform: [{ rotate: spin }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.innerContainer,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}>
            <ActivityIndicator size="large" color="#ffffff" />
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Animated loading dots component
const LoadingDots = () => {
  const opacityDot1 = useRef(new Animated.Value(0.3)).current;
  const opacityDot2 = useRef(new Animated.Value(0.3)).current;
  const opacityDot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animateDots = (dot: Animated.Value | Animated.ValueXY, delay: number) => {
      return Animated.sequence([
        Animated.timing(dot, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
          delay,
        }),
        Animated.timing(dot, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
      ]);
    };

    Animated.loop(
      Animated.parallel([
        animateDots(opacityDot1, 0),
        animateDots(opacityDot2, 200),
        animateDots(opacityDot3, 400),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.dotsContainer}>
      {[opacityDot1, opacityDot2, opacityDot3].map((dot, index) => (
        <Animated.Text
          key={index}
          style={[styles.dot, { opacity: dot }]}>
          .
        </Animated.Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circlesContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#4a90e2',
    borderStyle: 'dashed',
    position: 'absolute',
  },
  innerContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 20,
  },
  dot: {
    color: '#ffffff',
    fontSize: 24,
    marginLeft: 2,
  },
});

export default LoadingScreen;
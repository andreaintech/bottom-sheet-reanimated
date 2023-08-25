import "react-native-gesture-handler";
import React, { useState } from "react";
import { StyleSheet, Pressable, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";

import { SafeAreaProvider } from "react-native-safe-area-context";

import AccentPicker from "./src/components/AccentPicker";
import Chat from "./src/components/Chat";
import { HEIGHT, OVERDRAG } from "./src/misc/consts";
import {
  ACCENT_COLOR,
  BACKDROP_COLOR,
  BACKGROUND_COLOR,
} from "./src/misc/colors";
import Animated, { runOnJS, FadeIn, FadeOut, SlideInDown, SlideOutDown, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function App(): JSX.Element {
  const offset = useSharedValue(0);
  const [isOpen, setOpen] = useState(false);
  const [accent, setAccent] = useState(ACCENT_COLOR);

  const toggleSheet = () => {
    setOpen(!isOpen);
    offset.value = 0;
  };

  const pan = Gesture.Pan()
  .onChange((event) => {
    const offsetDelta = event.changeY + offset.value;
    const clamp = Math.max(-OVERDRAG, offsetDelta);

    offset.value += offsetDelta > 0 ? offsetDelta : withSpring(clamp);
  })
  .onFinalize((event) => {
    if(offset.value < HEIGHT / 3) {
      offset.value = withSpring(0);
    } else {
      offset.value = withTiming(HEIGHT, {}, () => {
        runOnJS(toggleSheet)();
      });
    }
  })

  const translateY = useAnimatedStyle(() => ({
    transform: [{translateY: offset.value}]
  }))

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <Chat toggleSheet={toggleSheet} accent={accent} />
        {isOpen && (
          <>
            <AnimatedPressable 
              style={styles.backdrop} 
              onPress={toggleSheet} 
              entering={FadeIn}
              exiting={FadeOut}
            />

            <GestureDetector gesture={pan}>
              <Animated.View 
                style={[styles.sheet, translateY]}
                entering={SlideInDown.springify().damping(15)}
                exiting={SlideOutDown}
              >
                <AccentPicker
                  onPick={(color: string) => {
                    setAccent(color);
                    toggleSheet();
                  }}
                />
              </Animated.View>
            </GestureDetector>
          </>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  sheet: {
    backgroundColor: "white",
    padding: 16,
    height: HEIGHT,
    width: "100%",
    position: "absolute",
    bottom: -OVERDRAG * 1.1,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    zIndex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BACKDROP_COLOR,
    zIndex: 1,
  },
});

export default App;

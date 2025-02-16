import { View, ActivityIndicator, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export function LoadingState() {
  return (
    <Animated.View 
      entering={FadeIn}
      style={styles.container}
    >
      <ActivityIndicator size="large" color="#1a365d" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
}); 
import Animated, { 
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { ActivityIndicator, StyleSheet } from 'react-native';

interface Props {
  refreshing: boolean;
}

export function RefreshSpinner({ refreshing }: Props) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{
      rotate: withSpring(refreshing ? '360deg' : '0deg', {
        mass: 1,
        damping: 20,
        stiffness: 100,
      })
    }]
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <ActivityIndicator size="small" color="#1a365d" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
}); 
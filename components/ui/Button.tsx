import { TouchableOpacity, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  style?: StyleProp<ViewStyle>;
}

export function Button({ title, onPress, variant = "primary", style }: ButtonProps) {
  const theme = useTheme();

  const buttonStyle = variant === "primary" 
    ? { backgroundColor: theme.colors.primary }
    : { backgroundColor: theme.colors.secondary };

  return (
    <TouchableOpacity 
      style={[styles.button, buttonStyle, style]} 
      onPress={onPress}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
}); 
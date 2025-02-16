import { TextInput, StyleSheet, View } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";
import { Ionicons } from '@expo/vector-icons';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: React.ReactNode;
}

export function Input({ 
  value, 
  onChangeText, 
  placeholder, 
  secureTextEntry,
  icon,
  rightIcon
}: InputProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {icon && (
        <Ionicons 
          name={icon} 
          size={20} 
          color="#4a5568" 
          style={styles.icon}
        />
      )}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        placeholderTextColor="#a0aec0"
      />
      {rightIcon}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 16,
    height: 56,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#2d3748",
  },
}); 
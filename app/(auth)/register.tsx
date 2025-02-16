import { useState } from "react";
import { View, StyleSheet, Image, Text, Pressable } from "react-native";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useTheme } from "../../theme/ThemeProvider";
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Alert } from 'react-native';

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const { signUp } = useAuth();

  const handleSignUp = async () => {
    if (!username || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await signUp(username, password);
      router.replace('/(app)');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.appName}>NoteSync</Text>
          <Text style={styles.slogan}>Join the Community</Text>
          <Text style={styles.subSlogan}>Start Your Collaborative Journey Today</Text>
        </View>
        
        <View style={styles.form}>
          <Text style={styles.label}>Username</Text>
          <Input
            value={username}
            onChangeText={setUsername}
            placeholder="Choose a username"
            icon="person-outline"
          />

          <Text style={styles.label}>Password</Text>
          <Input
            value={password}
            onChangeText={setPassword}
            placeholder="Create a password"
            secureTextEntry={!showPassword}
            icon="lock-closed-outline"
            rightIcon={
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#4a5568" 
                />
              </Pressable>
            }
          />

          <Text style={styles.label}>Confirm Password</Text>
          <Input
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
            secureTextEntry={!showConfirmPassword}
            icon="lock-closed-outline"
            rightIcon={
              <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                <Ionicons 
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#4a5568" 
                />
              </Pressable>
            }
          />

          <Button 
            title={loading ? "Creating Account..." : "Create Account"}
            onPress={handleSignUp}
            style={styles.button}
            disabled={loading}
          />

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <Link href="/login" style={styles.link}>
            Already have an account? <Text style={styles.linkHighlight}>Sign In</Text>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
    paddingBottom: 16,
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 0,
    marginBottom: 16,
  },
  logoWrapper: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 8,
    borderRadius: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a365d",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  slogan: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2d3748",
    textAlign: "center",
    marginBottom: 2,
  },
  subSlogan: {
    fontSize: 14,
    color: "#4a5568",
    textAlign: "center",
    marginBottom: 12,
  },
  form: {
    width: "100%",
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 6,
  },
  eyeIcon: {
    padding: 8,
  },
  button: {
    height: 48,
    borderRadius: 12,
    marginTop: 4,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  dividerText: {
    color: "#718096",
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: "500",
  },
  link: {
    color: "#718096",
    textAlign: "center",
    fontSize: 15,
    paddingVertical: 4,
    marginBottom: 8,
  },
  linkHighlight: {
    color: "#3182ce",
    fontWeight: "600",
  },
}); 
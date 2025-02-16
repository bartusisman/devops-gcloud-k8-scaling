import { useState } from "react";
import { View, StyleSheet, Image, Text, Pressable } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useTheme } from "../../theme/ThemeProvider";
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();

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
          <Text style={styles.slogan}>Collaborative Notes Made Simple</Text>
          <Text style={styles.subSlogan}>Create, Share, and Learn Together</Text>
        </View>
        
        <View style={styles.form}>
          <Text style={styles.label}>Username</Text>
          <Input
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            icon="person-outline"
          />

          <Text style={styles.label}>Password</Text>
          <Input
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
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

          <Button 
            title="Sign In" 
            onPress={() => {}}
            style={styles.button}
          />
          
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <Link href="/register" style={styles.link}>
            Don't have an account? <Text style={styles.linkHighlight}>Register</Text>
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
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 0,
    marginBottom: 20,
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
    width: 120,
    height: 120,
    marginBottom: 8,
    borderRadius: 24,
  },
  appName: {
    fontSize: 28,
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
    marginBottom: 16,
  },
  form: {
    width: "100%",
    gap: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 8,
  },
  button: {
    height: 48,
    borderRadius: 12,
    marginTop: 8,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
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
  },
  linkHighlight: {
    color: "#3182ce",
    fontWeight: "600",
  },
  eyeIcon: {
    padding: 8,
  },
}); 
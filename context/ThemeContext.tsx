import { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: typeof lightColors;
}

const lightColors = {
  background: '#f7fafc',
  card: '#ffffff',
  text: '#2d3748',
  primary: '#1a365d',
  border: '#e2e8f0',
  error: '#e53e3e',
};

const darkColors = {
  background: '#1a202c',
  card: '#2d3748',
  text: '#f7fafc',
  primary: '#63b3ed',
  border: '#4a5568',
  error: '#fc8181',
};

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    setIsDarkMode(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <ThemeContext.Provider 
      value={{ 
        isDarkMode, 
        toggleTheme,
        colors: isDarkMode ? darkColors : lightColors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext); 
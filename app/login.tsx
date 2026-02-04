import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { setAuthToken } from '@/utils/auth';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // API Base URL - use your computer's IP for mobile testing
  const API_BASE_URL = 'http://192.168.100.88:5000/api';

  const handleLogin = async () => {
    console.log('Login button clicked!', { email, password });
    
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (data.success) {
        // Store token for future requests
        await setAuthToken(data.token);
        console.log('Login successful, navigating to home...');
        router.replace('/(main)/home');
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Network error. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    console.log('Signup button clicked!', { email, password });
    
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Signup response:', data);

      if (data.success) {
        // Store token for future requests
        await setAuthToken(data.token);
        console.log('Signup successful, navigating to home...');
        router.replace('/(main)/home');
      } else {
        Alert.alert('Registration Failed', data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Network error. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>Avatar App</ThemedText>
          <ThemedText style={styles.subtitle}>Create your digital identity</ThemedText>
        </View>

        <View style={styles.form}>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5',
              color: colors.text,
              borderColor: colorScheme === 'dark' ? '#333' : '#ddd'
            }]}
            placeholder="Email"
            placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={[styles.input, { 
              backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5',
              color: colors.text,
              borderColor: colorScheme === 'dark' ? '#333' : '#ddd'
            }]}
            placeholder="Password"
            placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity 
            style={[
              styles.button, 
              { 
                backgroundColor: loading ? '#ccc' : colors.tint,
                opacity: loading ? 0.7 : 1
              }
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            <ThemedText style={[
              styles.buttonText, 
              { color: colorScheme === 'dark' ? '#000' : '#fff' }
            ]}>
              {loading ? 'Logging in...' : 'Log In'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.buttonSecondary, 
              { 
                borderColor: colors.tint,
                backgroundColor: 'transparent',
                opacity: loading ? 0.7 : 1
              }
            ]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <ThemedText style={[styles.buttonTextSecondary, { color: colors.tint }]}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  form: {
    gap: 16,
  },
  input: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  buttonSecondary: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  buttonTextSecondary: {
    fontSize: 18,
    fontWeight: '600',
  },
});

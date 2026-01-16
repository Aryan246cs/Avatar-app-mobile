import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleLogin = () => {
    // Mock login - no backend validation
    if (email && password) {
      router.replace('/(main)/home');
    }
  };

  const handleSignUp = () => {
    // Mock signup - same as login for now
    if (email && password) {
      router.replace('/(main)/home');
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
            style={[styles.button, { backgroundColor: colors.tint }]}
            onPress={handleLogin}
          >
            <ThemedText style={[
              styles.buttonText, 
              { color: colorScheme === 'dark' ? '#000' : '#fff' }
            ]}>
              Log In
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.buttonSecondary, { 
              borderColor: colors.tint,
              backgroundColor: 'transparent'
            }]}
            onPress={handleSignUp}
          >
            <ThemedText style={[styles.buttonTextSecondary, { color: colors.tint }]}>
              Sign Up
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

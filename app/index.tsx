import { isAuthenticated } from '@/utils/auth';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function Index() {
  const [isChecking, setIsChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      console.log('🚀 App starting - checking authentication...');
      try {
        const authenticated = await isAuthenticated();
        console.log('🔐 Authentication result:', authenticated);
        setIsLoggedIn(authenticated);
      } catch (error) {
        console.error('❌ Auth check error:', error);
        setIsLoggedIn(false);
      } finally {
        setIsChecking(false);
        console.log('✅ Auth check complete');
      }
    };

    checkAuth();
  }, []);

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 16, fontSize: 16 }}>Checking authentication...</Text>
      </View>
    );
  }

  console.log('🔄 Redirecting...', isLoggedIn ? 'to home' : 'to login');

  // Redirect based on authentication status
  if (isLoggedIn) {
    return <Redirect href="/(main)/home" />;
  } else {
    return <Redirect href="/login" />;
  }
}

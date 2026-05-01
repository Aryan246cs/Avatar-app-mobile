import { setAuthToken } from '@/utils/auth';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert, Dimensions, KeyboardAvoidingView, Platform,
    ScrollView, StyleSheet, Text, TextInput,
    TouchableOpacity, View,
} from 'react-native';

const { height: SH } = Dimensions.get('window');

const T = {
  cream:    '#EBCCAD',
  orange:   '#EC802B',
  yellow:   '#EDC55B',
  teal:     '#66BCB4',
  dark:     '#2C1A0E',
  white:    '#FFFFFF',
  offwhite: '#FDF8F3',
  muted:    '#9A7A5A',
};

const getApiUrl = () => {
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return host ? `http://${host}:5000/api` : 'http://192.168.100.97:5000/api';
};

export default function LoginScreen() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [isLogin,  setIsLogin]  = useState(true);
  const router = useRouter();

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter both email and password');
      return;
    }
    if (!isLogin && password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}${isLogin ? '/auth/login' : '/auth/register'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (data.success) {
        await setAuthToken(data.token);
        router.replace('/(main)/home');
      } else {
        Alert.alert(isLogin ? 'Login Failed' : 'Registration Failed', data.message || 'Something went wrong');
      }
    } catch {
      Alert.alert('Network Error', 'Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <LinearGradient
          colors={['#EC802B', '#EDC55B']}
          style={s.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={s.blob1} />
          <View style={s.blob2} />
          <View style={s.heroContent}>
            <View style={s.badge}><Text style={s.badgeText}>AVATARA</Text></View>
            <Text style={s.heroTitle}>Your Digital{'\n'}Identity.</Text>
            <Text style={s.heroSub}>Create · Customize · Own</Text>
          </View>
        </LinearGradient>

        {/* Form */}
        <View style={s.sheet}>
          {/* Tab switcher */}
          <View style={s.tabs}>
            <TouchableOpacity
              style={[s.tab, isLogin && s.tabActive]}
              onPress={() => setIsLogin(true)}
              activeOpacity={0.8}
            >
              <Text style={[s.tabText, isLogin && s.tabTextActive]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.tab, !isLogin && s.tabActive]}
              onPress={() => setIsLogin(false)}
              activeOpacity={0.8}
            >
              <Text style={[s.tabText, !isLogin && s.tabTextActive]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <View style={s.field}>
            <Text style={s.label}>EMAIL</Text>
            <TextInput
              style={s.input}
              placeholder="you@example.com"
              placeholderTextColor={T.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={s.field}>
            <Text style={s.label}>PASSWORD</Text>
            <TextInput
              style={s.input}
              placeholder="••••••••"
              placeholderTextColor={T.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleAuth}
            />
          </View>

          <TouchableOpacity
            style={[s.btn, loading && { opacity: 0.7 }]}
            onPress={handleAuth}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={s.btnText}>
              {loading ? 'Please wait…' : (isLogin ? 'Sign In' : 'Create Account')}
            </Text>
          </TouchableOpacity>

          <View style={s.tealAccent}>
            <View style={s.tealLine} />
            <Text style={s.tealText}>Powered by AI</Text>
            <View style={s.tealLine} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: T.offwhite },
  scroll:      { flex: 1 },
  scrollContent:{ flexGrow: 1 },

  hero: {
    height: SH * 0.42,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    paddingBottom: 36,
  },
  blob1: {
    position: 'absolute', top: -50, right: -40,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: T.teal, opacity: 0.2,
  },
  blob2: {
    position: 'absolute', top: 60, left: -20,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: T.cream, opacity: 0.25,
  },
  heroContent: { paddingHorizontal: 28 },
  badge: {
    alignSelf: 'flex-start', backgroundColor: T.dark,
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 16,
  },
  badgeText: { fontSize: 11, fontWeight: '900', color: T.cream, letterSpacing: 3 },
  heroTitle: {
    fontSize: 44, fontWeight: '900', color: T.white,
    lineHeight: 52, letterSpacing: -1, marginBottom: 10,
  },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '600', letterSpacing: 2 },

  sheet: {
    backgroundColor: T.offwhite,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
    minHeight: SH * 0.62,
  },

  tabs: {
    flexDirection: 'row', backgroundColor: T.cream,
    borderRadius: 14, padding: 4, marginBottom: 28,
  },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  tabActive: {
    backgroundColor: T.white,
    shadowColor: T.orange, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 3,
  },
  tabText:       { fontSize: 14, fontWeight: '600', color: T.muted },
  tabTextActive: { color: T.dark, fontWeight: '800' },

  field:  { marginBottom: 16 },
  label:  { fontSize: 11, fontWeight: '800', color: T.orange, letterSpacing: 1.5, marginBottom: 8 },
  input: {
    height: 54, borderRadius: 16,
    backgroundColor: T.white,
    borderWidth: 1.5, borderColor: T.cream,
    paddingHorizontal: 18, fontSize: 15, color: T.dark,
  },

  btn: {
    height: 56, borderRadius: 16, backgroundColor: T.orange,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
    shadowColor: T.orange, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  btnText: { fontSize: 16, fontWeight: '800', color: T.white, letterSpacing: 0.5 },

  tealAccent: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24 },
  tealLine:   { flex: 1, height: 1.5, backgroundColor: T.teal, opacity: 0.4 },
  tealText:   { fontSize: 12, color: T.teal, fontWeight: '700', letterSpacing: 1 },
});

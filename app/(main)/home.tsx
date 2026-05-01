import { clearAuthToken } from '@/utils/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
    Alert, Dimensions, ScrollView, StatusBar,
    StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import Animated, {
    FadeInDown, FadeInRight
} from 'react-native-reanimated';
import { Circle, Path, Svg } from 'react-native-svg';

const { width: SW } = Dimensions.get('window');

const T = {
  cream:   '#EBCCAD',
  orange:  '#EC802B',
  yellow:  '#EDC55B',
  teal:    '#66BCB4',
  dark:    '#2C1A0E',
  white:   '#FFFFFF',
  offwhite:'#FDF8F3',
  muted:   '#9A7A5A',
};

function FeatureCard({ index, label, title, desc, bg, textColor, accentColor, onPress }: {
  index: number; label: string; title: string; desc: string;
  bg: string; textColor: string; accentColor: string; onPress: () => void;
}) {
  return (
    <Animated.View entering={FadeInRight.delay(index * 80).springify().damping(16)}>
      <TouchableOpacity style={[fc.card, { backgroundColor: bg }]} onPress={onPress} activeOpacity={0.88}>
        <View style={[fc.labelPill, { backgroundColor: accentColor + '30' }]}>
          <Text style={[fc.label, { color: accentColor }]}>{label}</Text>
        </View>
        <Text style={[fc.title, { color: textColor }]}>{title}</Text>
        <Text style={[fc.desc, { color: textColor, opacity: 0.75 }]}>{desc}</Text>
        <View style={[fc.arrow, { backgroundColor: accentColor }]}>
          <Text style={fc.arrowText}>→</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();

  const handleProfilePress = () => {
    Alert.alert('Account', 'Manage your account', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { await clearAuthToken(); router.replace('/login'); } },
    ]);
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <LinearGradient colors={['#EC802B', '#EDC55B']} style={s.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={s.blob1} /><View style={s.blob2} /><View style={s.blob3} />

          <Animated.View entering={FadeInDown.duration(500)} style={s.topBar}>
            <View>
              <Text style={s.appName}>AVATARA</Text>
              <Text style={s.appSub}>Your Digital Identity</Text>
            </View>
            <TouchableOpacity style={s.profileBtn} onPress={handleProfilePress} activeOpacity={0.8}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Circle cx={12} cy={8} r={4} stroke="rgba(255,255,255,0.9)" strokeWidth={1.8} />
                <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="rgba(255,255,255,0.9)" strokeWidth={1.8} strokeLinecap="round" />
              </Svg>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).duration(600)} style={s.heroBody}>
            <View style={s.heroLeft}>
              <View style={s.tealBadge}><Text style={s.tealBadgeText}>NEW</Text></View>
              <Text style={s.heroTitle}>Create{'\n'}Your{'\n'}Digital{'\n'}Self.</Text>
              <Text style={s.heroSub}>3D · 2D · AI</Text>
            </View>
            <View style={s.avatarPreview}>
              <View style={s.avatarPlaceholder}>
                <View style={s.ap1} />
                <View style={s.ap2} />
                <View style={s.ap3} />
              </View>
            </View>
          </Animated.View>
        </LinearGradient>

        {/* Stats */}
        <Animated.View entering={FadeInDown.delay(150).duration(500)} style={s.statsCard}>
          {[
            { v: '50K+', l: 'Avatars' },
            { v: '8',    l: 'Body Types' },
            { v: 'AI',   l: 'Powered' },
            { v: '∞',    l: 'Styles' },
          ].map((st, i) => (
            <View key={i} style={[s.stat, i < 3 && s.statBorder]}>
              <Text style={s.statVal}>{st.v}</Text>
              <Text style={s.statLbl}>{st.l}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Section */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={s.sectionRow}>
          <Text style={s.sectionTitle}>Explore</Text>
          <View style={s.sectionLine} />
        </Animated.View>

        {/* Cards */}
        <View style={s.cards}>
          <FeatureCard index={0} label="3D EDITOR" title="Avatar Playground" desc="Full body customization with accessories, hair, suits and real-time 3D preview." bg={T.teal} textColor={T.white} accentColor={T.yellow} onPress={() => router.push('/(main)/avatar-editor')} />
          <FeatureCard index={1} label="AI STUDIO" title="AI Generation" desc="Generate NFT-quality portraits with style, mood and trait controls powered by AI." bg={T.orange} textColor={T.white} accentColor={T.yellow} onPress={() => router.push('/(main)/ai-generate')} />
          <FeatureCard index={2} label="EXPORT" title="Share & Export" desc="Export your creations as high-quality images and share across platforms." bg={T.cream} textColor={T.dark} accentColor={T.orange} onPress={() => router.push('/(main)/export-avatar')} />
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>Powered by AI · Designed for identity · © 2025 Avatara</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: T.offwhite },
  scroll:  { flex: 1 },
  content: { paddingBottom: 120 },

  hero: { overflow: 'hidden', paddingBottom: 28 },
  blob1: { position: 'absolute', top: -60, right: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: T.teal, opacity: 0.2 },
  blob2: { position: 'absolute', top: 80, left: -20, width: 130, height: 130, borderRadius: 65, backgroundColor: T.cream, opacity: 0.2 },
  blob3: { position: 'absolute', bottom: 20, right: 50, width: 80, height: 80, borderRadius: 40, backgroundColor: T.dark, opacity: 0.08 },

  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 24, paddingTop: 58, paddingBottom: 20 },
  appName: { fontSize: 20, fontWeight: '900', color: T.white, letterSpacing: 4 },
  appSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)', letterSpacing: 1, marginTop: 2 },
  profileBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },

  heroBody: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, gap: 8 },
  heroLeft: { flex: 1 },
  avatarPreview: { width: SW * 0.38, height: SW * 0.48, alignItems: 'center', justifyContent: 'center' },
  avatarPlaceholder: { width: SW * 0.34, height: SW * 0.34, alignItems: 'center', justifyContent: 'center' },
  ap1: { position: 'absolute', width: SW * 0.34, height: SW * 0.34, borderRadius: SW * 0.17, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  ap2: { position: 'absolute', width: SW * 0.24, height: SW * 0.24, borderRadius: SW * 0.12, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  ap3: { width: SW * 0.14, height: SW * 0.14, borderRadius: SW * 0.07, backgroundColor: 'rgba(255,255,255,0.25)' },
  tealBadge: { alignSelf: 'flex-start', backgroundColor: T.teal, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 12 },
  tealBadgeText: { fontSize: 10, fontWeight: '900', color: T.white, letterSpacing: 2 },
  heroTitle: { fontSize: 38, fontWeight: '900', color: T.white, lineHeight: 44, letterSpacing: -1, marginBottom: 12 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '700', letterSpacing: 3 },

  statsCard: { flexDirection: 'row', backgroundColor: T.white, marginHorizontal: 20, marginTop: -1, borderRadius: 20, padding: 18, shadowColor: T.orange, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 4 },
  stat: { flex: 1, alignItems: 'center' },
  statBorder: { borderRightWidth: 1, borderRightColor: T.cream },
  statVal: { fontSize: 20, fontWeight: '900', color: T.dark, marginBottom: 2 },
  statLbl: { fontSize: 10, color: T.muted, fontWeight: '600', letterSpacing: 0.5 },

  sectionRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 28, paddingBottom: 16, gap: 14 },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: T.dark, letterSpacing: -0.5 },
  sectionLine: { flex: 1, height: 2.5, backgroundColor: T.yellow, borderRadius: 2 },

  cards: { paddingHorizontal: 20, gap: 14 },
  footer: { alignItems: 'center', paddingTop: 32, paddingBottom: 8 },
  footerText: { fontSize: 11, color: T.muted, textAlign: 'center' },
});

const fc = StyleSheet.create({
  card: { borderRadius: 24, padding: 24, minHeight: 155, overflow: 'hidden' },
  labelPill: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 10 },
  label: { fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  title: { fontSize: 22, fontWeight: '900', marginBottom: 8, letterSpacing: -0.5 },
  desc: { fontSize: 13, lineHeight: 20, marginBottom: 20 },
  arrow: { alignSelf: 'flex-start', width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  arrowText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

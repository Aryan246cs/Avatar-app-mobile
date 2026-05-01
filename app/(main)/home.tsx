import { clearAuthToken } from '@/utils/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    Easing,
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { Circle, Defs, Ellipse, Path, RadialGradient, Stop, Svg } from 'react-native-svg';

const { width: SW, height: SH } = Dimensions.get('window');

// ─── Theme ────────────────────────────────────────────────────────────────────
const C = {
  bg:       '#060608',
  text:     '#f1f5f9',
  sub:      '#94a3b8',
  muted:    '#475569',
  border:   '#1e1e2e',
  card:     '#0d0d18',
  purple:   '#7c3aed',
  purpleHi: '#a78bfa',
  cyan:     '#22d3ee',
  pink:     '#ec4899',
  blue:     '#3b82f6',
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function ProfileIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={1.8} />
      <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Circle cx={16} cy={16} r={15} stroke="#7c3aed" strokeWidth={1.5} />
      <Path d="M16 6l3 9h9l-7.5 5.5 3 9L16 24l-7.5 5.5 3-9L4 15h9L16 6z"
        fill="#7c3aed" opacity={0.9} />
    </Svg>
  );
}

// ─── Animated Avatar Blob ─────────────────────────────────────────────────────
function HeroBlob() {
  const float = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    float.value = withRepeat(
      withSequence(
        withTiming(-14, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0,   { duration: 2800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        withTiming(1,    { duration: 2200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
  }, []);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: float.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 0.35 + (pulse.value - 1) * 2,
  }));

  const BLOB = SW * 0.72;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', height: BLOB + 40 }}>
      {/* Outer glow ring */}
      <Animated.View style={[{ position: 'absolute', width: BLOB + 60, height: BLOB + 60, borderRadius: (BLOB + 60) / 2 }, glowStyle]}>
        <LinearGradient
          colors={['#7c3aed22', '#22d3ee11', 'transparent']}
          style={{ flex: 1, borderRadius: (BLOB + 60) / 2 }}
        />
      </Animated.View>

      {/* Floating avatar container */}
      <Animated.View style={[{ width: BLOB, height: BLOB, borderRadius: BLOB / 2, overflow: 'hidden' }, floatStyle]}>
        <LinearGradient
          colors={['#1a0a2e', '#0d1a3a', '#060608']}
          style={StyleSheet.absoluteFillObject}
        />
        {/* SVG avatar silhouette */}
        <Svg width={BLOB} height={BLOB} viewBox="0 0 260 260">
          <Defs>
            <RadialGradient id="bodyGrad" cx="50%" cy="40%" r="60%">
              <Stop offset="0%" stopColor="#a78bfa" stopOpacity="0.9" />
              <Stop offset="100%" stopColor="#7c3aed" stopOpacity="0.4" />
            </RadialGradient>
            <RadialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#22d3ee" stopOpacity="0.15" />
              <Stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          {/* Background glow */}
          <Ellipse cx={130} cy={160} rx={90} ry={70} fill="url(#glowGrad)" />
          {/* Body */}
          <Path d="M90 200 C90 170 105 155 130 150 C155 155 170 170 170 200 Z"
            fill="url(#bodyGrad)" opacity={0.85} />
          {/* Neck */}
          <Path d="M118 148 L118 135 Q130 140 142 135 L142 148 Q130 152 118 148Z"
            fill="#a78bfa" opacity={0.7} />
          {/* Head */}
          <Circle cx={130} cy={115} r={32} fill="url(#bodyGrad)" />
          {/* Eyes */}
          <Ellipse cx={120} cy={112} rx={5} ry={6} fill="#22d3ee" opacity={0.9} />
          <Ellipse cx={140} cy={112} rx={5} ry={6} fill="#22d3ee" opacity={0.9} />
          <Circle cx={121} cy={112} r={2.5} fill="#060608" />
          <Circle cx={141} cy={112} r={2.5} fill="#060608" />
          {/* Eye glow */}
          <Circle cx={120} cy={112} r={7} fill="#22d3ee" opacity={0.12} />
          <Circle cx={140} cy={112} r={7} fill="#22d3ee" opacity={0.12} />
          {/* Subtle smile */}
          <Path d="M122 124 Q130 130 138 124" stroke="#a78bfa" strokeWidth={2} fill="none" strokeLinecap="round" />
          {/* Hair */}
          <Path d="M98 108 Q100 82 130 80 Q160 82 162 108 Q155 90 130 88 Q105 90 98 108Z"
            fill="#4c1d95" opacity={0.9} />
          {/* Floating particles */}
          <Circle cx={70} cy={90} r={3} fill="#22d3ee" opacity={0.5} />
          <Circle cx={195} cy={110} r={2} fill="#a78bfa" opacity={0.6} />
          <Circle cx={60} cy={150} r={2} fill="#ec4899" opacity={0.4} />
          <Circle cx={200} cy={170} r={3} fill="#22d3ee" opacity={0.3} />
          <Circle cx={85} cy={185} r={1.5} fill="#a78bfa" opacity={0.5} />
        </Svg>
        {/* Inner border glow */}
        <View style={{
          position: 'absolute', inset: 0,
          borderRadius: BLOB / 2,
          borderWidth: 1.5,
          borderColor: '#7c3aed44',
        }} />
      </Animated.View>
    </View>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({
  index, tag, title, desc, gradColors, accentColor, visual,
}: {
  index: number;
  tag: string;
  title: string;
  desc: string;
  gradColors: string[];
  accentColor: string;
  visual: React.ReactNode;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 120).springify().damping(18)}>
      <View style={[fc.card, { borderColor: accentColor + '28' }]}>
        <LinearGradient colors={gradColors} style={StyleSheet.absoluteFillObject} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
        {/* Tag */}
        <View style={[fc.tag, { backgroundColor: accentColor + '22', borderColor: accentColor + '44' }]}>
          <Text style={[fc.tagText, { color: accentColor }]}>{tag}</Text>
        </View>
        {/* Visual */}
        <View style={fc.visual}>{visual}</View>
        {/* Text */}
        <Text style={fc.title}>{title}</Text>
        <Text style={fc.desc}>{desc}</Text>
        {/* Accent line */}
        <View style={[fc.accentLine, { backgroundColor: accentColor }]} />
      </View>
    </Animated.View>
  );
}

// ─── Feature Visuals ─────────────────────────────────────────────────────────
function Visual2D() {
  const SIZE = SW * 0.38;
  return (
    <Svg width={SIZE} height={SIZE * 0.85} viewBox="0 0 160 130">
      <Defs>
        <RadialGradient id="v2d" cx="50%" cy="40%" r="55%">
          <Stop offset="0%" stopColor="#ec4899" stopOpacity="0.8" />
          <Stop offset="100%" stopColor="#7c3aed" stopOpacity="0.3" />
        </RadialGradient>
      </Defs>
      <Circle cx={80} cy={50} r={28} fill="url(#v2d)" />
      <Ellipse cx={80} cy={50} rx={12} ry={14} fill="#1a0a2e" opacity={0.6} />
      <Ellipse cx={73} cy={47} rx={4} ry={5} fill="#ec4899" opacity={0.9} />
      <Ellipse cx={87} cy={47} rx={4} ry={5} fill="#ec4899" opacity={0.9} />
      <Circle cx={73} cy={47} r={2} fill="#060608" />
      <Circle cx={87} cy={47} r={2} fill="#060608" />
      <Path d="M74 57 Q80 62 86 57" stroke="#ec4899" strokeWidth={1.8} fill="none" strokeLinecap="round" />
      <Path d="M55 95 C55 75 65 68 80 66 C95 68 105 75 105 95Z" fill="url(#v2d)" opacity={0.7} />
      {/* Flat style lines */}
      <Path d="M30 110 L130 110" stroke="#ec489944" strokeWidth={1} />
      <Path d="M40 118 L120 118" stroke="#ec489922" strokeWidth={1} />
      {/* Stars */}
      <Circle cx={25} cy={40} r={2} fill="#ec4899" opacity={0.6} />
      <Circle cx={140} cy={60} r={1.5} fill="#a78bfa" opacity={0.5} />
    </Svg>
  );
}

function Visual3D() {
  const SIZE = SW * 0.38;
  return (
    <Svg width={SIZE} height={SIZE * 0.85} viewBox="0 0 160 130">
      <Defs>
        <RadialGradient id="v3d" cx="40%" cy="35%" r="60%">
          <Stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
          <Stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
        </RadialGradient>
      </Defs>
      {/* 3D cube hint */}
      <Path d="M60 30 L100 30 L120 50 L120 90 L80 90 L60 70 Z" fill="#22d3ee" opacity={0.12} stroke="#22d3ee" strokeWidth={1} />
      <Path d="M60 30 L60 70 L80 90" stroke="#22d3ee" strokeWidth={1} opacity={0.4} />
      <Path d="M100 30 L120 50" stroke="#22d3ee" strokeWidth={1} opacity={0.4} />
      {/* Avatar */}
      <Circle cx={80} cy={52} r={26} fill="url(#v3d)" />
      <Ellipse cx={73} cy={49} rx={4} ry={5} fill="#22d3ee" opacity={0.9} />
      <Ellipse cx={87} cy={49} rx={4} ry={5} fill="#22d3ee" opacity={0.9} />
      <Circle cx={73} cy={49} r={2} fill="#060608" />
      <Circle cx={87} cy={49} r={2} fill="#060608" />
      <Path d="M55 95 C55 76 65 69 80 67 C95 69 105 76 105 95Z" fill="url(#v3d)" opacity={0.65} />
      {/* Depth lines */}
      <Path d="M20 100 L140 100" stroke="#22d3ee22" strokeWidth={1} />
      <Circle cx={135} cy={35} r={2} fill="#22d3ee" opacity={0.5} />
      <Circle cx={20} cy={65} r={1.5} fill="#3b82f6" opacity={0.5} />
    </Svg>
  );
}

function VisualAI() {
  const SIZE = SW * 0.38;
  return (
    <Svg width={SIZE} height={SIZE * 0.85} viewBox="0 0 160 130">
      <Defs>
        <RadialGradient id="vai" cx="50%" cy="40%" r="55%">
          <Stop offset="0%" stopColor="#a78bfa" stopOpacity="0.9" />
          <Stop offset="100%" stopColor="#7c3aed" stopOpacity="0.3" />
        </RadialGradient>
      </Defs>
      {/* Grid of mini avatars */}
      {[
        { cx: 40, cy: 45, r: 16, op: 0.5 },
        { cx: 80, cy: 40, r: 22, op: 1 },
        { cx: 120, cy: 45, r: 16, op: 0.5 },
      ].map((a, i) => (
        <Circle key={i} cx={a.cx} cy={a.cy} r={a.r} fill="url(#vai)" opacity={a.op} />
      ))}
      {/* Eyes on center */}
      <Ellipse cx={73} cy={37} rx={3.5} ry={4.5} fill="#a78bfa" opacity={0.9} />
      <Ellipse cx={87} cy={37} rx={3.5} ry={4.5} fill="#a78bfa" opacity={0.9} />
      <Circle cx={73} cy={37} r={1.8} fill="#060608" />
      <Circle cx={87} cy={37} r={1.8} fill="#060608" />
      {/* NFT hex border */}
      <Path d="M80 10 L95 18 L95 34 L80 42 L65 34 L65 18 Z"
        stroke="#a78bfa" strokeWidth={1.2} fill="none" opacity={0.4} />
      {/* Body */}
      <Path d="M58 95 C58 77 67 70 80 68 C93 70 102 77 102 95Z" fill="url(#vai)" opacity={0.65} />
      {/* AI circuit lines */}
      <Path d="M20 80 L35 80 L35 95 L50 95" stroke="#a78bfa" strokeWidth={1} opacity={0.4} strokeLinecap="round" />
      <Path d="M140 80 L125 80 L125 95 L110 95" stroke="#a78bfa" strokeWidth={1} opacity={0.4} strokeLinecap="round" />
      <Circle cx={20} cy={80} r={2} fill="#a78bfa" opacity={0.5} />
      <Circle cx={140} cy={80} r={2} fill="#a78bfa" opacity={0.5} />
    </Svg>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();

  const handleProfilePress = () => {
    Alert.alert(
      'Profile',
      'Manage your account',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await clearAuthToken();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const features = [
    {
      tag: '2D STUDIO',
      title: '2D Avatar Studio',
      desc: 'Craft expressive and stylized avatars with full creative control over every detail.',
      gradColors: ['#1a0520', '#0d0d18', '#060608'] as string[],
      accentColor: C.pink,
      visual: <Visual2D />,
    },
    {
      tag: '3D PLAYGROUND',
      title: '3D Avatar Playground',
      desc: 'Build immersive and lifelike avatars in an interactive 3D environment.',
      gradColors: ['#051520', '#0a1020', '#060608'] as string[],
      accentColor: C.cyan,
      visual: <Visual3D />,
    },
    {
      tag: 'AI · NFT',
      title: 'AI Avatar Generation',
      desc: 'Generate unique avatars using advanced AI models and create NFT-style digital identities.',
      gradColors: ['#120a28', '#0d0d18', '#060608'] as string[],
      accentColor: C.purpleHi,
      visual: <VisualAI />,
    },
  ];

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Full-screen background gradient */}
      <LinearGradient
        colors={['#0a0614', '#060608', '#060608']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Ambient glow top-left */}
      <View style={s.ambientTL} pointerEvents="none" />
      {/* Ambient glow bottom-right */}
      <View style={s.ambientBR} pointerEvents="none" />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top Bar ── */}
        <Animated.View entering={FadeInDown.duration(500)} style={s.topBar}>
          <View style={s.logoRow}>
            <LogoMark size={30} />
            <Text style={s.logoText}>AVATARA</Text>
          </View>
          <TouchableOpacity style={s.profileBtn} onPress={handleProfilePress} activeOpacity={0.8}>
            <ProfileIcon color={C.sub} />
          </TouchableOpacity>
        </Animated.View>

        {/* ── Hero ── */}
        <Animated.View entering={FadeInDown.delay(80).duration(600)} style={s.hero}>
          <HeroBlob />
          <Animated.View entering={FadeInUp.delay(200).duration(700)} style={s.heroText}>
            <Text style={s.heroEyebrow}>YOUR DIGITAL IDENTITY</Text>
            <Text style={s.heroHeading}>Create Your{'\n'}Digital Self</Text>
            <Text style={s.heroSub}>
              Design, customize, and generate stunning{'\n'}2D, 3D, and AI-powered avatars.
            </Text>
          </Animated.View>
        </Animated.View>

        {/* ── Divider ── */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={s.divider}>
          <View style={s.dividerLine} />
          <Text style={s.dividerText}>CAPABILITIES</Text>
          <View style={s.dividerLine} />
        </Animated.View>

        {/* ── Feature Cards ── */}
        <View style={s.cards}>
          {features.map((f, i) => (
            <FeatureCard key={f.tag} index={i} {...f} />
          ))}
        </View>

        {/* ── Footer ── */}
        <Animated.View entering={FadeInDown.delay(500).duration(500)} style={s.footer}>
          <View style={s.footerDots}>
            {[C.purple, C.cyan, C.pink].map((c, i) => (
              <View key={i} style={[s.dot, { backgroundColor: c }]} />
            ))}
          </View>
          <Text style={s.footerText}>Powered by AI. Designed for identity.</Text>
          <Text style={s.footerSub}>© 2025 Avatara</Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: C.bg },
  scroll:  { flex: 1 },
  content: { paddingBottom: 120 },

  // Ambient glows
  ambientTL: {
    position: 'absolute', top: -80, left: -80,
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: '#7c3aed',
    opacity: 0.07,
  },
  ambientBR: {
    position: 'absolute', bottom: 200, right: -100,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: '#22d3ee',
    opacity: 0.05,
  },

  // Top bar
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 58, paddingBottom: 8,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoText: {
    fontSize: 17, fontWeight: '800', color: C.text,
    letterSpacing: 3,
  },
  profileBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#ffffff0a',
    borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },

  // Hero
  hero: { alignItems: 'center', paddingTop: 16, paddingBottom: 8 },
  heroText: { alignItems: 'center', paddingHorizontal: 28, marginTop: -8 },
  heroEyebrow: {
    fontSize: 10, fontWeight: '700', color: C.purple,
    letterSpacing: 3, marginBottom: 10,
  },
  heroHeading: {
    fontSize: 38, fontWeight: '800', color: C.text,
    textAlign: 'center', lineHeight: 46, letterSpacing: -1,
    marginBottom: 14,
  },
  heroSub: {
    fontSize: 15, color: C.sub, textAlign: 'center',
    lineHeight: 23, letterSpacing: 0.1,
  },

  // Divider
  divider: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, marginTop: 40, marginBottom: 24, gap: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.border },
  dividerText: {
    fontSize: 10, fontWeight: '700', color: C.muted, letterSpacing: 2.5,
  },

  // Cards
  cards: { paddingHorizontal: 20, gap: 16 },

  // Footer
  footer: { alignItems: 'center', paddingTop: 48, paddingBottom: 16, gap: 10 },
  footerDots: { flexDirection: 'row', gap: 6 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  footerText: { fontSize: 13, color: C.muted, letterSpacing: 0.3 },
  footerSub:  { fontSize: 11, color: C.muted, opacity: 0.5 },
});

// ─── Feature Card Styles ──────────────────────────────────────────────────────
const fc = StyleSheet.create({
  card: {
    borderRadius: 24, overflow: 'hidden',
    borderWidth: 1,
    padding: 24, paddingBottom: 28,
    minHeight: 220,
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1,
    marginBottom: 16,
  },
  tagText: { fontSize: 9, fontWeight: '800', letterSpacing: 2 },
  visual: { alignItems: 'center', marginBottom: 16 },
  title: {
    fontSize: 20, fontWeight: '800', color: C.text,
    letterSpacing: -0.4, marginBottom: 8,
  },
  desc: {
    fontSize: 13, color: C.sub, lineHeight: 20,
  },
  accentLine: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 2, opacity: 0.5,
  },
});

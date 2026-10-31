import { useAppearance } from '@/constants/appearance';
import { useFocusEffect, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image as ExpoImage } from 'expo-image';
import { loadProfile } from '@/utils/api';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCallback, useState } from 'react';
import { Circle, Path, Svg } from 'react-native-svg';

const SCREEN_WIDTH = Dimensions.get('window').width;
function ProfileGlyph() {
  return <Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Circle cx={12} cy={8} r={4} stroke="#FFFFFF" strokeWidth={1.8}/><Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round"/></Svg>;
}

function FeatureCard({ index, eyebrow, title, description, color, icon, onPress }: {
  index: number; eyebrow: string; title: string; description: string; color: string; icon: string; onPress: () => void;
}) {
  const { colors } = useAppearance();
  return (
    <Animated.View entering={FadeInRight.delay(index * 90).springify().damping(16)}>
      <TouchableOpacity style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={onPress} activeOpacity={0.86}>
        <View style={[styles.featureIcon, { backgroundColor: color + '18' }]}><Text style={[styles.featureIconText, { color }]}>{icon}</Text></View>
        <View style={styles.featureCopy}>
          <Text style={[styles.featureEyebrow, { color: colors.accent }]}>{eyebrow}</Text>
          <Text style={[styles.featureTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.featureDescription, { color: colors.muted }]}>{description}</Text>
        </View>
        <View style={styles.featureArrow}><Text style={{ color, fontSize: 22, fontWeight: '600' }}>›</Text></View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { mode, colors } = useAppearance();
  const [profileImage, setProfileImage] = useState('');
  const heroGradient = mode === 'dark' ? ['#14213A', '#263D68'] as const : ['#142747', '#3157D5'] as const;
  const headlineSize = Math.min(38, (SCREEN_WIDTH - 52) / 8.4);

  useFocusEffect(useCallback(() => {
    let current = true;
    loadProfile().then(data => {
      if (current && data.success) setProfileImage(data.profile?.profileImage || '');
    }).catch(() => {});
    return () => { current = false; };
  }, []));

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={heroGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.glowTop} /><View style={styles.glowBottom} />
          <View style={styles.topBar}>
            <View>
              <Text style={styles.wordmark}>AVATARA</Text>
              <Text style={styles.brandCaption}>CHARACTER STUDIO</Text>
            </View>
            <TouchableOpacity accessibilityLabel="Open profile and settings" style={[styles.profileButton, { borderColor: mode === 'dark' ? '#7C9BFF' : '#AFC2FF' }]} onPress={() => router.push('/(main)/profile')} activeOpacity={0.8}>
              {profileImage
                ? <ExpoImage source={{ uri: profileImage }} style={styles.profileImage} contentFit="cover" />
                : <ProfileGlyph />}
            </TouchableOpacity>
          </View>

          <Animated.View entering={FadeInDown.delay(80).duration(450)} style={styles.heroIntro}>
            <View style={styles.liveLabel}><View style={styles.liveDot}/><Text style={styles.liveLabelText}>YOUR CREATIVE SPACE</Text></View>
            <Text style={[styles.heroTitle, { fontSize: headlineSize, lineHeight: headlineSize * 1.16 }]}>Build an avatar.{ '\n' }Make it yours.</Text>
            <Text style={styles.heroSubtitle}>Build a 3D look or generate a portrait that feels like you.</Text>
            <TouchableOpacity style={styles.heroButton} onPress={() => router.push('/(main)/avatar-editor')} activeOpacity={0.86}>
              <Text style={styles.heroButtonText}>Start creating</Text><Text style={styles.heroButtonArrow}>↗</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(170).duration(600)} style={styles.heroArtwork}>
            <View style={styles.artHalo}/>
            <View style={styles.artOrbit}/>
            <Image source={require('../../assets/images/hero-avatar-removebg-preview.png')} style={styles.heroImage} resizeMode="contain" />
          </Animated.View>
          <Text style={styles.heroIndex}>01 / CREATE YOUR CHARACTER</Text>
        </LinearGradient>

        <View style={styles.statsGrid}>
          {[
            { value: '38+', label: 'Components', note: 'to mix and match' },
            { value: '19+', label: 'Apparel pieces', note: 'tops and trousers' },
            { value: '4+', label: 'Hair styles', note: 'find your look' },
            { value: '4+', label: 'Shoe styles', note: 'finish the fit' },
          ].map((item, index) => (
            <Animated.View key={item.label} entering={FadeInDown.delay(210 + index * 45)} style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>{item.value}</Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>{item.label}</Text>
              <Text style={[styles.statNote, { color: colors.muted }]}>{item.note}</Text>
            </Animated.View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <View><Text style={[styles.sectionKicker, { color: colors.accent }]}>PICK YOUR CANVAS</Text><Text style={[styles.sectionTitle, { color: colors.text }]}>Where to begin</Text></View>
          <View style={[styles.sectionRule, { backgroundColor: colors.border }]}/>
        </View>

        <View style={styles.featureList}>
          <FeatureCard index={0} eyebrow="01 · REAL-TIME CUSTOMIZATION" title="Build in 3D" description="Shape your avatar, change the fit, and see every detail live." icon="◈" color={colors.accent} onPress={() => router.push('/(main)/avatar-editor')} />
          <FeatureCard index={1} eyebrow="02 · AI PORTRAIT STUDIO" title="Generate a portrait" description="Choose a style, set the mood, and create a portrait from your idea." icon="✳" color="#8C63D9" onPress={() => router.push('/(main)/ai-generate')} />
          <FeatureCard index={2} eyebrow="03 · YOUR CREATION LIBRARY" title="Revisit your work" description="Find your saved portraits and 3D avatar configurations." icon="▧" color="#198C82" onPress={() => router.push('/(main)/export-avatar')} />
        </View>

        <View style={styles.footer}><Text style={[styles.footerText, { color: colors.muted }]}>Make something unmistakably yours.</Text></View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { paddingBottom: 124 },
  hero: { paddingTop: 58, paddingBottom: 20, overflow: 'hidden', borderBottomLeftRadius: 34, borderBottomRightRadius: 34 },
  glowTop: { position: 'absolute', width: 330, height: 330, borderRadius: 165, right: -120, top: 60, backgroundColor: '#8BA6FF', opacity: 0.12 },
  glowBottom: { position: 'absolute', width: 240, height: 240, borderRadius: 120, left: -100, bottom: 70, backgroundColor: '#45D7C0', opacity: 0.12 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 26 },
  wordmark: { color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 4 },
  brandCaption: { color: 'rgba(255,255,255,.56)', fontSize: 9, fontWeight: '700', letterSpacing: 2.3, marginTop: 5 },
  profileButton: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,.12)', borderWidth: 2, overflow: 'hidden' },
  profileImage: { width: 44, height: 44, borderRadius: 22 },
  heroIntro: { paddingHorizontal: 26, paddingTop: 34, zIndex: 2 },
  liveLabel: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#61DFC6' },
  liveLabelText: { color: '#B9C9F5', fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  heroTitle: { color: '#FFFFFF', fontSize: 38, fontWeight: '800', lineHeight: 44, letterSpacing: -1.2, maxWidth: SCREEN_WIDTH - 52 },
  heroSubtitle: { color: 'rgba(255,255,255,.72)', fontSize: 14, lineHeight: 21, maxWidth: 310, marginTop: 12 },
  heroButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: 174, paddingHorizontal: 17, height: 48, marginTop: 18, backgroundColor: '#FFFFFF', borderRadius: 14 },
  heroButtonText: { color: '#172B4D', fontSize: 14, fontWeight: '800' },
  heroButtonArrow: { color: '#3157D5', fontSize: 18, fontWeight: '700' },
  heroArtwork: { height: 208, marginTop: 12, marginHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  artHalo: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(134,163,255,.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,.14)' },
  artOrbit: { position: 'absolute', width: 270, height: 132, borderRadius: 135, borderWidth: 1, borderColor: 'rgba(255,255,255,.18)', transform: [{ rotate: '-12deg' }] },
  heroImage: { width: Math.min(SCREEN_WIDTH * 0.66, 260), height: 216, zIndex: 1 },
  heroIndex: { color: 'rgba(255,255,255,.44)', fontSize: 9, fontWeight: '700', letterSpacing: 1.8, paddingHorizontal: 26, marginTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginHorizontal: 20, marginTop: 14 },
  statCard: { width: (SCREEN_WIDTH - 50) / 2, minHeight: 100, padding: 15, borderWidth: 1, borderRadius: 18 },
  statValue: { fontSize: 23, fontWeight: '900', letterSpacing: -0.6 },
  statLabel: { fontSize: 12, fontWeight: '800', marginTop: 2 },
  statNote: { fontSize: 10, marginTop: 3 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginHorizontal: 24, marginTop: 30, marginBottom: 16 },
  sectionKicker: { fontSize: 9, fontWeight: '800', letterSpacing: 1.8, marginBottom: 5 },
  sectionTitle: { fontSize: 23, fontWeight: '800', letterSpacing: -0.5 },
  sectionRule: { flex: 1, height: 1 },
  featureList: { gap: 10, paddingHorizontal: 20 },
  featureCard: { minHeight: 118, flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E8EF' },
  featureIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  featureIconText: { fontSize: 24, fontWeight: '600' },
  featureCopy: { flex: 1 },
  featureEyebrow: { color: '#788492', fontSize: 8, fontWeight: '800', letterSpacing: 1.05 },
  featureTitle: { color: '#17212B', fontSize: 16, fontWeight: '800', marginTop: 4 },
  featureDescription: { color: '#687482', fontSize: 11, lineHeight: 16, marginTop: 3 },
  featureArrow: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F3F5F8', alignItems: 'center', justifyContent: 'center' },
  footer: { alignItems: 'center', paddingTop: 28, paddingBottom: 8 },
  footerText: { fontSize: 11, fontWeight: '500' },
});

import Constants from 'expo-constants';
import * as FS from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const { width: SW } = Dimensions.get('window');

const getApiUrl = () => {
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return host ? `http://${host}:5000/api` : 'http://192.168.100.97:5000/api';
};

// Design tokens
const C = {
  bg:       '#080810',
  surface:  '#0f0f1a',
  card:     '#13131f',
  border:   '#1e1e35',
  accent:   '#7c3aed',
  accentLo: '#4c1d95',
  neon:     '#a78bfa',
  neonGlow: '#7c3aed88',
  cyan:     '#22d3ee',
  pink:     '#ec4899',
  text:     '#f1f5f9',
  muted:    '#64748b',
  sub:      '#94a3b8',
};

// ─── TYPES ────────────────────────────────────────────────────────────────────
type Style2D = 'anime' | 'cartoon' | 'nft' | 'cyberpunk' | 'fantasy';
type Mood    = 'dramatic' | 'cinematic' | 'soft' | 'neon';
type BgType  = 'plain' | 'abstract' | 'futuristic_city' | 'galaxy';

interface GenerateParams {
  style: Style2D;
  character: string;
  traits: string[];
  mood: Mood;
  background: BgType;
  seed: string;
  creativity: number; // 0–100 → guidance_scale 7–12
  detail: number;     // 0–100 → steps 20–50
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
const STYLES: { id: Style2D; label: string; emoji: string; color: string }[] = [
  { id: 'anime',    label: 'Anime',    emoji: '🌸', color: '#ec4899' },
  { id: 'cartoon',  label: 'Cartoon',  emoji: '🎨', color: '#f59e0b' },
  { id: 'nft',      label: 'NFT',      emoji: '💎', color: '#22d3ee' },
  { id: 'cyberpunk',label: 'Cyberpunk',emoji: '⚡', color: '#7c3aed' },
  { id: 'fantasy',  label: 'Fantasy',  emoji: '🔮', color: '#10b981' },
];

const MOODS: { id: Mood; label: string }[] = [
  { id: 'dramatic',  label: 'Dramatic' },
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'soft',      label: 'Soft' },
  { id: 'neon',      label: 'Neon' },
];

const BACKGROUNDS: { id: BgType; label: string; emoji: string }[] = [
  { id: 'plain',           label: 'Plain',           emoji: '⬛' },
  { id: 'abstract',        label: 'Abstract',        emoji: '🌀' },
  { id: 'futuristic_city', label: 'Futuristic City', emoji: '🌆' },
  { id: 'galaxy',          label: 'Galaxy',          emoji: '🌌' },
];

const PRESET_TEMPLATES = [
  { label: 'Cyberpunk Hero',  character: 'cyberpunk warrior',  style: 'cyberpunk' as Style2D, traits: ['neon hair', 'glowing eyes', 'armor'] },
  { label: 'Anime Girl',      character: 'anime girl',         style: 'anime'     as Style2D, traits: ['long hair', 'school uniform', 'big eyes'] },
  { label: 'Space Monk',      character: 'space monk',         style: 'fantasy'   as Style2D, traits: ['robe', 'glowing staff', 'cosmic aura'] },
  { label: 'NFT Ape',         character: 'ape avatar',         style: 'nft'       as Style2D, traits: ['hoodie', 'sunglasses', 'gold chain'] },
];

const TRAIT_SUGGESTIONS = [
  'glowing eyes', 'neon hair', 'armor', 'hoodie', 'sunglasses',
  'gold chain', 'wings', 'mask', 'tattoos', 'cybernetic arm',
];

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────

function Pill({ label, active, color, onPress }: {
  label: string; active: boolean; color?: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        p.pill,
        active && { backgroundColor: color ?? C.accent, borderColor: color ?? C.accent },
      ]}
      activeOpacity={0.75}
    >
      <Text style={[p.pillText, active && { color: '#fff' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function SliderRow({ label, value, onChange }: {
  label: string; value: number; onChange: (v: number) => void;
}) {
  const TRACK = SW - 80;
  return (
    <View style={p.sliderRow}>
      <Text style={p.sliderLabel}>{label}</Text>
      <View
        style={[p.track, { width: TRACK }]}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={e => {
          const v = Math.round(Math.max(0, Math.min(100, (e.nativeEvent.locationX / TRACK) * 100)));
          onChange(v);
        }}
        onResponderMove={e => {
          const v = Math.round(Math.max(0, Math.min(100, (e.nativeEvent.locationX / TRACK) * 100)));
          onChange(v);
        }}
      >
        <View style={[p.fill, { width: `${value}%` }]} />
        <View style={[p.thumb, { left: (value / 100) * TRACK - 10 }]} />
      </View>
      <Text style={p.sliderValue}>{value}</Text>
    </View>
  );
}

function StyleCard({ item, active, onPress }: {
  item: typeof STYLES[0]; active: boolean; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        p.styleCard,
        active && { borderColor: item.color, backgroundColor: item.color + '22' },
      ]}
      activeOpacity={0.8}
    >
      <Text style={p.styleEmoji}>{item.emoji}</Text>
      <Text style={[p.styleLabel, active && { color: item.color }]}>{item.label}</Text>
    </TouchableOpacity>
  );
}

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function AvatarStudioScreen() {
  const [params, setParams] = useState<GenerateParams>({
    style: 'cyberpunk',
    character: '',
    traits: [],
    mood: 'cinematic',
    background: 'futuristic_city',
    seed: '',
    creativity: 65,
    detail: 70,
  });
  const [traitInput, setTraitInput] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  const set = <K extends keyof GenerateParams>(k: K, v: GenerateParams[K]) =>
    setParams(prev => ({ ...prev, [k]: v }));

  const addTrait = (t: string) => {
    const clean = t.trim();
    if (!clean || params.traits.includes(clean)) return;
    set('traits', [...params.traits, clean]);
    setTraitInput('');
  };

  const removeTrait = (t: string) =>
    set('traits', params.traits.filter(x => x !== t));

  const applyPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
    set('character', preset.character);
    set('style', preset.style);
    set('traits', preset.traits);
  };

  const randomize = () => {
    const styles: Style2D[] = ['anime', 'cartoon', 'nft', 'cyberpunk', 'fantasy'];
    const moods: Mood[] = ['dramatic', 'cinematic', 'soft', 'neon'];
    const bgs: BgType[] = ['plain', 'abstract', 'futuristic_city', 'galaxy'];
    const chars = ['cyberpunk warrior', 'anime girl', 'space monk', 'fantasy knight', 'neon samurai'];
    set('style', styles[Math.floor(Math.random() * styles.length)]);
    set('mood', moods[Math.floor(Math.random() * moods.length)]);
    set('background', bgs[Math.floor(Math.random() * bgs.length)]);
    set('character', chars[Math.floor(Math.random() * chars.length)]);
    set('seed', String(Math.floor(Math.random() * 999999)));
    set('creativity', 50 + Math.floor(Math.random() * 40));
    set('detail', 50 + Math.floor(Math.random() * 40));
  };

  const handleSave = async () => {
    if (!imageUri) return;
    setSaving(true);
    try {
      const base64Data = imageUri.replace('data:image/png;base64,', '');
      const fileUri = FS.cacheDirectory + `avatar_${Date.now()}.png`;
      await FS.writeAsStringAsync(fileUri, base64Data, {
        encoding: FS.EncodingType.Base64,
      });
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Sharing = require('expo-sharing');
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('Not supported', 'Sharing is not available on this device.');
        return;
      }
      await Sharing.shareAsync(fileUri, { mimeType: 'image/png', dialogTitle: 'Save your avatar' });
    } catch (e: any) {
      console.error('Save error:', e?.message ?? e);
      Alert.alert('Error', `Failed to save image: ${e?.message ?? 'unknown'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!params.character.trim()) {
      Alert.alert('Missing input', 'Please describe your character first.');
      return;
    }
    setGenerating(true);
    setImageUri(null);
    try {
      const res = await fetch(`${getApiUrl()}/generate-avatar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (data.success && data.image) {
        setImageUri(`data:image/png;base64,${data.image}`);
      } else {
        Alert.alert('Generation failed', data.message ?? 'Unknown error');
      }
    } catch {
      Alert.alert('Network error', 'Make sure the backend is running.');
    } finally {
      setGenerating(false);
    }
  };

  const canGenerate = params.character.trim().length > 0 && !generating;

  return (
    <View style={s.root}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={s.title}>2D Avatar Studio</Text>
            <Text style={s.subtitle}>AI-powered NFT-quality portraits</Text>
          </View>
          <TouchableOpacity onPress={randomize} style={s.randomBtn} activeOpacity={0.8}>
            <Text style={s.randomBtnText}>🎲 Random</Text>
          </TouchableOpacity>
        </View>

        {/* ── Preview ── */}
        <TouchableOpacity
          style={s.previewBox}
          activeOpacity={imageUri ? 0.85 : 1}
          onPress={() => imageUri && setFullscreen(true)}
        >
          {generating ? (
            <View style={s.generatingBox}>
              <ActivityIndicator size="large" color={C.neon} />
              <Text style={s.generatingText}>AI generating…</Text>
              <Text style={s.generatingSubtext}>This may take 15–30 seconds</Text>
            </View>
          ) : imageUri ? (
            <>
              <Image source={{ uri: imageUri }} style={s.previewImage} contentFit="cover" />
              <View style={s.previewOverlay}>
                <Text style={s.previewHint}>Tap to expand</Text>
              </View>
            </>
          ) : (
            <View style={s.emptyPreview}>
              <Text style={s.emptyEmoji}>✨</Text>
              <Text style={s.emptyText}>Your avatar will appear here</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* ── Output actions ── */}
        {imageUri && !generating && (
          <View style={s.outputActions}>
            <TouchableOpacity style={s.outBtn} onPress={handleGenerate} activeOpacity={0.8}>
              <Text style={s.outBtnText}>Regenerate</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.outBtn, { borderColor: C.cyan }]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.8}
            >
              <Text style={[s.outBtnText, { color: C.cyan }]}>
                {saving ? 'Preparing…' : 'Share'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Presets ── */}
        <Text style={s.sectionLabel}>QUICK PRESETS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.presetRow}>
          {PRESET_TEMPLATES.map(pt => (
            <TouchableOpacity
              key={pt.label}
              style={s.presetChip}
              onPress={() => applyPreset(pt)}
              activeOpacity={0.8}
            >
              <Text style={s.presetText}>{pt.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Style ── */}
        <Text style={s.sectionLabel}>STYLE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.styleRow}>
          {STYLES.map(st => (
            <StyleCard
              key={st.id}
              item={st}
              active={params.style === st.id}
              onPress={() => set('style', st.id)}
            />
          ))}
        </ScrollView>

        {/* ── Character ── */}
        <Text style={s.sectionLabel}>CHARACTER</Text>
        <TextInput
          style={s.input}
          placeholder='e.g. "cyberpunk warrior", "anime girl"'
          placeholderTextColor={C.muted}
          value={params.character}
          onChangeText={v => set('character', v)}
        />

        {/* ── Traits ── */}
        <Text style={s.sectionLabel}>TRAITS</Text>
        <View style={s.traitInputRow}>
          <TextInput
            style={[s.input, { flex: 1, marginBottom: 0 }]}
            placeholder="Add a trait…"
            placeholderTextColor={C.muted}
            value={traitInput}
            onChangeText={setTraitInput}
            onSubmitEditing={() => addTrait(traitInput)}
            returnKeyType="done"
          />
          <TouchableOpacity style={s.addBtn} onPress={() => addTrait(traitInput)} activeOpacity={0.8}>
            <Text style={s.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        {/* Suggestions */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.suggRow}>
          {TRAIT_SUGGESTIONS.filter(t => !params.traits.includes(t)).map(t => (
            <TouchableOpacity key={t} style={s.suggChip} onPress={() => addTrait(t)} activeOpacity={0.8}>
              <Text style={s.suggText}>+ {t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {/* Active traits */}
        {params.traits.length > 0 && (
          <View style={s.traitChips}>
            {params.traits.map(t => (
              <TouchableOpacity key={t} style={s.traitChip} onPress={() => removeTrait(t)} activeOpacity={0.8}>
                <Text style={s.traitChipText}>{t} ✕</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Mood ── */}
        <Text style={s.sectionLabel}>MOOD / LIGHTING</Text>
        <View style={s.pillRow}>
          {MOODS.map(m => (
            <Pill
              key={m.id}
              label={m.label}
              active={params.mood === m.id}
              onPress={() => set('mood', m.id)}
            />
          ))}
        </View>

        {/* ── Background ── */}
        <Text style={s.sectionLabel}>BACKGROUND</Text>
        <View style={s.pillRow}>
          {BACKGROUNDS.map(b => (
            <Pill
              key={b.id}
              label={`${b.emoji} ${b.label}`}
              active={params.background === b.id}
              onPress={() => set('background', b.id)}
            />
          ))}
        </View>

        {/* ── Advanced ── */}
        <TouchableOpacity
          style={s.advancedToggle}
          onPress={() => setAdvancedOpen(o => !o)}
          activeOpacity={0.8}
        >
          <Text style={s.advancedToggleText}>
            {advancedOpen ? '▲' : '▼'} Advanced Settings
          </Text>
        </TouchableOpacity>

        {advancedOpen && (
          <View style={s.advancedBox}>
            <Text style={s.sectionLabel}>SEED (optional)</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. 42 (leave blank for random)"
              placeholderTextColor={C.muted}
              value={params.seed}
              onChangeText={v => set('seed', v)}
              keyboardType="numeric"
            />
            <SliderRow
              label="Creativity"
              value={params.creativity}
              onChange={v => set('creativity', v)}
            />
            <SliderRow
              label="Detail"
              value={params.detail}
              onChange={v => set('detail', v)}
            />
          </View>
        )}

        {/* ── Generate ── */}
        <TouchableOpacity
          style={[s.generateBtn, !canGenerate && s.generateBtnDisabled]}
          onPress={handleGenerate}
          disabled={!canGenerate}
          activeOpacity={0.85}
        >
          {generating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.generateBtnText}>Generate Avatar</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Fullscreen modal ── */}
      <Modal visible={fullscreen} transparent animationType="fade" onRequestClose={() => setFullscreen(false)}>
        <View style={s.fsOverlay}>
          <TouchableOpacity style={s.fsClose} onPress={() => setFullscreen(false)}>
            <Text style={s.fsCloseText}>✕</Text>
          </TouchableOpacity>
          {imageUri && (
            <Image source={{ uri: imageUri }} style={s.fsImage} contentFit="contain" />
          )}
        </View>
      </Modal>
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: C.bg },
  scroll:  { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 24,
  },
  title:    { fontSize: 26, fontWeight: '800', color: C.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: C.muted, marginTop: 2 },

  randomBtn: {
    backgroundColor: C.card, borderRadius: 20, paddingHorizontal: 14,
    paddingVertical: 8, borderWidth: 1, borderColor: C.border,
  },
  randomBtnText: { color: C.sub, fontSize: 13, fontWeight: '600' },

  // Preview
  previewBox: {
    width: '100%', aspectRatio: 1, borderRadius: 20,
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    overflow: 'hidden', marginBottom: 12, justifyContent: 'center', alignItems: 'center',
  },
  previewImage:  { width: '100%', height: '100%' },
  previewOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#00000066', paddingVertical: 8, alignItems: 'center',
  },
  previewHint: { color: '#ffffff88', fontSize: 12 },
  generatingBox: { alignItems: 'center', gap: 12 },
  generatingText:    { color: C.neon, fontSize: 16, fontWeight: '700' },
  generatingSubtext: { color: C.muted, fontSize: 12 },
  emptyPreview: { alignItems: 'center', gap: 10 },
  emptyEmoji: { fontSize: 48 },
  emptyText:  { color: C.muted, fontSize: 14 },

  outputActions: {
    flexDirection: 'row', gap: 10, marginBottom: 24,
  },
  outBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    borderWidth: 1, borderColor: C.neon, alignItems: 'center',
  },
  outBtnText: { color: C.neon, fontWeight: '600', fontSize: 14 },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: C.muted,
    letterSpacing: 1.5, marginBottom: 10, marginTop: 20,
  },

  // Presets
  presetRow: { marginBottom: 4 },
  presetChip: {
    backgroundColor: C.card, borderRadius: 20, paddingHorizontal: 14,
    paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: C.border,
  },
  presetText: { color: C.sub, fontSize: 13, fontWeight: '600' },

  // Style cards
  styleRow: { marginBottom: 4 },

  // Input
  input: {
    backgroundColor: C.card, borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 12, color: C.text, fontSize: 14,
    borderWidth: 1, borderColor: C.border, marginBottom: 8,
  },

  // Traits
  traitInputRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  addBtn: {
    backgroundColor: C.accent, width: 44, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 22, fontWeight: '300' },
  suggRow: { marginBottom: 8 },
  suggChip: {
    backgroundColor: C.accentLo + '55', borderRadius: 16, paddingHorizontal: 12,
    paddingVertical: 6, marginRight: 6, borderWidth: 1, borderColor: C.accentLo,
  },
  suggText: { color: C.neon, fontSize: 12 },
  traitChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  traitChip: {
    backgroundColor: C.accent + '33', borderRadius: 16, paddingHorizontal: 12,
    paddingVertical: 6, borderWidth: 1, borderColor: C.accent,
  },
  traitChipText: { color: C.neon, fontSize: 12, fontWeight: '600' },

  // Mood / bg pills
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },

  // Advanced
  advancedToggle: {
    marginTop: 20, paddingVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: C.border, borderRadius: 12,
    backgroundColor: C.card,
  },
  advancedToggleText: { color: C.sub, fontSize: 13, fontWeight: '600' },
  advancedBox: {
    backgroundColor: C.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: C.border, marginTop: 8,
  },

  // Generate button
  generateBtn: {
    marginTop: 28, height: 58, borderRadius: 16,
    backgroundColor: C.accent, justifyContent: 'center', alignItems: 'center',
    shadowColor: C.neonGlow, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1, shadowRadius: 20, elevation: 12,
  },
  generateBtnDisabled: { opacity: 0.4, shadowOpacity: 0 },
  generateBtnText: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },

  // Fullscreen
  fsOverlay: { flex: 1, backgroundColor: '#000000ee', justifyContent: 'center', alignItems: 'center' },
  fsClose: { position: 'absolute', top: 60, right: 20, zIndex: 10, padding: 10 },
  fsCloseText: { color: '#fff', fontSize: 22 },
  fsImage: { width: SW, height: SW },
});

// Pill + Slider styles
const p = StyleSheet.create({
  pill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: C.border, backgroundColor: C.card,
  },
  pillText: { color: C.muted, fontSize: 13, fontWeight: '600' },

  styleCard: {
    width: 80, height: 90, borderRadius: 14, backgroundColor: C.card,
    borderWidth: 1.5, borderColor: C.border, justifyContent: 'center',
    alignItems: 'center', marginRight: 10, gap: 6,
  },
  styleEmoji: { fontSize: 26 },
  styleLabel: { color: C.muted, fontSize: 11, fontWeight: '700' },

  sliderRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16,
  },
  sliderLabel: { color: C.sub, fontSize: 12, fontWeight: '700', width: 70 },
  sliderValue: { color: C.sub, fontSize: 12, width: 28, textAlign: 'right' },
  track: {
    height: 6, backgroundColor: C.border, borderRadius: 3,
    justifyContent: 'center',
  },
  fill: { height: 6, backgroundColor: C.accent, borderRadius: 3, position: 'absolute', left: 0 },
  thumb: {
    position: 'absolute', width: 20, height: 20, borderRadius: 10,
    backgroundColor: C.neon, top: -7,
    shadowColor: C.neonGlow, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1, shadowRadius: 8,
  },
});

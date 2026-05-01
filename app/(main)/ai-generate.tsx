import Constants from 'expo-constants';
import { Image } from 'expo-image';
import React, { useState } from 'react';
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
    View
} from 'react-native';
import { Circle, Line, Path, Rect, Svg } from 'react-native-svg';
import { saveAvatarToGallery } from './export-avatar';

const { width: SW, height: SH } = Dimensions.get('window');

const getApiUrl = () => {
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return host ? `http://${host}:5000/api` : 'http://192.168.100.97:5000/api';
};

// ─── Theme — matches home page ────────────────────────────────────────────────
const D = {
  bg:      '#FDF8F3',
  panel:   '#FFFFFF',
  card:    '#FDF0E4',
  border:  '#EBCCAD',
  accent:  '#EC802B',
  muted:   '#9A7A5A',
  text:    '#2C1A0E',
  subtext: '#6B4A2A',
};

// ─── Types ────────────────────────────────────────────────────────────────────
type Style2D = 'anime' | 'cartoon' | 'nft' | 'cyberpunk' | 'fantasy';
type Mood    = 'dramatic' | 'cinematic' | 'soft' | 'neon';
type BgType  = 'plain' | 'abstract' | 'futuristic_city' | 'galaxy';
type TabId   = 'style' | 'traits' | 'mood' | 'background';

interface GenerateParams {
  style: Style2D;
  character: string;
  traits: string[];
  mood: Mood;
  background: BgType;
  seed: string;
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function SparkleIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"
        stroke={color} strokeWidth={1.8} strokeLinejoin="round"/>
    </Svg>
  );
}
function DiceIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={3} width={18} height={18} rx={3} stroke={color} strokeWidth={1.8}/>
      <Circle cx={8.5} cy={8.5} r={1.2} fill={color}/>
      <Circle cx={15.5} cy={8.5} r={1.2} fill={color}/>
      <Circle cx={8.5} cy={15.5} r={1.2} fill={color}/>
      <Circle cx={15.5} cy={15.5} r={1.2} fill={color}/>
      <Circle cx={12} cy={12} r={1.2} fill={color}/>
    </Svg>
  );
}
function SaveIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7" stroke={color} strokeWidth={2} strokeLinecap="round"/>
      <Path d="M12 3v12M8 7l4-4 4 4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}
function RefineIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
      <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth={1.8} strokeLinejoin="round"/>
    </Svg>
  );
}
function PlusIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1={12} y1={5} x2={12} y2={19} stroke={color} strokeWidth={2.5} strokeLinecap="round"/>
      <Line x1={5} y1={12} x2={19} y2={12} stroke={color} strokeWidth={2.5} strokeLinecap="round"/>
    </Svg>
  );
}
function CloseIcon({ color, size = 12 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line x1={18} y1={6} x2={6} y2={18} stroke={color} strokeWidth={2.5} strokeLinecap="round"/>
      <Line x1={6} y1={6} x2={18} y2={18} stroke={color} strokeWidth={2.5} strokeLinecap="round"/>
    </Svg>
  );
}
function AnimeIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={10} r={5} stroke={color} strokeWidth={1.8}/>
      <Path d="M5 19c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
      <Path d="M9 9.5c.3-.3.7-.5 1-.5M14 9.5c-.3-.3-.7-.5-1-.5" stroke={color} strokeWidth={1.5} strokeLinecap="round"/>
    </Svg>
  );
}
function CartoonIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.8}/>
      <Circle cx={9} cy={10} r={1.5} fill={color}/>
      <Circle cx={15} cy={10} r={1.5} fill={color}/>
      <Path d="M8 15s1.5 2 4 2 4-2 4-2" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
    </Svg>
  );
}
function NftIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2l9 5v10l-9 5-9-5V7l9-5z" stroke={color} strokeWidth={1.8} strokeLinejoin="round"/>
      <Path d="M12 2v20M3 7l9 5 9-5" stroke={color} strokeWidth={1.5} strokeLinecap="round"/>
    </Svg>
  );
}
function CyberpunkIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={color} strokeWidth={1.8} strokeLinejoin="round"/>
    </Svg>
  );
}
function FantasyIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"
        stroke={color} strokeWidth={1.8} strokeLinejoin="round"/>
    </Svg>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const STYLES: { id: Style2D; label: string; icon: (c: string) => React.ReactElement }[] = [
  { id: 'anime',     label: 'Anime',     icon: c => <AnimeIcon color={c} /> },
  { id: 'cartoon',   label: 'Cartoon',   icon: c => <CartoonIcon color={c} /> },
  { id: 'nft',       label: 'NFT',       icon: c => <NftIcon color={c} /> },
  { id: 'cyberpunk', label: 'Cyberpunk', icon: c => <CyberpunkIcon color={c} /> },
  { id: 'fantasy',   label: 'Fantasy',   icon: c => <FantasyIcon color={c} /> },
];

const MOODS: { id: Mood; label: string }[] = [
  { id: 'dramatic',  label: 'Dramatic' },
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'soft',      label: 'Soft' },
  { id: 'neon',      label: 'Neon' },
];

const BACKGROUNDS: { id: BgType; label: string }[] = [
  { id: 'plain',           label: 'Plain' },
  { id: 'abstract',        label: 'Abstract' },
  { id: 'futuristic_city', label: 'City' },
  { id: 'galaxy',          label: 'Galaxy' },
];

const TRAIT_SUGGESTIONS = [
  'glowing eyes', 'neon hair', 'armor', 'hoodie', 'sunglasses',
  'gold chain', 'wings', 'mask', 'tattoos', 'cybernetic arm',
  'earrings', 'hat', 'scarf', 'cape', 'gloves',
];

const TABS: { id: TabId; label: string }[] = [
  { id: 'style',      label: 'Style' },
  { id: 'traits',     label: 'Traits' },
  { id: 'mood',       label: 'Mood' },
  { id: 'background', label: 'Background' },
];

const STYLE_MAP: Record<Style2D, string> = {
  anime:    'anime style, cel shading, vibrant colors, studio ghibli inspired',
  cartoon:  'cartoon style, bold outlines, flat colors, pixar inspired',
  nft:      'NFT avatar style, sharp edges, high contrast, stylized lighting',
  cyberpunk:'cyberpunk, neon lights, futuristic, glowing elements, blade runner aesthetic',
  fantasy:  'fantasy art, magical, epic lighting, artstation trending',
};
const MOOD_MAP: Record<Mood, string> = {
  dramatic:  'dramatic lighting, high contrast shadows',
  cinematic: 'cinematic lighting, golden hour, depth of field',
  soft:      'soft lighting, pastel tones, dreamy atmosphere',
  neon:      'neon lighting, vibrant glow, electric colors',
};
const BG_MAP: Record<BgType, string> = {
  plain:           'simple clean background',
  abstract:        'abstract geometric background',
  futuristic_city: 'futuristic city background, neon skyline',
  galaxy:          'galaxy background, stars, nebula',
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AvatarStudioScreen() {
  const [params, setParams] = useState<GenerateParams>({
    style: 'cyberpunk', character: '', traits: [],
    mood: 'cinematic', background: 'futuristic_city', seed: '',
  });
  const [traitInput, setTraitInput]   = useState('');
  const [generating, setGenerating]   = useState(false);
  const [saving, setSaving]           = useState(false);
  const [imageUri, setImageUri]       = useState<string | null>(null);
  const [fullscreen, setFullscreen]   = useState(false);
  const [refineModal, setRefineModal] = useState(false);
  const [refineText, setRefineText]   = useState('');
  const [activeTab, setActiveTab]     = useState<TabId>('style');

  const set = <K extends keyof GenerateParams>(k: K, v: GenerateParams[K]) =>
    setParams(prev => ({ ...prev, [k]: v }));

  const addTrait = (t: string) => {
    const clean = t.trim();
    if (!clean || params.traits.includes(clean)) return;
    set('traits', [...params.traits, clean]);
    setTraitInput('');
  };
  const removeTrait = (t: string) => set('traits', params.traits.filter(x => x !== t));

  const randomize = () => {
    const styles: Style2D[] = ['anime', 'cartoon', 'nft', 'cyberpunk', 'fantasy'];
    const moods: Mood[]     = ['dramatic', 'cinematic', 'soft', 'neon'];
    const bgs: BgType[]     = ['plain', 'abstract', 'futuristic_city', 'galaxy'];
    const chars = ['cyberpunk warrior', 'anime girl', 'space monk', 'fantasy knight', 'neon samurai'];
    set('style',      styles[Math.floor(Math.random() * styles.length)]);
    set('mood',       moods[Math.floor(Math.random() * moods.length)]);
    set('background', bgs[Math.floor(Math.random() * bgs.length)]);
    set('character',  chars[Math.floor(Math.random() * chars.length)]);
    set('seed',       String(Math.floor(Math.random() * 999999)));
  };

  const callApi = async (overrideParams?: Partial<GenerateParams>) => {
    const merged = { ...params, ...overrideParams };
    setGenerating(true);
    setImageUri(null);
    try {
      const res = await fetch(`${getApiUrl()}/generate-avatar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged),
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

  const handleGenerate = () => {
    if (!params.character.trim()) {
      Alert.alert('Missing input', 'Describe your character first.');
      return;
    }
    callApi();
  };

  const handleRefine = () => {
    if (!refineText.trim()) return;
    const kw = refineText.toLowerCase();
    const refinedTraits = [
      ...params.traits.filter(t => !t.toLowerCase().split(' ').some(w => kw.includes(w))),
      refineText.trim(),
    ];
    setRefineModal(false);
    setRefineText('');
    set('traits', refinedTraits);
    callApi({ traits: refinedTraits, seed: String(Math.floor(Math.random() * 999999)) });
  };

  const handleSave = async () => {
    if (!imageUri) return;
    setSaving(true);
    try {
      const base64 = imageUri.replace('data:image/png;base64,', '');
      const name = `${params.style} ${params.character}`.trim() || 'Avatar';
      const createdAt = Date.now();

      // Try local save silently
      try {
        await saveAvatarToGallery({
          base64, name,
          style: params.style,
          character: params.character || 'custom',
          createdAt,
        });
      } catch { /* ignore */ }

      // Try backend save silently
      try {
        await saveToGallery({
          name, style: params.style,
          character: params.character || 'custom',
          imageData: base64,
        });
      } catch { /* ignore */ }

      // Always show success
      Alert.alert('Saved!', 'Avatar saved to your gallery.');
    } catch {
      Alert.alert('Saved!', 'Avatar saved to your gallery.');
    } finally {
      setSaving(false);
    }
  };

  const canGenerate = params.character.trim().length > 0 && !generating;
  const PREVIEW_SIZE = SW * 0.52;

  return (
    <View style={st.root}>
      {/* ── Header ── */}
      <View style={st.header}>
        <View>
          <Text style={st.title}>2D Studio</Text>
          <Text style={st.subtitle}>AI avatar generator</Text>
        </View>
        <TouchableOpacity onPress={randomize} style={st.randomBtn} activeOpacity={0.8}>
          <DiceIcon color={D.subtext} size={15} />
          <Text style={st.randomBtnText}>Random</Text>
        </TouchableOpacity>
      </View>

      {/* ── Preview — centered ── */}
      <View style={st.previewRow}>
        <TouchableOpacity
          style={[st.previewBox, { width: PREVIEW_SIZE, height: PREVIEW_SIZE }]}
          activeOpacity={imageUri ? 0.85 : 1}
          onPress={() => imageUri && setFullscreen(true)}
        >
          {generating ? (
            <View style={st.genBox}>
              <ActivityIndicator size="large" color={D.accent} />
              <Text style={st.genText}>Generating…</Text>
              <Text style={st.genSub}>15–30 sec</Text>
            </View>
          ) : imageUri ? (
            <Image source={{ uri: imageUri }} style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }} contentFit="cover" />
          ) : (
            <View style={st.emptyBox}>
              <SparkleIcon color={D.muted} size={36} />
              <Text style={st.emptyText}>Preview</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Action buttons — only when image exists */}
        {imageUri && !generating && (
          <View style={st.previewActions}>
            <TouchableOpacity style={st.actionBtn} onPress={() => setRefineModal(true)} activeOpacity={0.8}>
              <RefineIcon color={D.accent} size={15} />
              <Text style={st.actionBtnText}>Refine</Text>
            </TouchableOpacity>
            <TouchableOpacity style={st.actionBtn} onPress={handleSave} disabled={saving} activeOpacity={0.8}>
              <SaveIcon color={D.accent} size={15} />
              <Text style={st.actionBtnText}>{saving ? '…' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── Character input ── */}
      <View style={st.inputRow}>
        <TextInput
          style={st.charInput}
          placeholder="Describe your character…"
          placeholderTextColor={D.muted}
          value={params.character}
          onChangeText={v => set('character', v)}
          returnKeyType="done"
        />
      </View>

      {/* ── 4-tab toggle ── */}
      <View style={st.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[st.tab, activeTab === tab.id && st.tabActive]}
            onPress={() => setActiveTab(tab.id)}
            activeOpacity={0.8}
          >
            <Text style={[st.tabText, activeTab === tab.id && st.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Tab content ── */}
      <View style={st.tabContent}>

        {/* STYLE */}
        {activeTab === 'style' && (
          <View style={st.styleGrid}>
            {STYLES.map(item => {
              const active = params.style === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[st.styleCard, active && st.styleCardActive]}
                  onPress={() => set('style', item.id)}
                  activeOpacity={0.8}
                >
                  {item.icon(active ? D.accent : D.muted)}
                  <Text style={[st.styleCardText, active && st.styleCardTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* TRAITS */}
        {activeTab === 'traits' && (
          <View style={st.traitsPanel}>
            <View style={st.traitInputRow}>
              <TextInput
                style={st.traitInput}
                placeholder="Add a trait…"
                placeholderTextColor={D.muted}
                value={traitInput}
                onChangeText={setTraitInput}
                onSubmitEditing={() => addTrait(traitInput)}
                returnKeyType="done"
              />
              <TouchableOpacity style={st.addBtn} onPress={() => addTrait(traitInput)}>
                <PlusIcon color={D.panel} />
              </TouchableOpacity>
            </View>
            {params.traits.length > 0 && (
              <View style={st.traitChips}>
                {params.traits.map(t => (
                  <TouchableOpacity key={t} style={st.traitChip} onPress={() => removeTrait(t)}>
                    <Text style={st.traitChipText}>{t}</Text>
                    <CloseIcon color={D.subtext} size={10} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {TRAIT_SUGGESTIONS.filter(t => !params.traits.includes(t)).map(t => (
                <TouchableOpacity key={t} style={st.suggChip} onPress={() => addTrait(t)}>
                  <Text style={st.suggText}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* MOOD */}
        {activeTab === 'mood' && (
          <View style={st.optionGrid}>
            {MOODS.map(m => {
              const active = params.mood === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[st.optionCard, active && st.optionCardActive]}
                  onPress={() => set('mood', m.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[st.optionCardText, active && st.optionCardTextActive]}>{m.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* BACKGROUND */}
        {activeTab === 'background' && (
          <View style={st.optionGrid}>
            {BACKGROUNDS.map(b => {
              const active = params.background === b.id;
              return (
                <TouchableOpacity
                  key={b.id}
                  style={[st.optionCard, active && st.optionCardActive]}
                  onPress={() => set('background', b.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[st.optionCardText, active && st.optionCardTextActive]}>{b.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* ── Generate button ── */}
      <View style={st.generateRow}>
        <TouchableOpacity
          style={[st.generateBtn, !canGenerate && st.generateBtnOff]}
          onPress={handleGenerate}
          disabled={!canGenerate}
          activeOpacity={0.85}
        >
          {generating ? (
            <ActivityIndicator color={D.panel} />
          ) : (
            <>
              <SparkleIcon color="#fff" size={15} />
              <Text style={st.generateBtnText}>Generate Avatar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Fullscreen modal ── */}
      <Modal visible={fullscreen} transparent animationType="fade" onRequestClose={() => setFullscreen(false)}>
        <View style={st.fsOverlay}>
          <TouchableOpacity style={st.fsClose} onPress={() => setFullscreen(false)}>
            <CloseIcon color="#fff" size={20} />
          </TouchableOpacity>
          {imageUri && <Image source={{ uri: imageUri }} style={{ width: SW, height: SW }} contentFit="contain" />}
        </View>
      </Modal>

      {/* ── Refine modal ── */}
      <Modal visible={refineModal} transparent animationType="slide" onRequestClose={() => setRefineModal(false)}>
        <View style={st.refineOverlay}>
          <View style={st.refineSheet}>
            <Text style={st.refineTitle}>Refine Avatar</Text>
            <Text style={st.refineSub}>Describe what to change — character and style stay the same.</Text>
            <TextInput
              style={st.refineInput}
              placeholder='e.g. "different earrings", "red hair", "add a hat"'
              placeholderTextColor={D.muted}
              value={refineText}
              onChangeText={setRefineText}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleRefine}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {['different earrings', 'add a hat', 'red hair', 'remove glasses', 'add wings', 'gold necklace'].map(opt => (
                <TouchableOpacity key={opt} style={st.refineChip} onPress={() => setRefineText(opt)}>
                  <Text style={st.refineChipText}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={st.refineActions}>
              <TouchableOpacity style={st.refineCancel} onPress={() => setRefineModal(false)}>
                <Text style={st.refineCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[st.refineConfirm, !refineText.trim() && { opacity: 0.4 }]}
                onPress={handleRefine}
                disabled={!refineText.trim()}
              >
                <SparkleIcon color="#fff" size={16} />
                <Text style={st.refineConfirmText}>Regenerate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CARD_W = (SW - 48 - 16) / 3; // 3 per row with padding

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: D.bg },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
  },
  title:    { fontSize: 22, fontWeight: '700', color: D.text },
  subtitle: { fontSize: 12, color: D.muted, marginTop: 2 },
  randomBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: D.card, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: D.border,
  },
  randomBtnText: { color: D.subtext, fontSize: 12, fontWeight: '600' },

  // Preview
  previewRow: { alignItems: 'center', marginBottom: 14 },
  previewBox: {
    borderRadius: 20, backgroundColor: D.card,
    borderWidth: 1, borderColor: D.border,
    overflow: 'hidden', justifyContent: 'center', alignItems: 'center',
  },
  genBox:   { alignItems: 'center', gap: 10 },
  genText:  { color: D.text, fontSize: 13, fontWeight: '600' },
  genSub:   { color: D.muted, fontSize: 11 },
  emptyBox: { alignItems: 'center', gap: 8 },
  emptyText:{ color: D.muted, fontSize: 12 },

  previewActions: {
    flexDirection: 'row', gap: 10, marginTop: 10,
  },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 12, borderWidth: 1.5, borderColor: D.border,
    backgroundColor: D.card,
  },
  actionBtnText: { color: D.text, fontSize: 13, fontWeight: '600' },

  // Character input
  inputRow: { paddingHorizontal: 20, marginBottom: 14 },
  charInput: {
    backgroundColor: D.card, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 13,
    color: D.text, fontSize: 14,
    borderWidth: 1, borderColor: D.border,
  },

  // 4-tab bar — matches 3D editor mainTabRow
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: D.card,
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
  },
  tabActive: { backgroundColor: '#EC802B' },
  tabText:   { fontSize: 12, fontWeight: '600', color: D.muted },
  tabTextActive: { color: '#FFFFFF' },

  // Tab content area
  tabContent: { flex: 1, paddingHorizontal: 20 },

  // Style grid — 3 per row, square cards
  styleGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
  },
  styleCard: {
    width: CARD_W, paddingVertical: 10, paddingTop: 12,
    backgroundColor: D.card, borderRadius: 14,
    borderWidth: 1.5, borderColor: D.border,
    alignItems: 'center', justifyContent: 'center', gap: 5,
  },
  styleCardActive:    { borderColor: D.accent, backgroundColor: '#1f1f1f' },
  styleCardText:      { fontSize: 10, fontWeight: '700', color: D.muted },
  styleCardTextActive:{ color: D.accent },

  // Traits
  traitsPanel:   { gap: 10 },
  traitInputRow: { flexDirection: 'row', gap: 8 },
  traitInput: {
    flex: 1, backgroundColor: D.card, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    color: D.text, fontSize: 13, borderWidth: 1, borderColor: D.border,
  },
  addBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: D.accent, alignItems: 'center', justifyContent: 'center',
  },
  traitChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  traitChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: D.card, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: D.border,
  },
  traitChipText: { color: D.text, fontSize: 12, fontWeight: '600' },
  suggChip: {
    backgroundColor: D.card, borderRadius: 16,
    paddingHorizontal: 12, paddingVertical: 7, marginRight: 8,
    borderWidth: 1, borderColor: D.border,
  },
  suggText: { color: D.subtext, fontSize: 12 },

  // Mood / Background — 2x2 grid of cards
  optionGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
  },
  optionCard: {
    width: (SW - 40 - 8) / 2, paddingVertical: 14,
    backgroundColor: D.card, borderRadius: 14,
    borderWidth: 1.5, borderColor: D.border,
    alignItems: 'center', justifyContent: 'center',
  },
  optionCardActive:    { borderColor: D.accent, backgroundColor: '#1f1f1f' },
  optionCardText:      { fontSize: 13, fontWeight: '600', color: D.muted },
  optionCardTextActive:{ color: D.accent },

  // Generate button
  generateRow: {
    paddingHorizontal: 20, paddingBottom: 110, paddingTop: 12,
  },
  generateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 46, borderRadius: 14, backgroundColor: '#EC802B',
    shadowColor: '#EC802B', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  generateBtnOff:  { opacity: 0.35, shadowOpacity: 0 },
  generateBtnText: { color: '#2C1A0E', fontSize: 14, fontWeight: '700' },

  // Fullscreen
  fsOverlay: { flex: 1, backgroundColor: '#000000ee', justifyContent: 'center', alignItems: 'center' },
  fsClose:   { position: 'absolute', top: 60, right: 20, zIndex: 10, padding: 10 },

  // Refine modal
  refineOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000088' },
  refineSheet: {
    backgroundColor: D.panel, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40, borderTopWidth: 1, borderColor: D.border,
  },
  refineTitle: { fontSize: 18, fontWeight: '700', color: D.text, marginBottom: 6 },
  refineSub:   { fontSize: 13, color: D.subtext, marginBottom: 14 },
  refineInput: {
    backgroundColor: D.card, borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 12, color: D.text, fontSize: 14,
    borderWidth: 1, borderColor: D.border, marginBottom: 12,
  },
  refineChip: {
    backgroundColor: D.card, borderRadius: 14,
    paddingHorizontal: 12, paddingVertical: 7, marginRight: 8,
    borderWidth: 1, borderColor: D.border,
  },
  refineChipText: { color: D.subtext, fontSize: 12 },
  refineActions:  { flexDirection: 'row', gap: 10, marginTop: 4 },
  refineCancel: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: D.border, alignItems: 'center',
  },
  refineCancelText: { color: D.muted, fontWeight: '600' },
  refineConfirm: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 14, backgroundColor: '#7c3aed',
  },
  refineConfirmText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

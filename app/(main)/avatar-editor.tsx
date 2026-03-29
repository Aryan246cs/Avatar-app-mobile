import { IconSymbol } from '@/components/ui/icon-symbol';
import Constants from 'expo-constants';
import { useRef, useState } from 'react';
import {
  Dimensions, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import { WebView } from 'react-native-webview';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const SCREEN_HEIGHT = Dimensions.get('window').height;
const PANEL_HEIGHT  = SCREEN_HEIGHT * 0.58;

// Design tokens — dark theme
const D = {
  bg:       '#0f0f0f',
  panel:    '#161616',
  card:     '#1e1e1e',
  border:   '#2a2a2a',
  accent:   '#ffffff',
  muted:    '#6b7280',
  text:     '#f3f4f6',
  subtext:  '#9ca3af',
};

const getAvatarViewerUrl = () => {
  if (!__DEV__) return 'https://your-actual-vercel-url.vercel.app';
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return host ? `http://${host}:5173` : 'http://192.168.100.97:5173';
};

// ─── TYPES & DATA (unchanged from original) ───────────────────────────────────
type BodyType = 'female' | 'female1' | 'female2' | 'female3' | 'male' | 'male1' | 'male2' | 'male3';
type BodyOption = { id: BodyType; name: string; gender: 'female' | 'male'; size: 'slim' | 'average' | 'athletic' | 'heavy' };
type AvatarPart  = { id: string; name: string; icon: string; messageType: 'SET_TOP' | 'SET_PANTS' | 'SET_SHOES' | 'SET_EYES' | 'SET_HAIR' };
type TextureOption = { id: string; name: string; value: string; color: string };

const bodyOptions: BodyOption[] = [
  { id: 'female',  name: 'Slim',     gender: 'female', size: 'slim' },
  { id: 'female1', name: 'Average',  gender: 'female', size: 'average' },
  { id: 'female2', name: 'Athletic', gender: 'female', size: 'athletic' },
  { id: 'female3', name: 'Heavy',    gender: 'female', size: 'heavy' },
  { id: 'male',    name: 'Slim',     gender: 'male',   size: 'slim' },
  { id: 'male1',   name: 'Average',  gender: 'male',   size: 'average' },
  { id: 'male2',   name: 'Athletic', gender: 'male',   size: 'athletic' },
  { id: 'male3',   name: 'Heavy',    gender: 'male',   size: 'heavy' },
];

const avatarParts: AvatarPart[] = [
  { id: 'eyes',  name: 'Eyes',  icon: 'eye.fill',    messageType: 'SET_EYES' },
  { id: 'hair',  name: 'Hair',  icon: 'person.fill', messageType: 'SET_HAIR' },
  { id: 'top',   name: 'Top',   icon: 'tshirt.fill', messageType: 'SET_TOP' },
  { id: 'pants', name: 'Pants', icon: 'tshirt.fill', messageType: 'SET_PANTS' },
  { id: 'shoes', name: 'Shoes', icon: 'circle.fill', messageType: 'SET_SHOES' },
];

const textureOptions: Record<string, TextureOption[]> = {
  eyes:  [
    { id: 'eyes_default', name: 'Blue',  value: 'eyes_default', color: '#1e3a8a' },
    { id: 'eyes_brown',   name: 'Brown', value: 'eyes_brown',   color: '#78350f' },
    { id: 'eyes_green',   name: 'Green', value: 'eyes_green',   color: '#15803d' },
    { id: 'eyes_gray',    name: 'Gray',  value: 'eyes_gray',    color: '#6b7280' },
    { id: 'eyes_hazel',   name: 'Hazel', value: 'eyes_hazel',   color: '#92400e' },
  ],
  hair:  [
    { id: 'hair_default', name: 'Dark',   value: 'hair_default', color: '#1f2937' },
    { id: 'hair_black',   name: 'Black',  value: 'hair_black',   color: '#111827' },
    { id: 'hair_brown',   name: 'Brown',  value: 'hair_brown',   color: '#78350f' },
    { id: 'hair_blonde',  name: 'Blonde', value: 'hair_blonde',  color: '#fbbf24' },
    { id: 'hair_red',     name: 'Red',    value: 'hair_red',     color: '#dc2626' },
    { id: 'hair_white',   name: 'White',  value: 'hair_white',   color: '#f3f4f6' },
  ],
  top:   [
    { id: 'top_default', name: 'Blue',  value: 'top_default', color: '#4169e1' },
    { id: 'top_black',   name: 'Black', value: 'top_black',   color: '#111827' },
    { id: 'top_white',   name: 'White', value: 'top_white',   color: '#f9fafb' },
    { id: 'top_red',     name: 'Red',   value: 'top_red',     color: '#dc2626' },
    { id: 'top_green',   name: 'Green', value: 'top_green',   color: '#16a34a' },
  ],
  pants: [
    { id: 'pants_default', name: 'Gray',  value: 'pants_default', color: '#374151' },
    { id: 'pants_blue',    name: 'Navy',  value: 'pants_blue',    color: '#1e40af' },
    { id: 'pants_black',   name: 'Black', value: 'pants_black',   color: '#111827' },
    { id: 'pants_brown',   name: 'Brown', value: 'pants_brown',   color: '#92400e' },
  ],
  shoes: [
    { id: 'shoes_default', name: 'Brown', value: 'shoes_default', color: '#92400e' },
    { id: 'shoes_black',   name: 'Black', value: 'shoes_black',   color: '#111827' },
    { id: 'shoes_white',   name: 'White', value: 'shoes_white',   color: '#f3f4f6' },
    { id: 'shoes_brown',   name: 'Dark',  value: 'shoes_brown',   color: '#78350f' },
  ],
};

// Accessory categories for the Store tab
const ACCESSORY_CATEGORIES = [
  { id: 'jacket', label: '🧥 Jacket' },
  { id: 'pants',  label: '👖 Pants' },
  { id: 'hair',   label: '💇 Hair' },
  { id: 'mask',   label: '😷 Mask' },
  { id: 'suit',   label: '👔 Suit' },
  { id: 'shoes',  label: '👞 Shoes' },
] as const;
type AccessoryCategory = typeof ACCESSORY_CATEGORIES[number]['id'];

// ─── REUSABLE UI COMPONENTS ───────────────────────────────────────────────────

/** Pill-shaped tab button used in all three tab rows */
function Pill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[s.pill, active && s.pillActive]}
      activeOpacity={0.75}
    >
      <Text style={[s.pillText, active && s.pillTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

/** Circular color swatch */
function ColorSwatch({ color, selected, onPress }: { color: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={s.swatchWrap} activeOpacity={0.8}>
      <View style={[s.swatch, { backgroundColor: color }, selected && s.swatchSelected]} />
    </TouchableOpacity>
  );
}

/** Body type card — icon + label */
function BodyCard({ body, selected, onPress }: { body: BodyOption; selected: boolean; onPress: () => void }) {
  const sizes = { slim: 26, average: 30, athletic: 34, heavy: 38 };
  return (
    <TouchableOpacity onPress={onPress} style={[s.bodyCard, selected && s.bodyCardActive]} activeOpacity={0.8}>
      <IconSymbol name="person.fill" size={sizes[body.size]} color={selected ? D.accent : D.muted} />
      <Text style={[s.bodyCardLabel, { color: selected ? D.accent : D.muted }]}>{body.name}</Text>
    </TouchableOpacity>
  );
}

/** Numbered item button used in the Store tab (OFF / 1 / 2 / 3) */
function ItemBtn({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[s.itemBtn, active && s.itemBtnActive]} activeOpacity={0.8}>
      <Text style={[s.itemBtnText, { color: active ? D.accent : D.muted }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function AvatarEditorScreen() {
  // ── State (identical to original) ──────────────────────────────────────
  const [selectedBody,    setSelectedBody]    = useState<BodyType>('female');
  const [selectedGender,  setSelectedGender]  = useState<'female' | 'male'>('female');
  const [selectedPart,    setSelectedPart]    = useState<string>('eyes');
  const [selectedAccessoryCategory, setSelectedAccessoryCategory] =
    useState<AccessoryCategory>('jacket');
  const [selectedTextures, setSelectedTextures] = useState({
    eyes: 'eyes_default', hair: 'hair_default',
    top: 'top_default', pants: 'pants_default', shoes: 'shoes_default',
  });
  const [accessories, setAccessories] = useState({
    jacket: null as number | null, pants:    null as number | null,
    hair:   null as number | null, mask:     null as number | null,
    fullSuit: null as number | null, shoes:  null as number | null,
  });

  // Main tab: Body | Colors | Store
  const [mainTab, setMainTab] = useState<'body' | 'colors' | 'store'>('body');

  const webViewRef = useRef<WebView>(null);
  const avatarViewerUrl = getAvatarViewerUrl();

  // ── Handlers (identical to original) ───────────────────────────────────
  const send = (type: string, value: string) =>
    webViewRef.current?.postMessage(JSON.stringify({ type, value }));

  const sendSelection = (type: string, selection: number | null) =>
    webViewRef.current?.postMessage(JSON.stringify({ type, selection }));

  const handleBodySelect = (bodyType: BodyType) => {
    setSelectedBody(bodyType);
    send('SET_BODY', bodyType);
  };

  const handleTextureSelect = (textureValue: string) => {
    const part = avatarParts.find(p => p.id === selectedPart);
    if (part) {
      setSelectedTextures(prev => ({ ...prev, [selectedPart]: textureValue }));
      send(part.messageType, textureValue);
    }
  };

  const selectJacket  = (v: number | null) => { setAccessories(p => ({ ...p, jacket:   v })); sendSelection('SET_JACKET',          v); };
  const selectPants   = (v: number | null) => { setAccessories(p => ({ ...p, pants:    v })); sendSelection('SET_PANTS_ACCESSORY', v); };
  const selectHair    = (v: number | null) => { setAccessories(p => ({ ...p, hair:     v })); sendSelection('SET_HAIR_ACCESSORY',  v); };
  const selectMask    = (v: number | null) => { setAccessories(p => ({ ...p, mask:     v })); sendSelection('SET_MASK_ACCESSORY',  v); };
  const selectFullSuit= (v: number | null) => { setAccessories(p => ({ ...p, fullSuit: v })); sendSelection('SET_FULL_SUIT',       v); };
  const selectShoes   = (v: number | null) => { setAccessories(p => ({ ...p, shoes:    v })); sendSelection('SET_SHOES_ACCESSORY', v); };

  const handleReset = () => {
    setSelectedGender('female'); setSelectedBody('female');
    setSelectedTextures({ eyes: 'eyes_default', hair: 'hair_default', top: 'top_default', pants: 'pants_default', shoes: 'shoes_default' });
    setAccessories({ jacket: null, pants: null, hair: null, mask: null, fullSuit: null, shoes: null });
    send('SET_BODY', 'female');
    send('SET_EYES', 'eyes_default'); send('SET_HAIR', 'hair_default');
    send('SET_TOP', 'top_default');   send('SET_PANTS', 'pants_default'); send('SET_SHOES', 'shoes_default');
    sendSelection('SET_JACKET', null);       sendSelection('SET_PANTS_ACCESSORY', null);
    sendSelection('SET_HAIR_ACCESSORY', null); sendSelection('SET_MASK_ACCESSORY', null);
    sendSelection('SET_FULL_SUIT', null);    sendSelection('SET_SHOES_ACCESSORY', null);
  };

  const filteredBodyOptions = bodyOptions.filter(b => b.gender === selectedGender);
  const currentColors = textureOptions[selectedPart] || [];

  // ── RENDER ─────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>

      {/* ── TOP: Avatar viewer (fills remaining space above panel) ── */}
      <View style={s.viewerWrap}>
        {__DEV__ ? (
          <WebView
            ref={webViewRef}
            source={{ uri: avatarViewerUrl }}
            style={s.webView}
            javaScriptEnabled domStorageEnabled startInLoadingState
            renderLoading={() => (
              <View style={s.loaderBox}>
                <Text style={{ color: D.muted }}>Loading avatar…</Text>
              </View>
            )}
            onError={() => {}}
          />
        ) : (
          <View style={s.loaderBox}>
            <IconSymbol name="person.fill" size={100} color={D.muted} />
          </View>
        )}
      </View>

      {/* ── BOTTOM: Control panel ── */}
      <View style={s.panel}>

        {/* Drag pill */}
        <View style={s.dragPill} />

        {/* ── Main tab switcher: Body / Colors / Store ── */}
        <View style={s.mainTabRow}>
          {(['body', 'colors', 'store'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setMainTab(tab)}
              style={[s.mainTab, mainTab === tab && s.mainTabActive]}
              activeOpacity={0.8}
            >
              <Text style={[s.mainTabText, mainTab === tab && s.mainTabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Tab content ── */}
        <ScrollView
          style={s.tabContent}
          contentContainerStyle={s.tabContentInner}
          showsVerticalScrollIndicator={false}
        >

          {/* ════════════════ BODY TAB ════════════════ */}
          {mainTab === 'body' && (
            <View>
              {/* Gender toggle */}
              <Text style={s.sectionLabel}>Gender</Text>
              <View style={s.genderRow}>
                {(['male', 'female'] as const).map(g => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => {
                      setSelectedGender(g);
                      const base = g === 'male' ? 'male' : 'female';
                      setSelectedBody(base);
                      handleBodySelect(base);
                    }}
                    style={[s.genderBtn, selectedGender === g && s.genderBtnActive]}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.genderBtnText, selectedGender === g && s.genderBtnTextActive]}>
                      {g === 'male' ? '♂ Male' : '♀ Female'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Body type grid */}
              <Text style={s.sectionLabel}>Body Type</Text>
              <View style={s.bodyGrid}>
                {filteredBodyOptions.map(body => (
                  <BodyCard
                    key={body.id}
                    body={body}
                    selected={selectedBody === body.id}
                    onPress={() => handleBodySelect(body.id)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* ════════════════ COLORS TAB ════════════════ */}
          {mainTab === 'colors' && (
            <View>
              {/* Part selector pills */}
              <Text style={s.sectionLabel}>Part</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.pillRow}>
                {avatarParts.map(p => (
                  <Pill
                    key={p.id}
                    label={p.name}
                    active={selectedPart === p.id}
                    onPress={() => setSelectedPart(p.id)}
                  />
                ))}
              </ScrollView>

              {/* Color swatches */}
              <Text style={s.sectionLabel}>Color</Text>
              <View style={s.swatchGrid}>
                {currentColors.map(opt => (
                  <View key={opt.id} style={s.swatchItem}>
                    <ColorSwatch
                      color={opt.color}
                      selected={selectedTextures[selectedPart as keyof typeof selectedTextures] === opt.value}
                      onPress={() => handleTextureSelect(opt.value)}
                    />
                    <Text style={s.swatchLabel}>{opt.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ════════════════ STORE TAB ════════════════ */}
          {mainTab === 'store' && (
            <View>
              {/* Category pills */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.pillRow}>
                {ACCESSORY_CATEGORIES.map(cat => (
                  <Pill
                    key={cat.id}
                    label={cat.label}
                    active={selectedAccessoryCategory === cat.id}
                    onPress={() => setSelectedAccessoryCategory(cat.id)}
                  />
                ))}
              </ScrollView>

              {/* Item buttons per category */}
              <View style={s.itemRow}>
                {/* Jacket */}
                {selectedAccessoryCategory === 'jacket' && (
                  <>
                    <ItemBtn label="OFF" active={accessories.jacket === null} onPress={() => selectJacket(null)} />
                    <ItemBtn label="1"   active={accessories.jacket === 1}    onPress={() => selectJacket(1)} />
                    <ItemBtn label="2"   active={accessories.jacket === 2}    onPress={() => selectJacket(2)} />
                    {selectedGender === 'female' && (
                      <ItemBtn label="3" active={accessories.jacket === 3}   onPress={() => selectJacket(3)} />
                    )}
                  </>
                )}
                {/* Pants */}
                {selectedAccessoryCategory === 'pants' && (
                  <>
                    <ItemBtn label="OFF" active={accessories.pants === null} onPress={() => selectPants(null)} />
                    <ItemBtn label="1"   active={accessories.pants === 1}    onPress={() => selectPants(1)} />
                    <ItemBtn label="2"   active={accessories.pants === 2}    onPress={() => selectPants(2)} />
                  </>
                )}
                {/* Hair */}
                {selectedAccessoryCategory === 'hair' && (
                  <>
                    <ItemBtn label="OFF" active={accessories.hair === null} onPress={() => selectHair(null)} />
                    <ItemBtn label="1"   active={accessories.hair === 1}    onPress={() => selectHair(1)} />
                  </>
                )}
                {/* Mask */}
                {selectedAccessoryCategory === 'mask' && (
                  <>
                    <ItemBtn label="OFF" active={accessories.mask === null} onPress={() => selectMask(null)} />
                    <ItemBtn label="1"   active={accessories.mask === 1}    onPress={() => selectMask(1)} />
                  </>
                )}
                {/* Suit */}
                {selectedAccessoryCategory === 'suit' && (
                  <>
                    <ItemBtn label="OFF" active={accessories.fullSuit === null} onPress={() => selectFullSuit(null)} />
                    {selectedGender === 'female' && (
                      <ItemBtn label="1" active={accessories.fullSuit === 1} onPress={() => selectFullSuit(1)} />
                    )}
                    <ItemBtn
                      label={selectedGender === 'female' ? '2' : '1'}
                      active={accessories.fullSuit === 3}
                      onPress={() => selectFullSuit(3)}
                    />
                  </>
                )}
                {/* Shoes */}
                {selectedAccessoryCategory === 'shoes' && (
                  <>
                    <ItemBtn label="OFF" active={accessories.shoes === null} onPress={() => selectShoes(null)} />
                    <ItemBtn label="1"   active={accessories.shoes === 1}    onPress={() => selectShoes(1)} />
                    <ItemBtn label="2"   active={accessories.shoes === 2}    onPress={() => selectShoes(2)} />
                    {selectedGender === 'male' && (
                      <ItemBtn label="3" active={accessories.shoes === 3}   onPress={() => selectShoes(3)} />
                    )}
                  </>
                )}
              </View>
            </View>
          )}

        </ScrollView>

        {/* ── Bottom action bar ── */}
        <View style={s.actionBar}>
          <TouchableOpacity onPress={handleReset} style={s.resetBtn} activeOpacity={0.8}>
            <Text style={s.resetBtnText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}} style={s.saveBtn} activeOpacity={0.8}>
            <Text style={s.saveBtnText}>Save Avatar</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  // Layout
  root:        { flex: 1, backgroundColor: D.bg },
  viewerWrap:  { flex: 1 },
  webView:     { flex: 1 },
  loaderBox:   { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: D.bg },

  // Panel
  panel: {
    height: PANEL_HEIGHT,
    backgroundColor: D.panel,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 24,
  },
  dragPill: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: D.border,
    alignSelf: 'center', marginBottom: 16,
  },

  // Main tabs (Body / Colors / Store)
  mainTabRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: D.card,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  mainTab: {
    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
  },
  mainTabActive: { backgroundColor: D.accent },
  mainTabText:   { fontSize: 14, fontWeight: '600', color: D.muted },
  mainTabTextActive: { color: D.panel },

  // Scrollable tab content
  tabContent:      { flex: 1 },
  tabContentInner: { paddingHorizontal: 20, paddingBottom: 16 },

  // Section label
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: D.muted,
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12,
  },

  // Gender
  genderRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  genderBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    backgroundColor: D.card, alignItems: 'center',
    borderWidth: 1.5, borderColor: D.border,
  },
  genderBtnActive:    { backgroundColor: D.accent, borderColor: D.accent },
  genderBtnText:      { fontSize: 15, fontWeight: '600', color: D.muted },
  genderBtnTextActive:{ color: D.panel },

  // Body type grid
  bodyGrid: {
    flexDirection: 'row', gap: 10,
    justifyContent: 'space-between', marginBottom: 8,
  },
  bodyCard: {
    flex: 1, aspectRatio: 0.75,
    backgroundColor: D.card, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: D.border, gap: 6,
  },
  bodyCardActive:  { borderColor: D.accent, backgroundColor: '#1f1f1f' },
  bodyCardLabel:   { fontSize: 10, fontWeight: '600' },

  // Pills (part selector / accessory category)
  pillRow: { marginBottom: 20 },
  pill: {
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 20, backgroundColor: D.card,
    marginRight: 8, borderWidth: 1, borderColor: D.border,
  },
  pillActive:     { backgroundColor: D.accent, borderColor: D.accent },
  pillText:       { fontSize: 13, fontWeight: '600', color: D.muted },
  pillTextActive: { color: D.panel },

  // Color swatches
  swatchGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 8,
  },
  swatchItem:  { alignItems: 'center', gap: 6 },
  swatchWrap:  { padding: 3 },
  swatch: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 2, borderColor: 'transparent',
  },
  swatchSelected: {
    borderColor: D.accent,
    shadowColor: D.accent, shadowOpacity: 0.6,
    shadowRadius: 6, shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  swatchLabel: { fontSize: 10, fontWeight: '600', color: D.subtext },

  // Store item buttons
  itemRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  itemBtn: {
    paddingHorizontal: 20, paddingVertical: 14,
    borderRadius: 14, backgroundColor: D.card,
    borderWidth: 1.5, borderColor: D.border,
    minWidth: 64, alignItems: 'center',
  },
  itemBtnActive: { borderColor: D.accent, backgroundColor: '#1f1f1f' },
  itemBtnText:   { fontSize: 14, fontWeight: '700' },

  // Action bar
  actionBar: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 20, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: D.border,
  },
  resetBtn: {
    flex: 1, height: 48, borderRadius: 14,
    borderWidth: 1.5, borderColor: D.border,
    justifyContent: 'center', alignItems: 'center',
  },
  resetBtnText: { fontSize: 14, fontWeight: '700', color: D.muted },
  saveBtn: {
    flex: 2, height: 48, borderRadius: 14,
    backgroundColor: D.accent,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#fff', shadowOpacity: 0.15,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: D.panel },
});

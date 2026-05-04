import { IconSymbol } from '@/components/ui/icon-symbol';
import { saveAvatarConfig } from '@/utils/api';
import Constants from 'expo-constants';
import { useRef, useState } from 'react';
import {
    Alert, Dimensions, Modal, ScrollView, StyleSheet,
    Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { WebView } from 'react-native-webview';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH  = Dimensions.get('window').width;
const PANEL_HEIGHT  = SCREEN_HEIGHT * 0.58;

// Design tokens — warm vibrant theme
const D = {
  bg:       '#FDF8F3',
  panel:    '#FFFFFF',
  card:     '#FDF0E4',
  border:   '#EBCCAD',
  accent:   '#EC802B',
  muted:    '#9A7A5A',
  text:     '#2C1A0E',
  subtext:  '#6B4A2A',
  teal:     '#66BCB4',
  yellow:   '#EDC55B',
  cream:    '#EBCCAD',
};

const getAvatarViewerUrl = () => {
  if (!__DEV__) return 'https://your-actual-vercel-url.vercel.app';
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return host ? `http://${host}:5174` : 'http://192.168.100.97:5174';
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

// Preset color swatches per accessory category
const ACCESSORY_PRESETS: Record<AccessoryCategory, string[]> = {
  jacket: ['#111827','#1e3a8a','#dc2626','#16a34a','#92400e','#6d28d9','#f9fafb','#374151'],
  pants:  ['#111827','#1e40af','#374151','#92400e','#065f46','#7c3aed','#f9fafb','#78350f'],
  hair:   ['#111827','#78350f','#fbbf24','#dc2626','#f3f4f6','#1f2937','#6d28d9','#0369a1'],
  mask:   ['#111827','#f9fafb','#dc2626','#1e3a8a','#92400e','#374151','#6d28d9','#065f46'],
  suit:   ['#dc2626','#111827','#1e3a8a','#065f46','#92400e','#6d28d9','#f9fafb','#374151'],
  shoes:  ['#92400e','#111827','#f3f4f6','#78350f','#1e3a8a','#374151','#dc2626','#065f46'],
};

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

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/** Convert r,g,b (0-255) to hex string like "#a3f0cc" */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
}

/** Parse "#rrggbb" → {r,g,b} or null */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.replace('#', '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

/** RGB → HSV */
function rgbToHsv(r: number, g: number, b: number) {
  const rr = r / 255, gg = g / 255, bb = b / 255;
  const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb), d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rr) h = ((gg - bb) / d) % 6;
    else if (max === gg) h = (bb - rr) / d + 2;
    else h = (rr - gg) / d + 4;
    h = Math.round(h * 60); if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

/** HSV → RGB */
function hsvToRgb(h: number, s: number, v: number) {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return { r: Math.round(f(5) * 255), g: Math.round(f(3) * 255), b: Math.round(f(1) * 255) };
}

// ─── COLOR PICKER MODAL ───────────────────────────────────────────────────────

const GRAD_W = SCREEN_WIDTH - 48 - 28 - 12;
const GRAD_H = 200;
const BRIGHT_STRIP_W = 28;

function ColorPickerModal({
  visible, initialColor, onApply, onClose,
}: { visible: boolean; initialColor: string; onApply: (hex: string) => void; onClose: () => void }) {
  const init    = hexToRgb(initialColor.startsWith('#') ? initialColor : '#4472c4') ?? { r: 68, g: 114, b: 196 };
  const initHsv = rgbToHsv(init.r, init.g, init.b);

  const [hue,  setHue]  = useState(initHsv.h);
  const [sat,  setSat]  = useState(initHsv.s);
  const [val,  setVal]  = useState(initHsv.v);
  const [hexInput, setHexInput] = useState(initialColor.startsWith('#') ? initialColor.toUpperCase() : '#4472C4');

  const { r, g, b } = hsvToRgb(hue, sat, val);
  const currentHex   = rgbToHex(r, g, b).toUpperCase();
  const pureHue      = `hsl(${Math.round(hue)},100%,50%)`;

  // ── touch refs ──────────────────────────────────────────────────────────
  const gradRef   = useRef<View>(null); const gradX = useRef(0); const gradY = useRef(0);
  const brightRef = useRef<View>(null); const brightY = useRef(0);
  const hueRef    = useRef<View>(null); const hueX = useRef(0);

  const applyGrad = (px: number, py: number) => {
    const s = Math.max(0, Math.min(1, (px - gradX.current) / GRAD_W));
    const v = Math.max(0, Math.min(1, 1 - (py - gradY.current) / GRAD_H));
    setSat(s); setVal(v);
    const rgb = hsvToRgb(hue, s, v);
    setHexInput(rgbToHex(rgb.r, rgb.g, rgb.b).toUpperCase());
  };
  const applyBright = (py: number) => {
    const v = Math.max(0, Math.min(1, 1 - (py - brightY.current) / GRAD_H));
    setVal(v);
    setHexInput(rgbToHex(...Object.values(hsvToRgb(hue, sat, v)) as [number,number,number]).toUpperCase());
  };
  const applyHue = (px: number) => {
    const h = Math.max(0, Math.min(360, ((px - hueX.current) / (SCREEN_WIDTH - 48)) * 360));
    setHue(h);
    setHexInput(rgbToHex(...Object.values(hsvToRgb(h, sat, val)) as [number,number,number]).toUpperCase());
  };

  const syncRgbChannel = (ch: 0|1|2, n: number) => {
    const arr: [number,number,number] = [r, g, b]; arr[ch] = n;
    const hsv = rgbToHsv(...arr); setHue(hsv.h); setSat(hsv.s); setVal(hsv.v);
    setHexInput(rgbToHex(...arr).toUpperCase());
  };
  const syncHex = (raw: string) => {
    setHexInput(raw);
    const parsed = hexToRgb(raw);
    if (parsed) { const hsv = rgbToHsv(parsed.r, parsed.g, parsed.b); setHue(hsv.h); setSat(hsv.s); setVal(hsv.v); }
  };

  const crossX = sat * GRAD_W;
  const crossY = (1 - val) * GRAD_H;
  const brightThumbY = (1 - val) * GRAD_H;
  const hueThumbX = (hue / 360) * (SCREEN_WIDTH - 48);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={sp.overlay}>
        <View style={sp.sheet}>

          {/* Header */}
          <View style={sp.header}>
            <Text style={sp.title}>Colors</Text>
            <TouchableOpacity onPress={onClose}><Text style={sp.closeBtn}>✕</Text></TouchableOpacity>
          </View>

          {/* ── Gradient canvas + brightness strip ── */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>

            {/* 2D canvas: hue bg → white overlay → black overlay */}
            <View
              ref={gradRef}
              style={{ width: GRAD_W, height: GRAD_H, borderRadius: 8, overflow: 'hidden' }}
              onLayout={() => gradRef.current?.measure((_,__,___,____,px,py) => { gradX.current=px; gradY.current=py; })}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderGrant={e => { gradRef.current?.measure((_,__,___,____,px,py) => { gradX.current=px; gradY.current=py; applyGrad(e.nativeEvent.pageX, e.nativeEvent.pageY); }); }}
              onResponderMove={e => applyGrad(e.nativeEvent.pageX, e.nativeEvent.pageY)}
            >
              {/* Base hue */}
              <View style={[StyleSheet.absoluteFillObject, { backgroundColor: pureHue }]} />
              {/* White left→right — 20 vertical strips */}
              <View style={[StyleSheet.absoluteFillObject, { flexDirection: 'row' }]}>
                {Array.from({ length: 20 }, (_, i) => (
                  <View key={i} style={{ flex: 1, backgroundColor: `rgba(255,255,255,${(1 - i / 19).toFixed(2)})` }} />
                ))}
              </View>
              {/* Black top→bottom — 20 horizontal strips */}
              <View style={[StyleSheet.absoluteFillObject, { flexDirection: 'column' }]}>
                {Array.from({ length: 20 }, (_, i) => (
                  <View key={i} style={{ flex: 1, backgroundColor: `rgba(0,0,0,${(i / 19).toFixed(2)})` }} />
                ))}
              </View>
              {/* Crosshair */}
              <View style={{ position:'absolute', left: crossX-8, top: crossY-8, width:16, height:16, justifyContent:'center', alignItems:'center' }}>
                <View style={{ position:'absolute', width:16, height:2, backgroundColor:'#fff', shadowColor:'#000', shadowOpacity:0.8, shadowRadius:2, shadowOffset:{width:0,height:0} }} />
                <View style={{ position:'absolute', width:2, height:16, backgroundColor:'#fff', shadowColor:'#000', shadowOpacity:0.8, shadowRadius:2, shadowOffset:{width:0,height:0} }} />
              </View>
            </View>

            {/* Brightness strip (vertical) — white→hue→black */}
            <View
              ref={brightRef}
              style={{ width: BRIGHT_STRIP_W, height: GRAD_H, borderRadius: 8, overflow: 'hidden', position: 'relative' }}
              onLayout={() => brightRef.current?.measure((_,__,___,____,px,py) => { brightY.current=py; })}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderGrant={e => { brightRef.current?.measure((_,__,___,____,px,py) => { brightY.current=py; applyBright(e.nativeEvent.pageY); }); }}
              onResponderMove={e => applyBright(e.nativeEvent.pageY)}
            >
              {/* Top half: white → hue */}
              <View style={{ flex: 1, flexDirection: 'column' }}>
                {Array.from({ length: 10 }, (_, i) => {
                  const t = i / 9;
                  const { r: hr, g: hg, b: hb } = hsvToRgb(hue, 1, 1);
                  const rr = Math.round(255 + (hr - 255) * t);
                  const gg = Math.round(255 + (hg - 255) * t);
                  const bb = Math.round(255 + (hb - 255) * t);
                  return <View key={i} style={{ flex: 1, backgroundColor: `rgb(${rr},${gg},${bb})` }} />;
                })}
              </View>
              {/* Bottom half: hue → black */}
              <View style={{ flex: 1, flexDirection: 'column' }}>
                {Array.from({ length: 10 }, (_, i) => {
                  const t = i / 9;
                  const { r: hr, g: hg, b: hb } = hsvToRgb(hue, 1, 1);
                  const rr = Math.round(hr * (1 - t));
                  const gg = Math.round(hg * (1 - t));
                  const bb = Math.round(hb * (1 - t));
                  return <View key={i} style={{ flex: 1, backgroundColor: `rgb(${rr},${gg},${bb})` }} />;
                })}
              </View>
              {/* Thumb arrow */}
              <View style={{ position:'absolute', top: brightThumbY - 8, right: -2, width:20, height:16, justifyContent:'center', alignItems:'center' }}>
                <Text style={{ fontSize:12, color:'#fff', textShadowColor:'#000', textShadowRadius:2, textShadowOffset:{width:0,height:0} }}>◀</Text>
              </View>
            </View>
          </View>

          {/* ── Hue bar — 6 color segments ── */}
          <View
            ref={hueRef}
            style={{ height: 18, borderRadius: 9, overflow: 'hidden', marginBottom: 14, position: 'relative', flexDirection: 'row' }}
            onLayout={() => hueRef.current?.measure((_,__,___,____,px) => { hueX.current=px; })}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderGrant={e => { hueRef.current?.measure((_,__,___,____,px) => { hueX.current=px; applyHue(e.nativeEvent.pageX); }); }}
            onResponderMove={e => applyHue(e.nativeEvent.pageX)}
          >
            {['#ff0000','#ffff00','#00ff00','#00ffff','#0000ff','#ff00ff','#ff0000'].map((c, i, arr) => {
              if (i === arr.length - 1) return null;
              return (
                <View key={i} style={{ flex: 1, flexDirection: 'row' }}>
                  {Array.from({ length: 8 }, (_, j) => {
                    const t = j / 7;
                    const from = hexToRgb(c)!;
                    const to   = hexToRgb(arr[i + 1])!;
                    const rr = Math.round(from.r + (to.r - from.r) * t);
                    const gg = Math.round(from.g + (to.g - from.g) * t);
                    const bb = Math.round(from.b + (to.b - from.b) * t);
                    return <View key={j} style={{ flex: 1, backgroundColor: `rgb(${rr},${gg},${bb})` }} />;
                  })}
                </View>
              );
            })}
            {/* Hue thumb */}
            <View style={{ position:'absolute', top:-3, left: hueThumbX - 6, width:12, height:24, borderRadius:6, borderWidth:2.5, borderColor:'#fff', shadowColor:'#000', shadowOpacity:0.5, shadowRadius:3, shadowOffset:{width:0,height:0}, elevation:4 }} />
          </View>

          {/* ── New / Current preview ── */}
          <View style={{ flexDirection:'row', gap:12, marginBottom:12 }}>
            <View style={{ flex:1, alignItems:'center', gap:4 }}>
              <View style={{ width:'100%', height:36, borderRadius:8, backgroundColor: currentHex, borderWidth:1, borderColor:'#333' }} />
              <Text style={{ fontSize:11, fontWeight:'600', color:'#9ca3af' }}>New</Text>
            </View>
            <View style={{ flex:1, alignItems:'center', gap:4 }}>
              <View style={{ width:'100%', height:36, borderRadius:8, backgroundColor: initialColor.startsWith('#') ? initialColor : currentHex, borderWidth:1, borderColor:'#333' }} />
              <Text style={{ fontSize:11, fontWeight:'600', color:'#9ca3af' }}>Current</Text>
            </View>
          </View>

          {/* ── RGB inputs ── */}
          <View style={{ flexDirection:'row', gap:10, marginBottom:10 }}>
            {(['R','G','B'] as const).map((ch, i) => (
              <View key={ch} style={{ flex:1, alignItems:'center', gap:4 }}>
                <Text style={{ fontSize:11, fontWeight:'700', color:'#9ca3af' }}>{ch}</Text>
                <TextInput
                  style={sp.rgbInput}
                  value={String([r,g,b][i])}
                  keyboardType="numeric" maxLength={3}
                  onChangeText={t => syncRgbChannel(i as 0|1|2, Math.max(0, Math.min(255, parseInt(t)||0)))}
                />
              </View>
            ))}
          </View>

          {/* ── Hex input ── */}
          <View style={{ flexDirection:'row', alignItems:'center', gap:10, marginBottom:18 }}>
            <Text style={{ fontSize:12, fontWeight:'700', color:'#9ca3af', width:28 }}>Hex</Text>
            <TextInput
              style={sp.hexInput}
              value={hexInput}
              onChangeText={syncHex}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={7}
              placeholderTextColor="#555"
            />
          </View>

          {/* ── Actions ── */}
          <View style={sp.actions}>
            <TouchableOpacity onPress={onClose} style={sp.cancelBtn}>
              <Text style={sp.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { onApply(currentHex); onClose(); }} style={sp.applyBtn}>
              <Text style={sp.applyText}>OK</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
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

  // Accessory colors — one per category, null = default (original GLB color)
  const DEFAULT_ACCESSORY_COLORS: Record<AccessoryCategory, string> = {
    jacket: '#4169e1', pants: '#374151', hair: '#1f2937',
    mask: '#6b7280', suit: '#dc2626', shoes: '#92400e',
  };
  const [accessoryColors, setAccessoryColors] = useState<Record<AccessoryCategory, string | null>>({
    jacket: null, pants: null, hair: null, mask: null, suit: null, shoes: null,
  });

  // Main tab: Body | Colors | Store
  const [mainTab, setMainTab] = useState<'body' | 'colors' | 'store'>('body');

  // Skin color
  const [skinColor, setSkinColorState] = useState<string | null>(null);

  // Camera mode
  const [cameraMode, setCameraModeState] = useState<'full' | 'upper' | 'face'>('full');

  // Color picker — shared for Colors tab and Store tab
  const [pickerVisible,      setPickerVisible]      = useState(false);
  const [pickerInitialColor, setPickerInitialColor] = useState('#4169e1');
  const [pickerTarget,       setPickerTarget]       = useState<'colors' | AccessoryCategory>('colors');

  const webViewRef = useRef<WebView>(null);
  const avatarViewerUrl = getAvatarViewerUrl();

  // ── Handlers (identical to original) ───────────────────────────────────
  const send = (type: string, value: string) =>
    webViewRef.current?.postMessage(JSON.stringify({ type, value }));

  const sendSelection = (type: string, selection: number | null) =>
    webViewRef.current?.postMessage(JSON.stringify({ type, selection }));

  const handleSkinColor = (hex: string) => {
    setSkinColorState(hex);
    send('SET_SKIN_COLOR', hex);
  };

  const handleCameraMode = (mode: 'full' | 'upper' | 'face') => {
    setCameraModeState(mode);
    send('SET_CAMERA_MODE', mode);
  };

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

  // Called when user picks a color from the modal
  const handleCustomColor = (hex: string) => {
    if (pickerTarget === 'colors') {
      // Colors tab — apply to avatar body part
      const part = avatarParts.find(p => p.id === selectedPart);
      if (!part) return;
      setSelectedTextures(prev => ({ ...prev, [selectedPart]: hex }));
      send(part.messageType, hex);
    } else {
      // Store tab — apply color to accessory
      setAccessoryColors(prev => ({ ...prev, [pickerTarget]: hex }));
      const typeMap: Record<AccessoryCategory, string> = {
        jacket: 'SET_JACKET_COLOR', pants: 'SET_PANTS_COLOR',
        hair: 'SET_HAIR_COLOR', mask: 'SET_MASK_COLOR',
        suit: 'SET_SUIT_COLOR', shoes: 'SET_SHOES_COLOR',
      };
      send(typeMap[pickerTarget as AccessoryCategory], hex);
    }
  };

  // Open color picker for a store accessory category
  const openStorePicker = (cat: AccessoryCategory) => {
    setPickerTarget(cat);
    setPickerInitialColor(accessoryColors[cat] ?? DEFAULT_ACCESSORY_COLORS[cat]);
    setPickerVisible(true);
  };

  // Send accessory color or reset to default (null)
  const applyAccessoryColor = (cat: AccessoryCategory, hex: string | null) => {
    setAccessoryColors(prev => ({ ...prev, [cat]: hex }));
    const typeMap: Record<AccessoryCategory, string> = {
      jacket: 'SET_JACKET_COLOR', pants: 'SET_PANTS_COLOR',
      hair: 'SET_HAIR_COLOR', mask: 'SET_MASK_COLOR',
      suit: 'SET_SUIT_COLOR', shoes: 'SET_SHOES_COLOR',
    };
    send(typeMap[cat], hex ?? 'default');
  };

  const selectJacket   = (v: number | null) => { setAccessories(p => ({ ...p, jacket:   v })); sendSelection('SET_JACKET',          v); };
  const selectPants    = (v: number | null) => { setAccessories(p => ({ ...p, pants:    v })); sendSelection('SET_PANTS_ACCESSORY', v); };
  const selectHair     = (v: number | null) => { setAccessories(p => ({ ...p, hair:     v })); sendSelection('SET_HAIR_ACCESSORY',  v); };
  const selectMask     = (v: number | null) => { setAccessories(p => ({ ...p, mask:     v })); sendSelection('SET_MASK_ACCESSORY',  v); };
  const selectFullSuit = (v: number | null) => { setAccessories(p => ({ ...p, fullSuit: v })); sendSelection('SET_FULL_SUIT',       v); };
  const selectShoes    = (v: number | null) => { setAccessories(p => ({ ...p, shoes:    v })); sendSelection('SET_SHOES_ACCESSORY', v); };

  const handleReset = () => {
    setSelectedGender('female'); setSelectedBody('female');
    setSelectedTextures({ eyes: 'eyes_default', hair: 'hair_default', top: 'top_default', pants: 'pants_default', shoes: 'shoes_default' });
    setAccessories({ jacket: null, pants: null, hair: null, mask: null, fullSuit: null, shoes: null });
    setAccessoryColors({ jacket: null, pants: null, hair: null, mask: null, suit: null, shoes: null });
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
    <>
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
            onError={(e) => { console.log('WebView error:', e.nativeEvent); }}
            onHttpError={(e) => { console.log('WebView HTTP error:', e.nativeEvent.statusCode); }}
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

                {/* Custom color picker button */}
                <View style={s.swatchItem}>
                  <TouchableOpacity
                    style={s.customSwatchBtn}
                    activeOpacity={0.8}
                    onPress={() => {
                      const cur = selectedTextures[selectedPart as keyof typeof selectedTextures];
                      setPickerTarget('colors');
                      setPickerInitialColor(cur.startsWith('#') ? cur : '#4169e1');
                      setPickerVisible(true);
                    }}
                  >
                    <Text style={s.customSwatchPlus}>+</Text>
                  </TouchableOpacity>
                  <Text style={s.swatchLabel}>Custom</Text>
                </View>
              </View>

              {/* Skin Color */}
              <Text style={s.sectionLabel}>Skin Tone</Text>
              <View style={s.swatchGrid}>
                {[
                  { label: 'Light',   color: '#FDDBB4' },
                  { label: 'Fair',    color: '#F1C27D' },
                  { label: 'Medium',  color: '#E0AC69' },
                  { label: 'Tan',     color: '#C68642' },
                  { label: 'Brown',   color: '#8D5524' },
                  { label: 'Dark',    color: '#4A2912' },
                  { label: 'Default', color: '#888888' },
                ].map(sk => (
                  <View key={sk.label} style={s.swatchItem}>
                    <ColorSwatch
                      color={sk.color}
                      selected={skinColor === (sk.label === 'Default' ? null : sk.color)}
                      onPress={() => handleSkinColor(sk.label === 'Default' ? 'default' : sk.color)}
                    />
                    <Text style={s.swatchLabel}>{sk.label}</Text>
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
                    <ItemBtn label={selectedGender === 'female' ? '4' : '3'} active={accessories.jacket === (selectedGender === 'female' ? 4 : 3)} onPress={() => selectJacket(selectedGender === 'female' ? 4 : 3)} />
                    <ItemBtn label={selectedGender === 'female' ? '5' : '4'} active={accessories.jacket === (selectedGender === 'female' ? 5 : 4)} onPress={() => selectJacket(selectedGender === 'female' ? 5 : 4)} />
                    <ItemBtn label={selectedGender === 'female' ? '6' : '5'} active={accessories.jacket === (selectedGender === 'female' ? 6 : 5)} onPress={() => selectJacket(selectedGender === 'female' ? 6 : 5)} />
                    <ItemBtn label={selectedGender === 'female' ? '7' : '6'} active={accessories.jacket === (selectedGender === 'female' ? 7 : 6)} onPress={() => selectJacket(selectedGender === 'female' ? 7 : 6)} />
                    <ItemBtn label={selectedGender === 'female' ? '8' : '7'} active={accessories.jacket === (selectedGender === 'female' ? 8 : 7)} onPress={() => selectJacket(selectedGender === 'female' ? 8 : 7)} />
                  </>
                )}
                {/* Pants */}
                {selectedAccessoryCategory === 'pants' && (
                  <>
                    <ItemBtn label="OFF" active={accessories.pants === null} onPress={() => selectPants(null)} />
                    <ItemBtn label="1"   active={accessories.pants === 1}    onPress={() => selectPants(1)} />
                    <ItemBtn label="2"   active={accessories.pants === 2}    onPress={() => selectPants(2)} />
                    <ItemBtn label="3"   active={accessories.pants === 3}    onPress={() => selectPants(3)} />
                    <ItemBtn label="4"   active={accessories.pants === 4}    onPress={() => selectPants(4)} />
                    <ItemBtn label="5"   active={accessories.pants === 5}    onPress={() => selectPants(5)} />
                    <ItemBtn label="6"   active={accessories.pants === 6}    onPress={() => selectPants(6)} />
                    <ItemBtn label="7"   active={accessories.pants === 7}    onPress={() => selectPants(7)} />
                  </>
                )}
                {/* Hair */}
                {selectedAccessoryCategory === 'hair' && (
                  <>
                    <ItemBtn label="OFF" active={accessories.hair === null} onPress={() => selectHair(null)} />
                    <ItemBtn label="1"   active={accessories.hair === 1}    onPress={() => selectHair(1)} />
                    <ItemBtn label="2"   active={accessories.hair === 2}    onPress={() => selectHair(2)} />
                    <ItemBtn label="3"   active={accessories.hair === 3}    onPress={() => selectHair(3)} />
                    <ItemBtn label="4"   active={accessories.hair === 4}    onPress={() => selectHair(4)} />
                    <ItemBtn label="5"   active={accessories.hair === 5}    onPress={() => selectHair(5)} />
                    <ItemBtn label="6"   active={accessories.hair === 6}    onPress={() => selectHair(6)} />
                  </>
                )}
                {/* Mask */}
                {selectedAccessoryCategory === 'mask' && (
                  <>
                    <ItemBtn label="OFF" active={accessories.mask === null} onPress={() => selectMask(null)} />
                    <ItemBtn label="1"   active={accessories.mask === 1}    onPress={() => selectMask(1)} />
                    <ItemBtn label="2" active={accessories.mask === 2} onPress={() => selectMask(2)} />
                  </>
                )}
                {/* Suit */}
                {selectedAccessoryCategory === 'suit' && (
                  <>
                    <ItemBtn label="OFF" active={accessories.fullSuit === null} onPress={() => selectFullSuit(null)} />
                    {selectedGender === 'female' && (
                      <>
                        <ItemBtn label="1" active={accessories.fullSuit === 1} onPress={() => selectFullSuit(1)} />
                        <ItemBtn label="2" active={accessories.fullSuit === 2} onPress={() => selectFullSuit(2)} />
                        <ItemBtn label="3" active={accessories.fullSuit === 3} onPress={() => selectFullSuit(3)} />
                        <ItemBtn label="4" active={accessories.fullSuit === 4} onPress={() => selectFullSuit(4)} />
                        <ItemBtn label="5" active={accessories.fullSuit === 5} onPress={() => selectFullSuit(5)} />
                        <ItemBtn label="6" active={accessories.fullSuit === 6} onPress={() => selectFullSuit(6)} />
                        <ItemBtn label="7" active={accessories.fullSuit === 7} onPress={() => selectFullSuit(7)} />
                        <ItemBtn label="8" active={accessories.fullSuit === 8} onPress={() => selectFullSuit(8)} />
                      </>
                    )}
                    {selectedGender === 'male' && (
                      <ItemBtn label="1" active={accessories.fullSuit === 3} onPress={() => selectFullSuit(3)} />
                    )}
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

              {/* ── Color palette ── */}
              <Text style={[s.sectionLabel, { marginTop: 20 }]}>Color</Text>
              <View style={s.swatchGrid}>
                {/* Default swatch */}
                <View style={s.swatchItem}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => applyAccessoryColor(selectedAccessoryCategory, null)}
                    style={[s.swatchWrap]}>
                    <View style={[s.swatch,
                      { backgroundColor: DEFAULT_ACCESSORY_COLORS[selectedAccessoryCategory] },
                      accessoryColors[selectedAccessoryCategory] === null && s.swatchSelected,
                    ]} />
                  </TouchableOpacity>
                  <Text style={s.swatchLabel}>Default</Text>
                </View>

                {/* Preset swatches */}
                {ACCESSORY_PRESETS[selectedAccessoryCategory].map(hex => (
                  <View key={hex} style={s.swatchItem}>
                    <TouchableOpacity activeOpacity={0.8}
                      onPress={() => applyAccessoryColor(selectedAccessoryCategory, hex)}
                      style={s.swatchWrap}>
                      <View style={[s.swatch, { backgroundColor: hex },
                        accessoryColors[selectedAccessoryCategory] === hex && s.swatchSelected,
                      ]} />
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Custom picker */}
                <View style={s.swatchItem}>
                  <TouchableOpacity style={s.customSwatchBtn} activeOpacity={0.8}
                    onPress={() => openStorePicker(selectedAccessoryCategory)}>
                    <Text style={s.customSwatchPlus}>+</Text>
                  </TouchableOpacity>
                  <Text style={s.swatchLabel}>Custom</Text>
                </View>
              </View>

              {/* Selected color hex display */}
              {accessoryColors[selectedAccessoryCategory] && (
                <View style={{ flexDirection:'row', alignItems:'center', gap:8, marginTop:4 }}>
                  <View style={{ width:14, height:14, borderRadius:7,
                    backgroundColor: accessoryColors[selectedAccessoryCategory]!,
                    borderWidth:1, borderColor:D.border }} />
                  <Text style={{ fontSize:12, color:D.subtext }}>
                    {accessoryColors[selectedAccessoryCategory]!.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          )}

        </ScrollView>

        {/* ── Bottom action bar ── */}
        <View style={s.actionBar}>
          <TouchableOpacity onPress={handleReset} style={s.resetBtn} activeOpacity={0.8}>
            <Text style={s.resetBtnText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
              saveAvatarConfig({
                bodyType: selectedBody,
                gender: selectedGender,
                textures: selectedTextures,
                accessories,
              }).then(data => {
                if (data.success) Alert.alert('Saved!', 'Your avatar has been saved.');
                else Alert.alert('Error', data.message || 'Failed to save');
              }).catch(() => Alert.alert('Error', 'Network error'));
            }} style={s.saveBtn} activeOpacity={0.8}>
            <Text style={s.saveBtnText}>Save Avatar</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>

    {/* ── Color picker modal — always mounted at root so it works from any tab ── */}
    <ColorPickerModal
      visible={pickerVisible}
      initialColor={pickerInitialColor}
      onApply={handleCustomColor}
      onClose={() => setPickerVisible(false)}
    />
    </>
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

  // Custom color swatch button
  customSwatchBtn: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 2, borderColor: D.border,
    borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: D.card,
  },
  customSwatchPlus: { fontSize: 22, color: D.muted, lineHeight: 26 },

  // Action bar
  actionBar: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 120,
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
    shadowColor: D.accent, shadowOpacity: 0.3,
    shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#ffffff' },
});

// ─── COLOR PICKER MODAL STYLES ────────────────────────────────────────────────
const sp = StyleSheet.create({
  overlay:   { flex: 1, backgroundColor: 'rgba(44,26,14,0.6)', justifyContent: 'flex-end' },
  sheet:     { backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, borderWidth: 1.5, borderColor: '#EBCCAD' },
  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title:     { fontSize: 18, fontWeight: '800', color: '#2C1A0E' },
  closeBtn:  { fontSize: 18, color: '#9A7A5A', paddingHorizontal: 4 },
  rgbInput:  { width: '100%', height: 40, borderRadius: 10, backgroundColor: '#FDF0E4', color: '#2C1A0E', textAlign: 'center', fontSize: 14, fontWeight: '600', borderWidth: 1, borderColor: '#EBCCAD' },
  hexInput:  { flex: 1, height: 40, borderRadius: 10, backgroundColor: '#FDF0E4', color: '#2C1A0E', paddingHorizontal: 12, fontSize: 14, letterSpacing: 1, borderWidth: 1, borderColor: '#EBCCAD' },
  actions:   { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, height: 48, borderRadius: 14, borderWidth: 1.5, borderColor: '#EBCCAD', justifyContent: 'center', alignItems: 'center' },
  cancelText:{ fontSize: 15, fontWeight: '600', color: '#9A7A5A' },
  applyBtn:  { flex: 2, height: 48, borderRadius: 14, backgroundColor: '#EC802B', justifyContent: 'center', alignItems: 'center' },
  applyText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});


import * as FS from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Circle, Path, Rect, Svg } from 'react-native-svg';

const { width: SW } = Dimensions.get('window');
const CARD = (SW - 48) / 2;

const C = {
  bg:      '#060608',
  surface: '#0d0d18',
  card:    '#13131f',
  border:  '#1e1e2e',
  accent:  '#7c3aed',
  neon:    '#a78bfa',
  cyan:    '#22d3ee',
  text:    '#f1f5f9',
  muted:   '#6b7280',
  sub:     '#94a3b8',
};

// ─── Icons ────────────────────────────────────────────────────────────────────
function ShareIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7" stroke={color} strokeWidth={2} strokeLinecap="round"/>
      <Path d="M12 3v12M8 7l4-4 4 4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function TrashIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function EmptyIcon({ color }: { color: string }) {
  return (
    <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={3} width={18} height={18} rx={3} stroke={color} strokeWidth={1.5}/>
      <Path d="M3 9h18" stroke={color} strokeWidth={1.5}/>
      <Circle cx={12} cy={15} r={2} stroke={color} strokeWidth={1.5}/>
    </Svg>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface SavedAvatar {
  uri: string;
  name: string;
  style: string;
  character: string;
  createdAt: number;
}

const STORAGE_KEY = 'saved_avatars_v1';

export async function saveAvatarToGallery(avatar: Omit<SavedAvatar, 'uri'> & { base64: string }): Promise<void> {
  const fileUri = FS.documentDirectory + `avatar_${avatar.createdAt}.png`;
  await FS.writeAsStringAsync(fileUri, avatar.base64, { encoding: FS.EncodingType.Base64 });

  const metaUri = FS.documentDirectory + STORAGE_KEY + '.json';
  let existing: SavedAvatar[] = [];
  try {
    const raw = await FS.readAsStringAsync(metaUri);
    existing = JSON.parse(raw);
  } catch {}

  existing.unshift({
    uri: fileUri,
    name: avatar.name,
    style: avatar.style,
    character: avatar.character,
    createdAt: avatar.createdAt,
  });

  await FS.writeAsStringAsync(metaUri, JSON.stringify(existing));
}

async function loadAvatars(): Promise<SavedAvatar[]> {
  const metaUri = FS.documentDirectory + STORAGE_KEY + '.json';
  try {
    const raw = await FS.readAsStringAsync(metaUri);
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function deleteAvatar(avatar: SavedAvatar): Promise<void> {
  try { await FS.deleteAsync(avatar.uri, { idempotent: true }); } catch {}
  const metaUri = FS.documentDirectory + STORAGE_KEY + '.json';
  try {
    const raw = await FS.readAsStringAsync(metaUri);
    const list: SavedAvatar[] = JSON.parse(raw);
    await FS.writeAsStringAsync(metaUri, JSON.stringify(list.filter(a => a.createdAt !== avatar.createdAt)));
  } catch {}
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ExportAvatarScreen() {
  const [avatars, setAvatars] = useState<SavedAvatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SavedAvatar | null>(null);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    loadAvatars().then(list => { setAvatars(list); setLoading(false); });
  }, []));

  const handleShare = async (avatar: SavedAvatar) => {
    try {
      const Sharing = require('expo-sharing');
      const ok = await Sharing.isAvailableAsync();
      if (!ok) { Alert.alert('Not supported', 'Sharing unavailable on this device.'); return; }
      await Sharing.shareAsync(avatar.uri, { mimeType: 'image/png', dialogTitle: 'Export Avatar' });
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to share');
    }
  };

  const handleDelete = (avatar: SavedAvatar) => {
    Alert.alert('Delete Avatar', `Remove "${avatar.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await deleteAvatar(avatar);
          setAvatars(prev => prev.filter(a => a.createdAt !== avatar.createdAt));
          if (selected?.createdAt === avatar.createdAt) setSelected(null);
        },
      },
    ]);
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Saved Avatars</Text>
        <Text style={s.subtitle}>{avatars.length} avatar{avatars.length !== 1 ? 's' : ''} saved</Text>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={C.neon} size="large" />
        </View>
      ) : avatars.length === 0 ? (
        <View style={s.center}>
          <EmptyIcon color={C.muted} />
          <Text style={s.emptyTitle}>No avatars yet</Text>
          <Text style={s.emptyText}>Generate avatars in 2D Studio and save them here</Text>
        </View>
      ) : (
        <FlatList
          data={avatars}
          numColumns={2}
          keyExtractor={item => String(item.createdAt)}
          contentContainerStyle={s.grid}
          columnWrapperStyle={s.row}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.card} onPress={() => setSelected(item)} activeOpacity={0.85}>
              <Image source={{ uri: item.uri }} style={s.thumb} contentFit="cover" />
              <View style={s.cardInfo}>
                <Text style={s.cardName} numberOfLines={1}>{item.name}</Text>
                <Text style={s.cardMeta} numberOfLines={1}>{item.style} · {item.character}</Text>
                <Text style={s.cardDate}>{formatDate(item.createdAt)}</Text>
              </View>
              <View style={s.cardActions}>
                <TouchableOpacity style={s.actionBtn} onPress={() => handleShare(item)}>
                  <ShareIcon color={C.neon} />
                </TouchableOpacity>
                <TouchableOpacity style={s.actionBtn} onPress={() => handleDelete(item)}>
                  <TrashIcon color="#ef4444" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Fullscreen preview */}
      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <View style={s.fsOverlay}>
          <TouchableOpacity style={s.fsClose} onPress={() => setSelected(null)}>
            <Text style={s.fsCloseText}>✕</Text>
          </TouchableOpacity>
          {selected && (
            <>
              <Image source={{ uri: selected.uri }} style={s.fsImage} contentFit="contain" />
              <View style={s.fsMeta}>
                <Text style={s.fsName}>{selected.name}</Text>
                <Text style={s.fsSub}>{selected.style} · {selected.character}</Text>
                <Text style={s.fsSub}>{formatDate(selected.createdAt)}</Text>
                <View style={s.fsActions}>
                  <TouchableOpacity style={s.fsBtn} onPress={() => handleShare(selected)}>
                    <ShareIcon color="#fff" />
                    <Text style={s.fsBtnText}>Export</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[s.fsBtn, s.fsBtnDanger]} onPress={() => handleDelete(selected)}>
                    <TrashIcon color="#fff" />
                    <Text style={s.fsBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  title:  { fontSize: 26, fontWeight: '800', color: C.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: C.muted, marginTop: 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.sub },
  emptyText:  { fontSize: 13, color: C.muted, textAlign: 'center', paddingHorizontal: 40 },

  grid: { paddingHorizontal: 16, paddingBottom: 120 },
  row:  { gap: 16, marginBottom: 16 },

  card: {
    width: CARD, backgroundColor: C.card,
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: C.border,
  },
  thumb: { width: CARD, height: CARD },
  cardInfo: { padding: 10 },
  cardName: { fontSize: 13, fontWeight: '700', color: C.text },
  cardMeta: { fontSize: 11, color: C.muted, marginTop: 2 },
  cardDate: { fontSize: 10, color: C.muted, marginTop: 2 },
  cardActions: {
    flexDirection: 'row', borderTopWidth: 1, borderColor: C.border,
  },
  actionBtn: {
    flex: 1, paddingVertical: 10, alignItems: 'center', justifyContent: 'center',
  },

  fsOverlay: { flex: 1, backgroundColor: '#000000ee', justifyContent: 'center', alignItems: 'center' },
  fsClose:   { position: 'absolute', top: 60, right: 20, zIndex: 10, padding: 10 },
  fsCloseText: { color: '#fff', fontSize: 22 },
  fsImage:   { width: SW, height: SW },
  fsMeta:    { padding: 20, alignItems: 'center', gap: 4 },
  fsName:    { fontSize: 18, fontWeight: '800', color: C.text },
  fsSub:     { fontSize: 13, color: C.muted },
  fsActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  fsBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: C.accent, paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 12,
  },
  fsBtnDanger: { backgroundColor: '#ef4444' },
  fsBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});

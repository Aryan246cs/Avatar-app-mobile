import { deleteFromGallery, loadAvatarConfig, loadGallery } from '@/utils/api';
import * as FS from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator, Alert, Dimensions, FlatList,
    Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { Circle, Path, Rect, Svg } from 'react-native-svg';

const { width: SW } = Dimensions.get('window');
const CARD = (SW - 48) / 2;

const T = {
  cream:    '#EBCCAD',
  orange:   '#EC802B',
  yellow:   '#EDC55B',
  teal:     '#66BCB4',
  dark:     '#2C1A0E',
  white:    '#FFFFFF',
  offwhite: '#FDF8F3',
  muted:    '#9A7A5A',
  border:   '#EBCCAD',
  card:     '#FDF0E4',
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
    <Svg width={56} height={56} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={3} width={18} height={18} rx={3} stroke={color} strokeWidth={1.5}/>
      <Circle cx={12} cy={14} r={2} stroke={color} strokeWidth={1.5}/>
      <Path d="M9 9h6" stroke={color} strokeWidth={1.5} strokeLinecap="round"/>
    </Svg>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface SavedAvatar {
  uri: string; name: string; style: string; character: string; createdAt: number;
}
const STORAGE_KEY = 'saved_avatars_v1';

export async function saveAvatarToGallery(avatar: Omit<SavedAvatar, 'uri'> & { base64: string }): Promise<void> {
  const fileUri = FS.documentDirectory + `avatar_${avatar.createdAt}.png`;
  await FS.writeAsStringAsync(fileUri, avatar.base64, { encoding: FS.EncodingType.Base64 });
  const metaUri = FS.documentDirectory + STORAGE_KEY + '.json';
  let existing: SavedAvatar[] = [];
  try { const raw = await FS.readAsStringAsync(metaUri); existing = JSON.parse(raw); } catch {}
  existing.unshift({ uri: fileUri, name: avatar.name, style: avatar.style, character: avatar.character, createdAt: avatar.createdAt });
  await FS.writeAsStringAsync(metaUri, JSON.stringify(existing));
}

async function loadLocalAvatars(): Promise<SavedAvatar[]> {
  const metaUri = FS.documentDirectory + STORAGE_KEY + '.json';
  try { const raw = await FS.readAsStringAsync(metaUri); return JSON.parse(raw); } catch { return []; }
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ExportAvatarScreen() {
  const [tab, setTab]               = useState<'2d' | '3d'>('2d');
  const [gallery2d, setGallery2d]   = useState<any[]>([]);
  const [avatar3d, setAvatar3d]     = useState<any>(null);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState<SavedAvatar | null>(null);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    Promise.all([
      loadLocalAvatars(),
      loadGallery().catch(() => ({ items: [] })),
      loadAvatarConfig().catch(() => ({ config: null })),
    ]).then(([local, cloudGallery, cloudAvatar]) => {
      const cloudItems = cloudGallery?.items ?? [];
      // Show local items first, then cloud-only items (no local file)
      // Cloud items don't have uri so they're distinct
      setGallery2d([...local, ...cloudItems]);
      setAvatar3d(cloudAvatar?.config ?? null);
      setLoading(false);
    });
  }, []));

  const handleShare = async (avatar: any) => {
    try {
      if (!avatar.uri) {
        Alert.alert('Not available', 'This image is cloud-only. Re-generate and save to download.');
        return;
      }
      // Use React Native's built-in Share
      const { Share } = require('react-native');
      await Share.share({
        title: avatar.name || 'My Avatar',
        message: `Check out my avatar: ${avatar.name || 'Avatar'}`,
        url: avatar.uri,
      });
    } catch (e: any) {
      if (e?.message !== 'User did not share') {
        Alert.alert('Error', e?.message ?? 'Failed to share');
      }
    }
  };

  const handleDelete = (item: any) => {
    Alert.alert('Delete', `Remove "${item.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        if (item._id) await deleteFromGallery(item._id).catch(() => {});
        if (item.uri) {
          try { await FS.deleteAsync(item.uri, { idempotent: true }); } catch {}
          const metaUri = FS.documentDirectory + STORAGE_KEY + '.json';
          try {
            const raw = await FS.readAsStringAsync(metaUri);
            const list: SavedAvatar[] = JSON.parse(raw);
            await FS.writeAsStringAsync(metaUri, JSON.stringify(list.filter(a => a.createdAt !== item.createdAt)));
          } catch {}
        }
        setGallery2d(prev => prev.filter(a => a._id !== item._id && a.createdAt !== item.createdAt));
        if (selected?.createdAt === item.createdAt) setSelected(null);
      }},
    ]);
  };

  const formatDate = (val: any) => {
    const d = new Date(typeof val === 'number' ? val : val);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>My Avatars</Text>
        <Text style={s.subtitle}>Your saved creations</Text>
      </View>

      {/* Tab switcher */}
      <View style={s.tabs}>
        <TouchableOpacity style={[s.tab, tab === '2d' && s.tabActive]} onPress={() => setTab('2d')} activeOpacity={0.8}>
          <Text style={[s.tabText, tab === '2d' && s.tabTextActive]}>2D Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.tab, tab === '3d' && s.tabActive]} onPress={() => setTab('3d')} activeOpacity={0.8}>
          <Text style={[s.tabText, tab === '3d' && s.tabTextActive]}>3D Avatar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator color={T.orange} size="large" /></View>
      ) : tab === '2d' ? (
        // ── 2D Gallery ──
        gallery2d.length === 0 ? (
          <View style={s.center}>
            <EmptyIcon color={T.muted} />
            <Text style={s.emptyTitle}>No 2D avatars yet</Text>
            <Text style={s.emptyText}>Generate avatars in 2D Studio and save them here</Text>
          </View>
        ) : (
          <FlatList
            data={gallery2d}
            numColumns={2}
            keyExtractor={(item, i) => item._id ?? String(item.createdAt ?? i)}
            contentContainerStyle={s.grid}
            columnWrapperStyle={s.row}
            renderItem={({ item }) => (
              <TouchableOpacity style={s.card} onPress={() => item.uri && setSelected(item)} activeOpacity={0.85}>
                {item.uri ? (
                  <Image source={{ uri: item.uri }} style={s.thumb} contentFit="cover" />
                ) : (
                  <View style={[s.thumb, s.cloudThumb]}>
                    <Text style={s.cloudIcon}>☁</Text>
                    <Text style={s.cloudText}>Cloud</Text>
                  </View>
                )}
                <View style={s.cardInfo}>
                  <Text style={s.cardName} numberOfLines={1}>{item.name || 'Avatar'}</Text>
                  <Text style={s.cardMeta} numberOfLines={1}>{item.style} · {item.character || '—'}</Text>
                  <Text style={s.cardDate}>{formatDate(item.createdAt)}</Text>
                </View>
                <View style={s.cardActions}>
                  {item.uri && (
                    <TouchableOpacity style={s.actionBtn} onPress={() => handleShare(item)}>
                      <ShareIcon color={T.orange} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={s.actionBtn} onPress={() => handleDelete(item)}>
                    <TrashIcon color="#e05c5c" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
          />
        )
      ) : (
        // ── 3D Avatar Config ──
        <ScrollView contentContainerStyle={s.config3dContent}>
          {avatar3d ? (
            <View style={s.config3dCard}>
              <View style={s.config3dHeader}>
                <Text style={s.config3dTitle}>Saved 3D Avatar</Text>
                <Text style={s.config3dDate}>Last saved: {formatDate(avatar3d.updatedAt ?? Date.now())}</Text>
              </View>

              <View style={s.configRow}>
                <Text style={s.configLabel}>Body Type</Text>
                <Text style={s.configValue}>{avatar3d.bodyType}</Text>
              </View>
              <View style={s.configRow}>
                <Text style={s.configLabel}>Gender</Text>
                <Text style={s.configValue}>{avatar3d.gender}</Text>
              </View>

              <Text style={s.configSection}>Colors</Text>
              {Object.entries(avatar3d.textures || {}).map(([k, v]) => (
                <View key={k} style={s.configRow}>
                  <Text style={s.configLabel}>{k.charAt(0).toUpperCase() + k.slice(1)}</Text>
                  <Text style={s.configValue}>{String(v)}</Text>
                </View>
              ))}

              <Text style={s.configSection}>Accessories</Text>
              {Object.entries(avatar3d.accessories || {}).map(([k, v]) => v !== null && (
                <View key={k} style={s.configRow}>
                  <Text style={s.configLabel}>{k.charAt(0).toUpperCase() + k.slice(1)}</Text>
                  <Text style={s.configValue}>Style {String(v)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={s.center}>
              <EmptyIcon color={T.muted} />
              <Text style={s.emptyTitle}>No 3D avatar saved</Text>
              <Text style={s.emptyText}>Customize your avatar in the 3D Editor and tap "Save Avatar"</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Fullscreen modal for local images */}
      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <View style={s.fsOverlay}>
          <TouchableOpacity style={s.fsClose} onPress={() => setSelected(null)}>
            <Text style={s.fsCloseText}>✕</Text>
          </TouchableOpacity>
          {selected?.uri && (
            <Image source={{ uri: selected.uri }} style={{ width: SW, height: SW }} contentFit="contain" />
          )}
          {selected && (
            <View style={s.fsActions}>
              <TouchableOpacity style={s.fsBtn} onPress={() => handleShare(selected)} activeOpacity={0.8}>
                <ShareIcon color={T.white} />
                <Text style={s.fsBtnText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.fsBtn, { borderColor: '#e05c5c' }]} onPress={() => { handleDelete(selected); setSelected(null); }} activeOpacity={0.8}>
                <TrashIcon color="#e05c5c" />
                <Text style={[s.fsBtnText, { color: '#e05c5c' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: T.offwhite },
  header:  { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
  title:   { fontSize: 24, fontWeight: '900', color: T.dark },
  subtitle:{ fontSize: 13, color: T.muted, marginTop: 2 },
  center:  { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: T.dark, textAlign: 'center' },
  emptyText:  { fontSize: 13, color: T.muted, textAlign: 'center', lineHeight: 20 },

  tabs: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: T.cream, borderRadius: 14, padding: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 11, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: T.white, shadowColor: T.orange, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 3 },
  tabText: { fontSize: 14, fontWeight: '600', color: T.muted },
  tabTextActive: { color: T.dark, fontWeight: '800' },

  grid: { paddingHorizontal: 16, paddingBottom: 120 },
  row:  { gap: 16, marginBottom: 16 },
  card: { width: CARD, backgroundColor: T.white, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: T.border },
  thumb: { width: '100%', aspectRatio: 1 },
  cloudThumb: { backgroundColor: T.card, alignItems: 'center', justifyContent: 'center' },
  cloudIcon: { fontSize: 28, marginBottom: 4 },
  cloudText: { fontSize: 11, color: T.muted, fontWeight: '600' },
  cardInfo: { padding: 10 },
  cardName: { fontSize: 13, fontWeight: '700', color: T.dark, marginBottom: 2 },
  cardMeta: { fontSize: 11, color: T.muted, marginBottom: 2 },
  cardDate: { fontSize: 10, color: T.muted },
  cardActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: T.border },
  actionBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },

  // 3D config
  config3dContent: { padding: 20, paddingBottom: 120 },
  config3dCard: { backgroundColor: T.white, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: T.border },
  config3dHeader: { marginBottom: 16 },
  config3dTitle: { fontSize: 18, fontWeight: '800', color: T.dark },
  config3dDate: { fontSize: 12, color: T.muted, marginTop: 2 },
  configSection: { fontSize: 11, fontWeight: '800', color: T.orange, letterSpacing: 1.5, marginTop: 16, marginBottom: 8 },
  configRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F5EDE0' },
  configLabel: { fontSize: 13, color: T.muted, fontWeight: '600' },
  configValue: { fontSize: 13, color: T.dark, fontWeight: '700' },

  // Fullscreen
  fsOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center' },
  fsClose: { position: 'absolute', top: 56, right: 20, zIndex: 10, padding: 10 },
  fsCloseText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  fsActions: { position: 'absolute', bottom: 60, flexDirection: 'row', gap: 16 },
  fsBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, borderWidth: 1.5, borderColor: T.orange },
  fsBtnText: { color: T.orange, fontSize: 14, fontWeight: '700' },
  fsCloseBtn: {},
  white: T.white,
});

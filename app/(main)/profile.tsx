import { loadProfile, updateProfile } from '@/utils/api';
import { clearAuthToken } from '@/utils/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert, ScrollView, StyleSheet, Text,
    TextInput, TouchableOpacity, View,
} from 'react-native';

const T = {
  cream:   '#EBCCAD',
  orange:  '#EC802B',
  yellow:  '#EDC55B',
  teal:    '#66BCB4',
  dark:    '#2C1A0E',
  white:   '#FFFFFF',
  offwhite:'#FDF8F3',
  muted:   '#9A7A5A',
  border:  '#EBCCAD',
};

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadProfile().then(data => {
      if (data.success) {
        setProfile(data.profile);
        setUsername(data.profile.username || '');
        setBio(data.profile.bio || '');
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await updateProfile({ username, bio });
      if (data.success) {
        setProfile((p: any) => ({ ...p, username, bio }));
        setEditing(false);
        Alert.alert('Saved!', 'Profile updated.');
      } else {
        Alert.alert('Error', data.message);
      }
    } catch {
      Alert.alert('Error', 'Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { await clearAuthToken(); router.replace('/login'); } },
    ]);
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={T.orange} />
      </View>
    );
  }

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={['#EC802B', '#EDC55B']} style={s.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={s.blob1} /><View style={s.blob2} />
        <View style={s.avatarCircle}>
          <Text style={s.avatarInitial}>
            {(profile?.username || profile?.email || 'U')[0].toUpperCase()}
          </Text>
        </View>
        <Text style={s.displayName}>{profile?.username || 'Anonymous'}</Text>
        <Text style={s.email}>{profile?.email}</Text>
        <View style={s.statsRow}>
          <View style={s.stat}>
            <Text style={s.statVal}>{profile?.avatarCount || 0}</Text>
            <Text style={s.statLbl}>Avatars</Text>
          </View>
          <View style={[s.stat, s.statBorder]}>
            <Text style={s.statVal}>{new Date(profile?.joinedAt).getFullYear()}</Text>
            <Text style={s.statLbl}>Joined</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Edit Profile */}
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Text style={s.cardTitle}>Profile Info</Text>
          <TouchableOpacity onPress={() => editing ? handleSave() : setEditing(true)} style={s.editBtn} activeOpacity={0.8}>
            <Text style={s.editBtnText}>{saving ? 'Saving…' : editing ? 'Save' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>

        <View style={s.field}>
          <Text style={s.label}>USERNAME</Text>
          <TextInput
            style={[s.input, !editing && s.inputDisabled]}
            value={username}
            onChangeText={setUsername}
            editable={editing}
            placeholder="Choose a username"
            placeholderTextColor={T.muted}
            maxLength={30}
          />
        </View>

        <View style={s.field}>
          <Text style={s.label}>BIO</Text>
          <TextInput
            style={[s.input, s.inputMulti, !editing && s.inputDisabled]}
            value={bio}
            onChangeText={setBio}
            editable={editing}
            placeholder="Tell us about yourself…"
            placeholderTextColor={T.muted}
            multiline
            maxLength={160}
          />
          {editing && <Text style={s.charCount}>{bio.length}/160</Text>}
        </View>

        {editing && (
          <TouchableOpacity onPress={() => setEditing(false)} style={s.cancelBtn} activeOpacity={0.8}>
            <Text style={s.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Account */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Account</Text>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>Email</Text>
          <Text style={s.infoValue}>{profile?.email}</Text>
        </View>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>Member since</Text>
          <Text style={s.infoValue}>{new Date(profile?.joinedAt).toLocaleDateString()}</Text>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
        <Text style={s.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: T.offwhite },
  content: { paddingBottom: 120 },
  center:  { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: T.offwhite },

  header: { overflow: 'hidden', alignItems: 'center', paddingTop: 60, paddingBottom: 28 },
  blob1: { position: 'absolute', top: -40, right: -30, width: 160, height: 160, borderRadius: 80, backgroundColor: T.teal, opacity: 0.2 },
  blob2: { position: 'absolute', bottom: 10, left: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: T.cream, opacity: 0.2 },

  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.25)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarInitial: { fontSize: 32, fontWeight: '900', color: T.white },
  displayName: { fontSize: 22, fontWeight: '800', color: T.white, marginBottom: 4 },
  email: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 20 },

  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 32, gap: 32 },
  stat: { alignItems: 'center' },
  statBorder: { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.3)', paddingLeft: 32 },
  statVal: { fontSize: 20, fontWeight: '900', color: T.white },
  statLbl: { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: '600' },

  card: { backgroundColor: T.white, marginHorizontal: 20, marginTop: 16, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: T.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: T.dark },
  editBtn: { backgroundColor: T.orange, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 7 },
  editBtnText: { fontSize: 13, fontWeight: '700', color: T.white },

  field: { marginBottom: 14 },
  label: { fontSize: 10, fontWeight: '800', color: T.orange, letterSpacing: 1.5, marginBottom: 6 },
  input: { backgroundColor: T.offwhite, borderRadius: 12, borderWidth: 1.5, borderColor: T.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: T.dark },
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },
  inputDisabled: { backgroundColor: '#FDF8F3', color: T.muted },
  charCount: { fontSize: 11, color: T.muted, textAlign: 'right', marginTop: 4 },
  cancelBtn: { alignItems: 'center', paddingVertical: 10 },
  cancelText: { fontSize: 14, color: T.muted, fontWeight: '600' },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5EDE0' },
  infoLabel: { fontSize: 13, color: T.muted, fontWeight: '600' },
  infoValue: { fontSize: 13, color: T.dark, fontWeight: '600' },

  logoutBtn: { marginHorizontal: 20, marginTop: 16, height: 52, borderRadius: 16, backgroundColor: T.white, borderWidth: 1.5, borderColor: '#F06038', alignItems: 'center', justifyContent: 'center' },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#F06038' },
});

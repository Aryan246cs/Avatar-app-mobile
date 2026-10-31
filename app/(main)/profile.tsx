import { useAppearance } from '@/constants/appearance';
import { changePassword, loadProfile, updateProfile } from '@/utils/api';
import { clearAuthToken } from '@/utils/auth';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Switch,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';

type ProfileData = {
  email: string; username: string; displayName: string; pronouns: string; bio: string;
  profileImage: string; avatarCount: number; joinedAt?: string;
};

const MAX_PHOTO_BYTES = 2_800_000;

export default function ProfileScreen() {
  const router = useRouter();
  const { mode, colors, toggle } = useAppearance();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const applyProfile = (next: ProfileData) => {
    setProfile(next);
    setDisplayName(next.displayName || '');
    setUsername(next.username || '');
    setPronouns(next.pronouns || '');
    setBio(next.bio || '');
  };

  useEffect(() => {
    loadProfile().then(data => {
      if (data.success) applyProfile(data.profile);
    }).catch(() => Alert.alert('Could not load profile', 'Check your connection and try again.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const result = await updateProfile({ displayName, username, pronouns, bio });
      if (!result.success) return Alert.alert('Could not save changes', result.message || 'Try again.');
      applyProfile({ ...profile!, displayName: displayName.trim(), username: username.trim(), pronouns: pronouns.trim(), bio: bio.trim() });
      setEditing(false);
    } catch {
      Alert.alert('Could not save changes', 'Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const cancelProfileEdit = () => {
    if (!profile) return setEditing(false);
    setDisplayName(profile.displayName || '');
    setUsername(profile.username || '');
    setPronouns(profile.pronouns || '');
    setBio(profile.bio || '');
    setEditing(false);
  };

  const openPhotoPicker = async () => {
    if (uploadingPhoto) return;
    setUploadingPhoto(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Photo access needed', 'Allow photo access to choose a profile picture.');
        return;
      }
      const selection = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 1,
      });
      if (selection.canceled || !selection.assets[0]) return;
      const asset = selection.assets[0];
      const resized = await ImageManipulator.manipulate(asset.uri, { maxWidth: 512, maxHeight: 512 })
        .resize({ width: 512, height: 512 })
        .renderAsync();
      const normalized = await resized.saveAsync({ base64: true, compress: 0.78, format: SaveFormat.JPEG });
      const base64 = normalized.base64;
      if (!base64 || Math.floor(base64.length * 0.75) > MAX_PHOTO_BYTES || base64.length > 3_800_000) {
        Alert.alert('Photo is too large', 'Choose a photo smaller than 2.8 MB.');
        return;
      }
      const result = await updateProfile({ profileImage: `data:image/jpeg;base64,${base64}` });
      if (!result.success) {
        Alert.alert('Could not update photo', result.message || 'Choose a different image.');
        return;
      }
      setProfile(current => current ? { ...current, profileImage: result.profile.profileImage } : current);
    } catch {
      Alert.alert('Could not update photo', 'Please try a JPEG or PNG image smaller than 2.8 MB.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = () => {
    Alert.alert('Remove profile photo?', 'Your initials will be shown instead.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        try {
          const result = await updateProfile({ profileImage: '' });
          if (result.success) setProfile(current => current ? { ...current, profileImage: '' } : current);
        } catch { Alert.alert('Could not remove photo', 'Try again.'); }
      } },
    ]);
  };

  const submitPasswordChange = async () => {
    if (newPassword.length < 10 || newPassword.length > 128) return Alert.alert('Password length', 'Use 10–128 characters.');
    if (newPassword !== confirmPassword) return Alert.alert('Passwords do not match', 'Check the new password and confirmation.');
    setSavingPassword(true);
    try {
      const result = await changePassword(currentPassword, newPassword);
      if (!result.success) return Alert.alert('Could not change password', result.message || 'Try again.');
      setPasswordModalOpen(false);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      Alert.alert('Password updated', 'Your password has been changed.');
    } catch { Alert.alert('Could not change password', 'Check your connection and try again.'); }
    finally { setSavingPassword(false); }
  };

  const closePasswordModal = () => {
    setPasswordModalOpen(false);
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
  };

  const handleLogout = () => Alert.alert('Sign out?', 'You can sign back in any time.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Sign out', style: 'destructive', onPress: async () => { await clearAuthToken(); router.replace('/login'); } },
  ]);

  if (loading) return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.accent}/></View>;

  const initial = (profile?.displayName || profile?.username || profile?.email || 'A').trim().charAt(0).toUpperCase();
  const joined = profile?.joinedAt ? new Date(profile.joinedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : '—';

  return (
    <>
      <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={mode === 'dark' ? ['#14213A', '#263D68'] : ['#142747', '#3157D5']} style={styles.header}>
          <View style={styles.headerTop}>
            <View><Text style={styles.headerEyebrow}>ACCOUNT</Text><Text style={styles.headerTitle}>Your profile</Text></View>
            <View style={styles.memberPill}><Text style={styles.memberPillText}>MEMBER SINCE {joined.toUpperCase()}</Text></View>
          </View>
          <View style={styles.identityRow}>
            <View style={styles.avatarWrap}>
              {profile?.profileImage ? <Image source={{ uri: profile.profileImage }} style={styles.avatarImage} contentFit="cover"/> : <Text style={styles.avatarInitial}>{initial}</Text>}
              <TouchableOpacity accessibilityLabel="Choose profile photo" style={styles.cameraBadge} onPress={openPhotoPicker} activeOpacity={0.8}><Text style={styles.cameraIcon}>✎</Text></TouchableOpacity>
            </View>
            <View style={styles.identityCopy}>
              <Text style={styles.name}>{profile?.displayName || profile?.username || 'Your name'}</Text>
              <Text style={styles.handle}>{profile?.username ? `@${profile.username}` : 'Set a username'}</Text>
              {!!profile?.pronouns && <Text style={styles.pronouns}>{profile.pronouns}</Text>}
            </View>
            <View style={styles.avatarCount}><Text style={styles.avatarCountValue}>{profile?.avatarCount || 0}</Text><Text style={styles.avatarCountLabel}>CREATIONS</Text></View>
          </View>
          <TouchableOpacity style={styles.photoAction} onPress={openPhotoPicker} activeOpacity={0.8}><Text style={styles.photoActionText}>Change profile photo</Text></TouchableOpacity>
        </LinearGradient>

        <View style={styles.sectionHeading}><Text style={[styles.sectionTitle, { color: colors.text }]}>Profile details</Text><Text style={[styles.sectionHint, { color: colors.muted }]}>The basics people see about you</Text></View>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Field label="DISPLAY NAME" value={displayName} onChangeText={setDisplayName} editable={editing} placeholder="How should we call you?" colors={colors}/>
          <View style={[styles.divider, { backgroundColor: colors.border }]}/>
          <Field label="USERNAME" value={username} onChangeText={setUsername} editable={editing} placeholder="Choose a username" colors={colors} autoCapitalize="none" maxLength={30}/>
          <View style={[styles.divider, { backgroundColor: colors.border }]}/>
          <Field label="PRONOUNS" value={pronouns} onChangeText={setPronouns} editable={editing} placeholder="e.g. they / them" colors={colors} maxLength={32}/>
          <View style={[styles.divider, { backgroundColor: colors.border }]}/>
          <Text style={[styles.fieldLabel, { color: colors.muted }]}>ABOUT</Text>
          <TextInput style={[styles.bioInput, { backgroundColor: editing ? colors.elevated : 'transparent', color: colors.text, borderColor: colors.border }]} value={bio} onChangeText={setBio} editable={editing} placeholder="A little about you and your creative style" placeholderTextColor={colors.muted} multiline maxLength={160}/>
          <View style={styles.formFooter}>
            {editing ? <><Text style={[styles.charCount, { color: colors.muted }]}>{bio.length}/160</Text><View style={styles.formActions}><TouchableOpacity onPress={cancelProfileEdit} style={[styles.secondaryButton, { borderColor: colors.border }]}><Text style={[styles.secondaryButtonText, { color: colors.text }]}>Cancel</Text></TouchableOpacity><TouchableOpacity disabled={saving} onPress={handleSaveProfile} style={[styles.primaryButton, { backgroundColor: colors.accent }]}><Text style={styles.primaryButtonText}>{saving ? 'Saving…' : 'Save changes'}</Text></TouchableOpacity></View></> : <TouchableOpacity onPress={() => setEditing(true)} style={[styles.primaryButton, { backgroundColor: colors.accent }]}><Text style={styles.primaryButtonText}>Edit profile</Text></TouchableOpacity>}
          </View>
        </View>

        <View style={styles.sectionHeading}><Text style={[styles.sectionTitle, { color: colors.text }]}>Account & settings</Text><Text style={[styles.sectionHint, { color: colors.muted }]}>Manage access and app preferences</Text></View>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SettingRow icon="✉" title="Email address" detail={profile?.email || '—'} colors={colors}/>
          <View style={[styles.divider, { backgroundColor: colors.border }]}/>
          <TouchableOpacity onPress={() => setPasswordModalOpen(true)} activeOpacity={0.75}>
            <SettingRow icon="⌑" title="Password & security" detail="Change your password" trailing="›" colors={colors}/>
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: colors.border }]}/>
          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: colors.elevated }]}><Text style={[styles.settingIconText, { color: colors.accent }]}>◐</Text></View>
            <View style={styles.settingCopy}><Text style={[styles.settingTitle, { color: colors.text }]}>Appearance</Text><Text style={[styles.settingDetail, { color: colors.muted }]}>{mode === 'dark' ? 'Dark theme' : 'Light theme'}</Text></View>
            <Switch value={mode === 'dark'} onValueChange={toggle} trackColor={{ false: '#C8D0DA', true: colors.accent }} thumbColor="#FFFFFF" accessibilityLabel="Toggle dark mode"/>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]}/>
          <SettingRow icon="◈" title="Membership" detail={`Joined ${joined}`} colors={colors}/>
        </View>

        {profile?.profileImage ? <TouchableOpacity onPress={removePhoto} style={styles.removePhoto}><Text style={{ color: colors.muted, fontSize: 13, fontWeight: '600' }}>Remove profile photo</Text></TouchableOpacity> : null}
        <TouchableOpacity style={[styles.signOut, { borderColor: colors.danger }]} onPress={handleLogout} activeOpacity={0.85}><Text style={[styles.signOutText, { color: colors.danger }]}>Sign out</Text></TouchableOpacity>
      </ScrollView>

      <Modal visible={passwordModalOpen} transparent animationType="fade" onRequestClose={closePasswordModal}>
        <View style={styles.scrim}><View style={[styles.passwordSheet, { backgroundColor: colors.surface }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Change password</Text><Text style={[styles.modalSubtitle, { color: colors.muted, marginBottom: 18 }]}>Choose a new password with at least 10 characters.</Text>
          <PasswordField label="CURRENT PASSWORD" value={currentPassword} onChangeText={setCurrentPassword} colors={colors}/>
          <PasswordField label="NEW PASSWORD" value={newPassword} onChangeText={setNewPassword} colors={colors}/>
          <PasswordField label="CONFIRM NEW PASSWORD" value={confirmPassword} onChangeText={setConfirmPassword} colors={colors}/>
          <View style={styles.formActions}><TouchableOpacity onPress={closePasswordModal} style={[styles.secondaryButton, { borderColor: colors.border }]}><Text style={[styles.secondaryButtonText, { color: colors.text }]}>Cancel</Text></TouchableOpacity><TouchableOpacity onPress={submitPasswordChange} disabled={savingPassword} style={[styles.primaryButton, { backgroundColor: colors.accent }]}><Text style={styles.primaryButtonText}>{savingPassword ? 'Updating…' : 'Update password'}</Text></TouchableOpacity></View>
        </View></View>
      </Modal>
    </>
  );
}

function Field({ label, value, onChangeText, editable, placeholder, colors, autoCapitalize, maxLength }: {
  label: string; value: string; onChangeText: (value: string) => void; editable: boolean; placeholder: string;
  colors: ReturnType<typeof useAppearance>['colors']; autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'; maxLength?: number;
}) {
  return <View style={styles.field}><Text style={[styles.fieldLabel, { color: colors.muted }]}>{label}</Text><TextInput style={[styles.textInput, { backgroundColor: editable ? colors.elevated : 'transparent', color: colors.text, borderColor: colors.border }]} value={value} onChangeText={onChangeText} editable={editable} placeholder={placeholder} placeholderTextColor={colors.muted} autoCapitalize={autoCapitalize} maxLength={maxLength}/></View>;
}

function PasswordField({ label, value, onChangeText, colors }: { label: string; value: string; onChangeText: (value: string) => void; colors: ReturnType<typeof useAppearance>['colors'] }) {
  return <View style={styles.field}><Text style={[styles.fieldLabel, { color: colors.muted }]}>{label}</Text><TextInput style={[styles.textInput, { backgroundColor: colors.elevated, color: colors.text, borderColor: colors.border }]} value={value} onChangeText={onChangeText} placeholder="Enter password" placeholderTextColor={colors.muted} secureTextEntry autoCapitalize="none" autoCorrect={false}/></View>;
}

function SettingRow({ icon, title, detail, trailing, colors }: { icon: string; title: string; detail: string; trailing?: string; colors: ReturnType<typeof useAppearance>['colors'] }) {
  return <View style={styles.settingRow}><View style={[styles.settingIcon, { backgroundColor: colors.elevated }]}><Text style={[styles.settingIconText, { color: colors.accent }]}>{icon}</Text></View><View style={styles.settingCopy}><Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text><Text style={[styles.settingDetail, { color: colors.muted }]} numberOfLines={1}>{detail}</Text></View>{trailing ? <Text style={[styles.settingTrailing, { color: colors.muted }]}>{trailing}</Text> : null}</View>;
}

const styles = StyleSheet.create({
  page: { paddingBottom: 124 },
  center: { flex: 1, minHeight: 180, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 24, paddingTop: 58, paddingBottom: 23, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerEyebrow: { color: '#AFC1F6', fontSize: 9, fontWeight: '800', letterSpacing: 2 },
  headerTitle: { color: '#FFFFFF', fontSize: 27, fontWeight: '800', marginTop: 4 },
  memberPill: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,.16)', marginTop: 5 },
  memberPillText: { color: 'rgba(255,255,255,.8)', fontSize: 8, fontWeight: '800', letterSpacing: 0.6 },
  identityRow: { flexDirection: 'row', alignItems: 'center', marginTop: 26, gap: 14 },
  avatarWrap: { width: 76, height: 76, borderRadius: 25, backgroundColor: 'rgba(255,255,255,.18)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,.38)', alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: 72, height: 72, borderRadius: 23 },
  avatarInitial: { color: '#FFFFFF', fontSize: 31, fontWeight: '800' },
  cameraBadge: { position: 'absolute', right: -5, bottom: -5, width: 27, height: 27, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#61DFC6', borderWidth: 2, borderColor: '#203963' },
  cameraIcon: { color: '#142747', fontSize: 13, fontWeight: '900' },
  identityCopy: { flex: 1 },
  name: { color: '#FFFFFF', fontSize: 19, fontWeight: '800' },
  handle: { color: 'rgba(255,255,255,.7)', fontSize: 13, marginTop: 4 },
  pronouns: { color: '#B9C9F5', fontSize: 11, marginTop: 5 },
  avatarCount: { alignItems: 'flex-end' },
  avatarCountValue: { color: '#FFFFFF', fontSize: 23, fontWeight: '900' },
  avatarCountLabel: { color: 'rgba(255,255,255,.58)', fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  photoAction: { alignSelf: 'flex-start', marginLeft: 90, marginTop: 8, paddingVertical: 6 },
  photoActionText: { color: '#C6D4FF', fontSize: 11, fontWeight: '700' },
  sectionHeading: { marginHorizontal: 22, marginTop: 25, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  sectionHint: { fontSize: 11, marginTop: 3 },
  card: { marginHorizontal: 18, paddingHorizontal: 17, paddingVertical: 6, borderWidth: 1, borderRadius: 21 },
  field: { paddingVertical: 11 },
  fieldLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1.3, marginBottom: 7 },
  textInput: { minHeight: 42, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderRadius: 11, fontSize: 14 },
  bioInput: { minHeight: 82, paddingHorizontal: 12, paddingVertical: 11, borderWidth: 1, borderRadius: 12, fontSize: 14, textAlignVertical: 'top' },
  divider: { height: 1 },
  formFooter: { paddingTop: 12, paddingBottom: 12 },
  charCount: { fontSize: 10, textAlign: 'right', marginBottom: 8 },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 9, marginTop: 10 },
  primaryButton: { minHeight: 42, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  secondaryButton: { minHeight: 42, paddingHorizontal: 16, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  secondaryButtonText: { fontSize: 12, fontWeight: '700' },
  settingRow: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  settingIconText: { fontSize: 16, fontWeight: '800' },
  settingCopy: { flex: 1 },
  settingTitle: { fontSize: 13, fontWeight: '700' },
  settingDetail: { fontSize: 10, marginTop: 3 },
  settingTrailing: { fontSize: 22 },
  removePhoto: { alignSelf: 'center', paddingVertical: 17 },
  signOut: { marginHorizontal: 18, marginTop: 5, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderRadius: 14 },
  signOutText: { fontSize: 13, fontWeight: '800' },
  modalPage: { flex: 1, paddingTop: 24 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  modalTitle: { fontSize: 21, fontWeight: '800' },
  modalSubtitle: { fontSize: 11, marginTop: 4 },
  modalClose: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  photoTile: { flex: 1, aspectRatio: 1, padding: 3 },
  photoThumbnail: { width: '100%', height: '100%', borderRadius: 9, backgroundColor: '#DCE1E7' },
  emptyPhotos: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 36 },
  emptyPhotosTitle: { fontSize: 17, fontWeight: '800' },
  emptyPhotosText: { fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 7 },
  scrim: { flex: 1, backgroundColor: 'rgba(5,12,22,.62)', justifyContent: 'center', padding: 18 },
  passwordSheet: { borderRadius: 22, padding: 20 },
});

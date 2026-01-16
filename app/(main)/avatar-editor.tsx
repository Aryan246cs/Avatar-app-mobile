import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

type AvatarPart = {
  id: string;
  name: string;
  icon: string;
};

const avatarParts: AvatarPart[] = [
  { id: 'skin', name: 'Skin', icon: 'paintpalette.fill' },
  { id: 'hair', name: 'Hair', icon: 'scissors' },
  { id: 'eyes', name: 'Eyes', icon: 'eye.fill' },
  { id: 'clothes', name: 'Clothes', icon: 'tshirt.fill' },
  { id: 'accessories', name: 'Accessories', icon: 'eyeglasses' },
];

export default function AvatarEditorScreen() {
  const [selectedPart, setSelectedPart] = useState<string>('skin');
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="title">Avatar Editor</ThemedText>
          <ThemedText style={styles.subtitle}>Customize your digital identity</ThemedText>
        </View>

        {/* Avatar Preview Area */}
        <View style={[styles.previewContainer, { 
          backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f8f9fa',
          borderColor: colorScheme === 'dark' ? '#333' : '#e0e0e0'
        }]}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.tint }]}>
            <IconSymbol name="person.fill" size={80} color="#fff" />
          </View>
          <ThemedText style={styles.previewText}>Avatar Preview</ThemedText>
          <ThemedText style={styles.previewSubtext}>3D view coming soon</ThemedText>
        </View>

        {/* Part Selection */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Select Part</ThemedText>
          <View style={styles.partsGrid}>
            {avatarParts.map((part) => (
              <TouchableOpacity
                key={part.id}
                style={[
                  styles.partButton,
                  { 
                    backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
                    borderColor: selectedPart === part.id ? colors.tint : (colorScheme === 'dark' ? '#333' : '#e0e0e0')
                  },
                  selectedPart === part.id && styles.partButtonActive
                ]}
                onPress={() => setSelectedPart(part.id)}
              >
                <IconSymbol 
                  name={part.icon as any} 
                  size={28} 
                  color={selectedPart === part.id ? colors.tint : colors.icon} 
                />
                <ThemedText style={[
                  styles.partButtonText,
                  selectedPart === part.id && { color: colors.tint }
                ]}>
                  {part.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Customization Options */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Customize {avatarParts.find(p => p.id === selectedPart)?.name}
          </ThemedText>
          <View style={[styles.optionsContainer, { 
            backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f8f9fa' 
          }]}>
            <ThemedText style={styles.placeholderText}>
              Customization options will appear here
            </ThemedText>
            <ThemedText style={styles.placeholderSubtext}>
              Select colors, styles, and more
            </ThemedText>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.actionButtonSecondary, { 
              borderColor: colors.tint,
              backgroundColor: 'transparent'
            }]}
          >
            <ThemedText style={[styles.actionButtonText, { color: colors.tint }]}>
              Reset
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { 
              backgroundColor: colors.tint 
            }]}
          >
            <ThemedText style={[
              styles.actionButtonText, 
              { color: colorScheme === 'dark' ? '#000' : '#fff' }
            ]}>
              Save Avatar
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 4,
  },
  previewContainer: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 2,
  },
  avatarPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  previewSubtext: {
    fontSize: 14,
    opacity: 0.6,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  partsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  partButton: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    gap: 8,
  },
  partButtonActive: {
    borderWidth: 3,
  },
  partButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  optionsContainer: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    minHeight: 150,
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 4,
  },
  placeholderSubtext: {
    fontSize: 14,
    opacity: 0.5,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonSecondary: {
    borderWidth: 2,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

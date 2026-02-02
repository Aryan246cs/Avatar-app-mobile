import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Constants from 'expo-constants';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

// Smart URL detection - automatically uses the right IP
const getAvatarViewerUrl = () => {
  if (!__DEV__) {
    return 'https://your-actual-vercel-url.vercel.app';
  }
  
  // Get the current Expo dev server IP
  const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];
  
  if (debuggerHost) {
    return `http://${debuggerHost}:5173`;
  }
  
  // Fallback to your current IP
  return 'http://10.7.27.142:5173';
};

type AvatarPart = {
  id: string;
  name: string;
  icon: string;
  messageType: 'SET_TOP' | 'SET_PANTS' | 'SET_SHOES';
};

type TextureOption = {
  id: string;
  name: string;
  value: string;
  color: string;
};

const avatarParts: AvatarPart[] = [
  { id: 'top', name: 'Top', icon: 'tshirt.fill', messageType: 'SET_TOP' },
  { id: 'pants', name: 'Pants', icon: 'tshirt.fill', messageType: 'SET_PANTS' },
  { id: 'shoes', name: 'Shoes', icon: 'circle.fill', messageType: 'SET_SHOES' },
];

const textureOptions: Record<string, TextureOption[]> = {
  top: [
    { id: 'top_default', name: 'Blue', value: 'top_default', color: '#4169e1' },
    { id: 'top_black', name: 'Black', value: 'top_black', color: '#000000' },
    { id: 'top_white', name: 'White', value: 'top_white', color: '#ffffff' },
  ],
  pants: [
    { id: 'pants_default', name: 'Gray', value: 'pants_default', color: '#2e2e2e' },
    { id: 'pants_blue', name: 'Navy', value: 'pants_blue', color: '#000080' },
    { id: 'pants_brown', name: 'Brown', value: 'pants_brown', color: '#8b4513' },
  ],
  shoes: [
    { id: 'shoes_default', name: 'Brown', value: 'shoes_default', color: '#654321' },
    { id: 'shoes_black', name: 'Black', value: 'shoes_black', color: '#000000' },
    { id: 'shoes_white', name: 'White', value: 'shoes_white', color: '#ffffff' },
  ],
};

export default function AvatarEditorScreen() {
  const [selectedPart, setSelectedPart] = useState<string>('top');
  const [selectedTextures, setSelectedTextures] = useState({
    top: 'top_default',
    pants: 'pants_default',
    shoes: 'shoes_default',
  });
  
  const webViewRef = useRef<WebView>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Get the dynamic URL
  const avatarViewerUrl = getAvatarViewerUrl();
  
  useEffect(() => {
    console.log('🌐 Avatar Viewer URL:', avatarViewerUrl);
  }, [avatarViewerUrl]);

  const sendMessageToWebView = (type: string, value: string) => {
    const message = JSON.stringify({ type, value });
    webViewRef.current?.postMessage(message);
  };

  const handleTextureSelect = (textureValue: string) => {
    const part = avatarParts.find(p => p.id === selectedPart);
    if (part) {
      setSelectedTextures(prev => ({
        ...prev,
        [selectedPart]: textureValue
      }));
      sendMessageToWebView(part.messageType, textureValue);
    }
  };

  const currentOptions = textureOptions[selectedPart] || [];

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="title">Avatar Editor</ThemedText>
          <ThemedText style={styles.subtitle}>Customize your 3D avatar</ThemedText>
        </View>

        {/* 3D Avatar Preview */}
        <View style={styles.previewContainer}>
          {__DEV__ ? (
            <WebView
              ref={webViewRef}
              source={{ uri: avatarViewerUrl }}
              style={styles.webView}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.loadingContainer}>
                  <ThemedText>Loading 3D Avatar...</ThemedText>
                </View>
              )}
              onError={(error) => {
                console.error('WebView error:', error);
                console.error('Trying to load:', avatarViewerUrl);
              }}
              onHttpError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.error('HTTP Error:', nativeEvent.statusCode, nativeEvent.url);
              }}
              onLoadStart={() => {
                console.log('WebView started loading:', avatarViewerUrl);
              }}
              onLoadEnd={() => {
                console.log('WebView finished loading');
              }}
            />
          ) : (
            <View style={[styles.webView, styles.placeholderContainer]}>
              <IconSymbol name="person.fill" size={80} color={colors.tint} />
              <ThemedText style={styles.placeholderText}>3D Avatar Preview</ThemedText>
              <ThemedText style={styles.placeholderSubtext}>
                Deploy web viewer to see 3D avatar
              </ThemedText>
            </View>
          )}
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

        {/* Texture Options */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Choose {avatarParts.find(p => p.id === selectedPart)?.name} Style
          </ThemedText>
          <View style={styles.textureGrid}>
            {currentOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.textureButton,
                  { 
                    backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
                    borderColor: selectedTextures[selectedPart as keyof typeof selectedTextures] === option.value 
                      ? colors.tint 
                      : (colorScheme === 'dark' ? '#333' : '#e0e0e0')
                  },
                  selectedTextures[selectedPart as keyof typeof selectedTextures] === option.value && styles.textureButtonActive
                ]}
                onPress={() => handleTextureSelect(option.value)}
              >
                <View style={[styles.colorPreview, { backgroundColor: option.color }]} />
                <ThemedText style={[
                  styles.textureButtonText,
                  selectedTextures[selectedPart as keyof typeof selectedTextures] === option.value && { color: colors.tint }
                ]}>
                  {option.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.actionButtonSecondary, { 
              borderColor: colors.tint,
              backgroundColor: 'transparent'
            }]}
            onPress={() => {
              // Reset to defaults
              setSelectedTextures({
                top: 'top_default',
                pants: 'pants_default',
                shoes: 'shoes_default',
              });
              sendMessageToWebView('SET_TOP', 'top_default');
              sendMessageToWebView('SET_PANTS', 'pants_default');
              sendMessageToWebView('SET_SHOES', 'shoes_default');
            }}
          >
            <ThemedText style={[styles.actionButtonText, { color: colors.tint }]}>
              Reset
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { 
              backgroundColor: colors.tint 
            }]}
            onPress={() => {
              // Save avatar configuration
              console.log('Saving avatar:', selectedTextures);
              // TODO: Implement save functionality
            }}
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
    height: 300,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 32,
    backgroundColor: '#f0f0f0',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 4,
  },
  placeholderSubtext: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
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
    justifyContent: 'space-between',
    gap: 12,
  },
  partButton: {
    flex: 1,
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
  textureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  textureButton: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    gap: 8,
    padding: 12,
  },
  textureButtonActive: {
    borderWidth: 3,
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  textureButtonText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
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
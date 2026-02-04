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
  
  // Try to get the debugger host from Expo
  const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];
  if (debuggerHost) {
    console.log('🌐 Using debugger host:', debuggerHost);
    return `http://${debuggerHost}:5173`;
  }
  
  // Fallback to the current network IP
  console.log('🌐 Using fallback IP: 192.168.100.88');
  return 'http://192.168.100.88:5173';
};

// Avatar configuration types
interface AvatarState {
  base: string;
  skin: string;
  top: string | null;
  topTexture: string;
  jacket: string | null;
  bottom: string;
  shoes: string;
}

type CategoryType = 'base' | 'skin' | 'top' | 'jacket' | 'bottom' | 'shoes';

interface CategoryConfig {
  id: CategoryType;
  name: string;
  icon: string;
  options: Array<{
    id: string | null;
    name: string;
    color?: string;
    premium?: boolean;
    colors?: Array<{
      id: string;
      name: string;
      color: string;
    }>;
  }>;
}

// Modern avatar categories configuration
const avatarCategories: CategoryConfig[] = [
  {
    id: 'base',
    name: 'Base',
    icon: 'person.fill',
    options: [
      { id: 'male_avg', name: 'Male - Average' },
      { id: 'male_tall', name: 'Male - Tall' },
      { id: 'female_avg', name: 'Female - Average' },
      { id: 'female_short', name: 'Female - Short' },
    ],
  },
  {
    id: 'skin',
    name: 'Skin',
    icon: 'paintpalette.fill',
    options: [
      { id: 'skin_light', name: 'Light', color: '#fdbcb4' },
      { id: 'skin_medium', name: 'Medium', color: '#e0ac69' },
      { id: 'skin_tan', name: 'Tan', color: '#c68642' },
      { id: 'skin_dark', name: 'Dark', color: '#8d5524' },
    ],
  },
  {
    id: 'top',
    name: 'Top',
    icon: 'tshirt.fill',
    options: [
      { 
        id: null, 
        name: 'None' 
      },
      { 
        id: 'basic_tee', 
        name: 'Basic Tee', 
        color: '#2563eb',
        colors: [
          { id: 'top_default', name: 'Blue', color: '#2563eb' },
          { id: 'top_black', name: 'Black', color: '#1f2937' },
          { id: 'top_white', name: 'White', color: '#f9fafb' },
          { id: 'top_red', name: 'Red', color: '#dc2626' },
          { id: 'top_green', name: 'Green', color: '#16a34a' },
        ]
      },
      { 
        id: 'hoodie', 
        name: 'Hoodie', 
        color: '#374151',
        colors: [
          { id: 'top_default', name: 'Blue', color: '#2563eb' },
          { id: 'top_black', name: 'Black', color: '#1f2937' },
          { id: 'top_white', name: 'White', color: '#f9fafb' },
          { id: 'top_red', name: 'Red', color: '#dc2626' },
        ]
      },
      { 
        id: 'tank_top', 
        name: 'Tank Top', 
        color: '#f9fafb',
        colors: [
          { id: 'top_white', name: 'White', color: '#f9fafb' },
          { id: 'top_black', name: 'Black', color: '#1f2937' },
          { id: 'top_default', name: 'Blue', color: '#2563eb' },
        ]
      },
      { 
        id: 'crop_top', 
        name: 'Crop Top', 
        color: '#dc2626', 
        premium: true,
        colors: [
          { id: 'top_red', name: 'Red', color: '#dc2626' },
          { id: 'top_black', name: 'Black', color: '#1f2937' },
          { id: 'top_white', name: 'White', color: '#f9fafb' },
        ]
      },
    ],
  },
  {
    id: 'jacket',
    name: 'Jacket',
    icon: 'square.fill',
    options: [
      { id: null, name: 'None' },
      { id: 'denim_jacket', name: 'Denim', color: '#1e40af' },
      { id: 'leather_jacket', name: 'Leather', color: '#111827', premium: true },
      { id: 'bomber_jacket', name: 'Bomber', color: '#16a34a' },
    ],
  },
  {
    id: 'bottom',
    name: 'Bottom',
    icon: 'rectangle.fill',
    options: [
      { 
        id: 'jeans', 
        name: 'Jeans', 
        color: '#1e40af',
        colors: [
          { id: 'pants_blue', name: 'Blue', color: '#1e40af' },
          { id: 'pants_black', name: 'Black', color: '#111827' },
          { id: 'pants_default', name: 'Gray', color: '#374151' },
        ]
      },
      { 
        id: 'shorts', 
        name: 'Shorts', 
        color: '#374151',
        colors: [
          { id: 'pants_default', name: 'Gray', color: '#374151' },
          { id: 'pants_black', name: 'Black', color: '#111827' },
          { id: 'pants_brown', name: 'Brown', color: '#92400e' },
        ]
      },
      { 
        id: 'skirt', 
        name: 'Skirt', 
        color: '#111827',
        colors: [
          { id: 'pants_black', name: 'Black', color: '#111827' },
          { id: 'pants_blue', name: 'Blue', color: '#1e40af' },
          { id: 'pants_brown', name: 'Brown', color: '#92400e' },
        ]
      },
      { 
        id: 'dress_pants', 
        name: 'Dress Pants', 
        color: '#111827', 
        premium: true,
        colors: [
          { id: 'pants_black', name: 'Black', color: '#111827' },
          { id: 'pants_default', name: 'Gray', color: '#374151' },
          { id: 'pants_brown', name: 'Brown', color: '#92400e' },
        ]
      },
    ],
  },
  {
    id: 'shoes',
    name: 'Shoes',
    icon: 'circle.fill',
    options: [
      { 
        id: 'sneakers', 
        name: 'Sneakers', 
        color: '#f3f4f6',
        colors: [
          { id: 'shoes_white', name: 'White', color: '#f3f4f6' },
          { id: 'shoes_black', name: 'Black', color: '#111827' },
          { id: 'shoes_default', name: 'Brown', color: '#92400e' },
        ]
      },
      { 
        id: 'boots', 
        name: 'Boots', 
        color: '#78350f',
        colors: [
          { id: 'shoes_brown', name: 'Brown', color: '#78350f' },
          { id: 'shoes_black', name: 'Black', color: '#111827' },
          { id: 'shoes_default', name: 'Tan', color: '#92400e' },
        ]
      },
      { 
        id: 'heels', 
        name: 'Heels', 
        color: '#111827',
        colors: [
          { id: 'shoes_black', name: 'Black', color: '#111827' },
          { id: 'shoes_brown', name: 'Brown', color: '#78350f' },
          { id: 'shoes_white', name: 'White', color: '#f3f4f6' },
        ]
      },
      { 
        id: 'sandals', 
        name: 'Sandals', 
        color: '#92400e',
        colors: [
          { id: 'shoes_default', name: 'Brown', color: '#92400e' },
          { id: 'shoes_black', name: 'Black', color: '#111827' },
          { id: 'shoes_white', name: 'White', color: '#f3f4f6' },
        ]
      },
    ],
  },
];

export default function AvatarEditorScreen() {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('top');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [avatarState, setAvatarState] = useState<AvatarState>({
    base: 'female_avg',
    skin: 'skin_medium',
    top: 'basic_tee',
    topTexture: 'top_default',
    jacket: null,
    bottom: 'jeans',
    shoes: 'sneakers',
  });
  
  const webViewRef = useRef<WebView>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const avatarViewerUrl = getAvatarViewerUrl();
  
  useEffect(() => {
    console.log('🌐 Avatar Viewer URL:', avatarViewerUrl);
  }, [avatarViewerUrl]);

  const sendMessageToWebView = (type: string, value: string) => {
    const message = JSON.stringify({ type, value });
    webViewRef.current?.postMessage(message);
  };

  const updateAvatarState = (updates: Partial<AvatarState>) => {
    setAvatarState(prev => ({ ...prev, ...updates }));
    
    // Send updates to WebView with proper texture mapping
    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'top' || key === 'topTexture') {
        const textureValue = key === 'topTexture' ? value : 'top_default';
        sendMessageToWebView('SET_TOP', textureValue as string);
      }
      if (key === 'bottom') {
        const textureMap: { [key: string]: string } = {
          'jeans': 'pants_blue',
          'shorts': 'pants_default',
          'skirt': 'pants_black',
          'dress_pants': 'pants_black'
        };
        sendMessageToWebView('SET_PANTS', textureMap[value || ''] || 'pants_default');
      }
      if (key === 'shoes') {
        const textureMap: { [key: string]: string } = {
          'sneakers': 'shoes_white',
          'boots': 'shoes_brown',
          'heels': 'shoes_black',
          'sandals': 'shoes_default'
        };
        sendMessageToWebView('SET_SHOES', textureMap[value || ''] || 'shoes_default');
      }
    });
  };

  const handleOptionSelect = (categoryId: CategoryType, optionId: string | null) => {
    console.log('🎯 Option selected:', categoryId, optionId);
    
    // Update the avatar state first
    const updates: Partial<AvatarState> = {};
    (updates as any)[categoryId] = optionId;
    updateAvatarState(updates);
    
    // Check if this option has colors
    const selectedOption = avatarCategories
      .find(cat => cat.id === categoryId)
      ?.options.find(opt => opt.id === optionId);
    
    console.log('🎨 Selected option:', selectedOption);
    console.log('🎨 Has colors:', selectedOption?.colors?.length || 0);
    
    if (selectedOption?.colors && selectedOption.colors.length > 0) {
      console.log('✅ Showing color picker for:', optionId);
      setSelectedItem(optionId);
      setShowColorPicker(true);
    } else {
      console.log('❌ No colors available, hiding color picker');
      setShowColorPicker(false);
      setSelectedItem(null);
    }
  };

  const handleColorSelect = (colorId: string) => {
    console.log('🎨 Color selected:', colorId, 'for category:', activeCategory);
    
    if (activeCategory === 'top') {
      updateAvatarState({ topTexture: colorId });
    } else if (activeCategory === 'bottom') {
      // For bottom, we need to map the color to the texture
      updateAvatarState({ bottom: avatarState.bottom }); // Keep the same item, just change color
      sendMessageToWebView('SET_PANTS', colorId);
    } else if (activeCategory === 'shoes') {
      // For shoes, we need to map the color to the texture  
      updateAvatarState({ shoes: avatarState.shoes }); // Keep the same item, just change color
      sendMessageToWebView('SET_SHOES', colorId);
    }
  };

  const resetAvatar = () => {
    const defaultState: AvatarState = {
      base: 'female_avg',
      skin: 'skin_medium',
      top: 'basic_tee',
      topTexture: 'top_default',
      jacket: null,
      bottom: 'jeans',
      shoes: 'sneakers',
    };
    setAvatarState(defaultState);
    setShowColorPicker(false);
    setSelectedItem(null);
    sendMessageToWebView('SET_TOP', 'top_default');
    sendMessageToWebView('SET_PANTS', 'pants_blue');
    sendMessageToWebView('SET_SHOES', 'shoes_white');
  };

  const saveAvatar = () => {
    console.log('💾 Saving avatar:', avatarState);
    // Future: Save to backend
  };

  const currentCategory = avatarCategories.find(cat => cat.id === activeCategory);
  const currentValue = avatarState[activeCategory] as string | null;

  console.log('🎮 Current state:', {
    activeCategory,
    currentValue,
    selectedItem,
    showColorPicker,
    avatarState
  });

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { 
        backgroundColor: colors.background,
        borderBottomColor: colorScheme === 'dark' ? '#333' : '#e0e0e0'
      }]}>
        <View>
          <ThemedText type="title" style={styles.title}>Avatar Editor</ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.icon }]}>Create your digital identity</ThemedText>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.headerButton, { 
              borderColor: colors.tint,
              backgroundColor: 'transparent'
            }]}
            onPress={resetAvatar}
          >
            <ThemedText style={[styles.headerButtonText, { color: colors.tint }]}>
              Reset
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.headerButton, { 
              backgroundColor: colors.tint,
              borderColor: colors.tint
            }]}
            onPress={saveAvatar}
          >
            <ThemedText style={[styles.headerButtonText, { 
              color: colorScheme === 'dark' ? '#000' : '#fff'
            }]}>
              Save
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
        {/* 3D Avatar Preview */}
        <View style={styles.avatarPreview}>
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
                  <IconSymbol name="hourglass" size={40} color={colors.icon} />
                  <ThemedText style={styles.loadingText}>Loading 3D Avatar...</ThemedText>
                  <ThemedText style={[styles.loadingText, { fontSize: 12, marginTop: 8 }]}>
                    URL: {avatarViewerUrl}
                  </ThemedText>
                </View>
              )}
              renderError={(errorName) => (
                <View style={styles.loadingContainer}>
                  <IconSymbol name="exclamationmark.triangle" size={40} color="#ff6b6b" />
                  <ThemedText style={[styles.loadingText, { color: '#ff6b6b' }]}>
                    WebView Error: {errorName}
                  </ThemedText>
                  <ThemedText style={[styles.loadingText, { fontSize: 12, marginTop: 8 }]}>
                    URL: {avatarViewerUrl}
                  </ThemedText>
                </View>
              )}
              onError={(error) => {
                console.error('❌ WebView error:', error);
              }}
              onHttpError={(syntheticEvent) => {
                console.error('❌ WebView HTTP error:', syntheticEvent.nativeEvent);
              }}
              onLoadStart={() => {
                console.log('🌐 WebView started loading:', avatarViewerUrl);
              }}
              onLoadEnd={() => {
                console.log('✅ WebView finished loading');
                setTimeout(() => {
                  sendMessageToWebView('SET_TOP', 'top_default');
                  sendMessageToWebView('SET_PANTS', 'pants_blue');
                  sendMessageToWebView('SET_SHOES', 'shoes_white');
                }, 1000);
              }}
              onMessage={(event) => {
                console.log('📨 Message from WebView:', event.nativeEvent.data);
              }}
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <IconSymbol name="person.fill" size={80} color={colors.tint} />
              <ThemedText style={styles.placeholderText}>3D Avatar Preview</ThemedText>
              <ThemedText style={styles.placeholderSubtext}>
                Deploy web viewer to see 3D avatar
              </ThemedText>
            </View>
          )}
        </View>

        {/* Categories */}
        <View style={[styles.categoriesSection, { 
          backgroundColor: colors.background,
          borderTopColor: colorScheme === 'dark' ? '#333' : '#e0e0e0',
          borderBottomColor: colorScheme === 'dark' ? '#333' : '#e0e0e0'
        }]}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {avatarCategories.map((category) => {
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    { 
                      backgroundColor: activeCategory === category.id 
                        ? (colorScheme === 'dark' ? '#ffffff' : colors.tint)
                        : 'transparent',
                      borderColor: activeCategory === category.id 
                        ? (colorScheme === 'dark' ? '#ffffff' : colors.tint)
                        : (colorScheme === 'dark' ? '#333' : '#e0e0e0')
                    }
                  ]}
                  onPress={() => setActiveCategory(category.id)}
                >
                  <IconSymbol 
                    name={category.icon as any} 
                    size={20} 
                    color={activeCategory === category.id 
                      ? (colorScheme === 'dark' ? '#000000' : '#ffffff')
                      : colors.icon
                    } 
                  />
                  <ThemedText 
                    style={styles.categoryButtonText}
                    lightColor={activeCategory === category.id ? '#ffffff' : colors.text}
                    darkColor={activeCategory === category.id ? '#000000' : colors.text}
                  >
                    {category.name}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Options Grid */}
        <View style={[styles.optionsSection, { backgroundColor: colors.background }]}>
          <View style={styles.optionsHeader}>
            <ThemedText type="subtitle" style={[styles.sectionTitle, { color: colors.text }]}>
              {showColorPicker ? `${currentCategory?.name} Colors` : currentCategory?.name}
            </ThemedText>
            <ThemedText style={[styles.sectionSubtitle, { color: colors.icon }]}>
              {showColorPicker ? 'Choose a color' : 'Choose your style'}
            </ThemedText>
            {showColorPicker && (
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => {
                  setShowColorPicker(false);
                  setSelectedItem(null);
                }}
              >
                <IconSymbol name="chevron.left" size={16} color={colors.tint} />
                <ThemedText style={[styles.backButtonText, { color: colors.tint }]}>
                  Back to items
                </ThemedText>
              </TouchableOpacity>
            )}
            
            {/* Debug info */}
            <ThemedText style={{ fontSize: 10, color: colors.icon, marginTop: 8 }}>
              Debug: showColorPicker={showColorPicker ? 'true' : 'false'}, selectedItem={selectedItem || 'null'}
            </ThemedText>
          </View>
          
          <View style={styles.optionsGrid}>
            {showColorPicker ? (
              // Show color options for selected item
              (() => {
                console.log('🎨 Rendering color picker...');
                const selectedOption = currentCategory?.options.find(opt => opt.id === selectedItem);
                console.log('🎨 Found option:', selectedOption?.name, 'with', selectedOption?.colors?.length, 'colors');
                
                if (!selectedOption?.colors) {
                  return [
                    <ThemedText key="no-colors" style={{ color: colors.text, textAlign: 'center', width: '100%' }}>
                      No colors available
                    </ThemedText>
                  ];
                }
                
                return selectedOption.colors.map((colorOption) => {
                  const isSelected = activeCategory === 'top' && avatarState.topTexture === colorOption.id;
                  
                  return (
                    <TouchableOpacity
                      key={colorOption.id}
                      style={[
                        styles.optionCard,
                        { 
                          backgroundColor: colorScheme === 'dark' ? '#1f1f1f' : '#f8f9fa',
                          borderColor: isSelected ? colors.tint : (colorScheme === 'dark' ? '#333' : '#e0e0e0')
                        }
                      ]}
                      onPress={() => handleColorSelect(colorOption.id)}
                    >
                      <View style={[
                        styles.optionPreview,
                        { backgroundColor: colorOption.color }
                      ]}>
                        {isSelected && (
                          <View style={[styles.selectedBadge, { backgroundColor: colors.tint }]}>
                            <IconSymbol name="checkmark" size={12} color="#fff" />
                          </View>
                        )}
                      </View>
                      <ThemedText style={[
                        styles.optionName,
                        { 
                          color: isSelected ? colors.tint : colors.text,
                          fontWeight: isSelected ? '600' : '500'
                        }
                      ]}>
                        {colorOption.name}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                });
              })()
            ) : (
              // Show clothing/accessory options
              currentCategory?.options.map((option) => {
                return (
                  <TouchableOpacity
                    key={option.id || 'none'}
                    style={[
                      styles.optionCard,
                      { 
                        backgroundColor: colorScheme === 'dark' ? '#1f1f1f' : '#f8f9fa',
                        borderColor: currentValue === option.id ? colors.tint : (colorScheme === 'dark' ? '#333' : '#e0e0e0')
                      }
                    ]}
                    onPress={() => handleOptionSelect(activeCategory, option.id)}
                  >
                    <View style={[
                      styles.optionPreview,
                      { backgroundColor: option.color || (colorScheme === 'dark' ? '#333' : '#e0e0e0') }
                    ]}>
                      {option.premium && (
                        <View style={styles.premiumBadge}>
                          <ThemedText style={styles.premiumText}>✨</ThemedText>
                        </View>
                      )}
                      {currentValue === option.id && (
                        <View style={[styles.selectedBadge, { backgroundColor: colors.tint }]}>
                          <IconSymbol name="checkmark" size={12} color="#fff" />
                        </View>
                      )}
                      {option.colors && option.colors.length > 0 && (
                        <View style={styles.colorIndicator}>
                          <IconSymbol name="paintpalette.fill" size={10} color="#fff" />
                        </View>
                      )}
                    </View>
                    <ThemedText style={[
                      styles.optionName,
                      { 
                        color: currentValue === option.id ? colors.tint : colors.text,
                        fontWeight: currentValue === option.id ? '600' : '500'
                      }
                    ]}>
                      {option.name}
                    </ThemedText>
                  </TouchableOpacity>
                );
              }) || []
            )}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
  },
  avatarPreview: {
    height: 300,
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholderSubtext: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  categoriesSection: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    minWidth: 100,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  optionsSection: {
    padding: 20,
    paddingBottom: 100, // Extra padding for bottom navigation
  },
  optionsHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  optionCard: {
    width: '47%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 8,
  },
  optionPreview: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginBottom: 12,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#fbbf24',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumText: {
    fontSize: 10,
  },
  selectedBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionName: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  colorIndicator: {
    position: 'absolute',
    top: -6,
    left: -6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
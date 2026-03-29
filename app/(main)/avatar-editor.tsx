import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Constants from 'expo-constants';
import { useRef, useState } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const COLLAPSED_HEIGHT = 180;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.65;

// Smart URL detection - automatically uses the right IP
const getAvatarViewerUrl = () => {
  if (!__DEV__) {
    return 'https://your-actual-vercel-url.vercel.app';
  }
  
  // Try to get the debugger host from Expo
  const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];
  if (debuggerHost) {
    return `http://${debuggerHost}:5173`;
  }
  
  // Fallback to the current network IP
  return 'http://192.168.100.97:5173';
};

type BodyType = 'female' | 'female1' | 'female2' | 'female3' | 'male' | 'male1' | 'male2' | 'male3';

type BodyOption = {
  id: BodyType;
  name: string;
  gender: 'female' | 'male';
  size: 'slim' | 'average' | 'athletic' | 'heavy';
};

const bodyOptions: BodyOption[] = [
  { id: 'female', name: 'Female', gender: 'female', size: 'slim' },
  { id: 'female1', name: 'Female 1', gender: 'female', size: 'average' },
  { id: 'female2', name: 'Female 2', gender: 'female', size: 'athletic' },
  { id: 'female3', name: 'Female 3', gender: 'female', size: 'heavy' },
  { id: 'male', name: 'Male', gender: 'male', size: 'slim' },
  { id: 'male1', name: 'Male 1', gender: 'male', size: 'average' },
  { id: 'male2', name: 'Male 2', gender: 'male', size: 'athletic' },
  { id: 'male3', name: 'Male 3', gender: 'male', size: 'heavy' },
];

type AvatarPart = {
  id: string;
  name: string;
  icon: string;
  messageType: 'SET_TOP' | 'SET_PANTS' | 'SET_SHOES' | 'SET_EYES' | 'SET_HAIR';
};

type TextureOption = {
  id: string;
  name: string;
  value: string;
  color: string;
};

const avatarParts: AvatarPart[] = [
  { id: 'eyes', name: 'Eyes', icon: 'eye.fill', messageType: 'SET_EYES' },
  { id: 'hair', name: 'Hair', icon: 'person.fill', messageType: 'SET_HAIR' },
  { id: 'top', name: 'Top', icon: 'tshirt.fill', messageType: 'SET_TOP' },
  { id: 'pants', name: 'Pants', icon: 'tshirt.fill', messageType: 'SET_PANTS' },
  { id: 'shoes', name: 'Shoes', icon: 'circle.fill', messageType: 'SET_SHOES' },
];

const textureOptions: Record<string, TextureOption[]> = {
  eyes: [
    { id: 'eyes_default', name: 'Blue', value: 'eyes_default', color: '#1e3a8a' },
    { id: 'eyes_brown', name: 'Brown', value: 'eyes_brown', color: '#78350f' },
    { id: 'eyes_green', name: 'Green', value: 'eyes_green', color: '#15803d' },
    { id: 'eyes_gray', name: 'Gray', value: 'eyes_gray', color: '#6b7280' },
    { id: 'eyes_hazel', name: 'Hazel', value: 'eyes_hazel', color: '#92400e' },
  ],
  hair: [
    { id: 'hair_default', name: 'Dark', value: 'hair_default', color: '#1f2937' },
    { id: 'hair_black', name: 'Black', value: 'hair_black', color: '#000000' },
    { id: 'hair_brown', name: 'Brown', value: 'hair_brown', color: '#78350f' },
    { id: 'hair_blonde', name: 'Blonde', value: 'hair_blonde', color: '#fbbf24' },
    { id: 'hair_red', name: 'Red', value: 'hair_red', color: '#dc2626' },
    { id: 'hair_white', name: 'White', value: 'hair_white', color: '#f3f4f6' },
  ],
  top: [
    { id: 'top_default', name: 'Blue', value: 'top_default', color: '#4169e1' },
    { id: 'top_black', name: 'Black', value: 'top_black', color: '#000000' },
    { id: 'top_white', name: 'White', value: 'top_white', color: '#ffffff' },
    { id: 'top_red', name: 'Red', value: 'top_red', color: '#dc2626' },
    { id: 'top_green', name: 'Green', value: 'top_green', color: '#16a34a' },
  ],
  pants: [
    { id: 'pants_default', name: 'Gray', value: 'pants_default', color: '#2e2e2e' },
    { id: 'pants_blue', name: 'Navy', value: 'pants_blue', color: '#000080' },
    { id: 'pants_black', name: 'Black', value: 'pants_black', color: '#000000' },
    { id: 'pants_brown', name: 'Brown', value: 'pants_brown', color: '#8b4513' },
    { id: 'pants_gray', name: 'Gray', value: 'pants_gray', color: '#374151' },
  ],
  shoes: [
    { id: 'shoes_default', name: 'Brown', value: 'shoes_default', color: '#654321' },
    { id: 'shoes_black', name: 'Black', value: 'shoes_black', color: '#000000' },
    { id: 'shoes_white', name: 'White', value: 'shoes_white', color: '#ffffff' },
    { id: 'shoes_brown', name: 'Brown', value: 'shoes_brown', color: '#92400e' },
  ],
};

export default function AvatarEditorScreen() {
  const [selectedBody, setSelectedBody] = useState<BodyType>('female');
  const [selectedGender, setSelectedGender] = useState<'female' | 'male'>('female');
  const [selectedPart, setSelectedPart] = useState<string>('eyes');
  const [selectedAccessoryCategory, setSelectedAccessoryCategory] = useState<'jacket' | 'pants' | 'hair' | 'mask' | 'suit' | 'shoes'>('jacket');
  const [selectedTextures, setSelectedTextures] = useState({
    eyes: 'eyes_default',
    hair: 'hair_default',
    top: 'top_default',
    pants: 'pants_default',
    shoes: 'shoes_default',
  });
  const [accessories, setAccessories] = useState({
    jacket: null as number | null,
    pants: null as number | null,
    hair: null as number | null,
    mask: null as number | null,
    fullSuit: null as number | null,
    shoes: null as number | null,
  });
  const [isExpanded, setIsExpanded] = useState(false);
  
  const webViewRef = useRef<WebView>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const panelHeight = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;
  
  // Get the dynamic URL
  const avatarViewerUrl = getAvatarViewerUrl();

  const togglePanel = () => {
    const toValue = isExpanded ? COLLAPSED_HEIGHT : EXPANDED_HEIGHT;
    Animated.spring(panelHeight, {
      toValue,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
    setIsExpanded(!isExpanded);
  };

  const sendMessageToWebView = (type: string, value: string) => {
    const message = JSON.stringify({ type, value });
    webViewRef.current?.postMessage(message);
  };

  const handleBodySelect = (bodyType: BodyType) => {
    setSelectedBody(bodyType);
    sendMessageToWebView('SET_BODY', bodyType);
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

  const selectJacket = (selection: number | null) => {
    setAccessories(prev => ({
      ...prev,
      jacket: selection
    }));
    const message = JSON.stringify({ 
      type: 'SET_JACKET', 
      selection: selection
    });
    webViewRef.current?.postMessage(message);
    console.log('🧥 Jacket selection:', selection);
  };

  const selectPants = (selection: number | null) => {
    setAccessories(prev => ({
      ...prev,
      pants: selection
    }));
    const message = JSON.stringify({ 
      type: 'SET_PANTS_ACCESSORY', 
      selection: selection
    });
    webViewRef.current?.postMessage(message);
    console.log('👖 Pants selection:', selection);
  };

  const selectHair = (selection: number | null) => {
    setAccessories(prev => ({
      ...prev,
      hair: selection
    }));
    const message = JSON.stringify({ 
      type: 'SET_HAIR_ACCESSORY', 
      selection: selection
    });
    webViewRef.current?.postMessage(message);
    console.log('💇 Hair selection:', selection);
  };

  const selectMask = (selection: number | null) => {
    setAccessories(prev => ({
      ...prev,
      mask: selection
    }));
    const message = JSON.stringify({ 
      type: 'SET_MASK_ACCESSORY', 
      selection: selection
    });
    webViewRef.current?.postMessage(message);
    console.log('😷 Mask selection:', selection);
  };

  const selectFullSuit = (selection: number | null) => {
    setAccessories(prev => ({
      ...prev,
      fullSuit: selection
    }));
    const message = JSON.stringify({ 
      type: 'SET_FULL_SUIT', 
      selection: selection
    });
    webViewRef.current?.postMessage(message);
    console.log('👔 Full suit selection:', selection);
  };

  const selectShoes = (selection: number | null) => {
    setAccessories(prev => ({
      ...prev,
      shoes: selection
    }));
    const message = JSON.stringify({ 
      type: 'SET_SHOES_ACCESSORY', 
      selection: selection
    });
    webViewRef.current?.postMessage(message);
    console.log('👞 Shoes selection:', selection);
  };

  const currentOptions = textureOptions[selectedPart] || [];
  const filteredBodyOptions = bodyOptions.filter(b => b.gender === selectedGender);

  return (
    <ThemedView style={styles.container}>
      {/* Full Screen 3D Avatar Preview */}
      <View style={styles.avatarContainer}>
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
                <ThemedText>Loading Avatar...</ThemedText>
              </View>
            )}
            onError={(error) => {
              // Handle WebView error
            }}
          />
        ) : (
          <View style={[styles.webView, styles.placeholderContainer]}>
            <IconSymbol name="person.fill" size={120} color={colors.tint} />
            <ThemedText style={styles.placeholderText}>3D Avatar</ThemedText>
          </View>
        )}
      </View>

      {/* Bottom Control Panel */}
      <Animated.View 
        style={[
          styles.bottomPanel,
          { 
            height: panelHeight,
            backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
          }
        ]}
      >
        {/* Drag Handle */}
        <TouchableOpacity 
          style={styles.dragHandle}
          onPress={togglePanel}
          activeOpacity={0.7}
        >
          <View style={[styles.dragBar, { backgroundColor: colorScheme === 'dark' ? '#444' : '#ccc' }]} />
          <ThemedText style={styles.dragText}>
            {isExpanded ? 'Tap to collapse' : 'Tap to expand controls'}
          </ThemedText>
        </TouchableOpacity>

        <ScrollView 
          style={styles.panelScroll}
          contentContainerStyle={styles.panelContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Gender Selection */}
          <View style={styles.genderSection}>
            <View style={styles.genderToggle}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  { 
                    backgroundColor: selectedGender === 'male' 
                      ? colors.tint 
                      : (colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5'),
                    borderWidth: 2,
                    borderColor: selectedGender === 'male' 
                      ? colors.tint 
                      : (colorScheme === 'dark' ? '#444' : '#ddd')
                  }
                ]}
                onPress={() => {
                  setSelectedGender('male');
                  setSelectedBody('male');
                  handleBodySelect('male');
                }}
              >
                <ThemedText style={[
                  styles.genderText,
                  { 
                    color: selectedGender === 'male' 
                      ? '#fff'  // White text when selected
                      : colors.text  // Normal text color when not selected
                  }
                ]}>
                  ♂ Male
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  { 
                    backgroundColor: selectedGender === 'female' 
                      ? colors.tint 
                      : (colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5'),
                    borderWidth: 2,
                    borderColor: selectedGender === 'female' 
                      ? colors.tint 
                      : (colorScheme === 'dark' ? '#444' : '#ddd')
                  }
                ]}
                onPress={() => {
                  setSelectedGender('female');
                  setSelectedBody('female');
                  handleBodySelect('female');
                }}
              >
                <ThemedText style={[
                  styles.genderText,
                  { 
                    color: selectedGender === 'female' 
                      ? '#fff'  // White text when selected
                      : colors.text  // Normal text color when not selected
                  }
                ]}>
                  ♀ Female
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Body Type Selection with Icons */}
          <View style={styles.quickSection}>
            <ThemedText style={styles.sectionLabel}>Body Type</ThemedText>
            <View style={styles.bodyIconGrid}>
              {filteredBodyOptions.map((body) => (
                <TouchableOpacity
                  key={body.id}
                  style={[
                    styles.bodyIconButton,
                    { 
                      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                      borderColor: selectedBody === body.id ? colors.tint : 'transparent'
                    },
                    selectedBody === body.id && styles.selectedBodyIcon
                  ]}
                  onPress={() => handleBodySelect(body.id)}
                >
                  <IconSymbol 
                    name="person.fill" 
                    size={body.size === 'slim' ? 28 : body.size === 'average' ? 32 : body.size === 'athletic' ? 36 : 40} 
                    color={selectedBody === body.id ? colors.tint : colors.icon} 
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Part Selection Tabs */}
          <View style={styles.tabSection}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabScroll}
            >
              {avatarParts.map((part) => (
                <TouchableOpacity
                  key={part.id}
                  style={[
                    styles.tabButton,
                    { 
                      backgroundColor: selectedPart === part.id 
                        ? colors.tint 
                        : (colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5')
                    }
                  ]}
                  onPress={() => setSelectedPart(part.id)}
                >
                  <IconSymbol 
                    name={part.icon as any} 
                    size={20} 
                    color={selectedPart === part.id ? '#fff' : colors.icon} 
                  />
                  <ThemedText style={[
                    styles.tabText,
                    selectedPart === part.id && { color: '#fff', fontWeight: '700' }
                  ]}>
                    {part.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Color Options */}
          <View style={styles.colorSection}>
            <ThemedText style={styles.colorLabel}>
              Choose Color
            </ThemedText>
            <View style={styles.colorGrid}>
              {currentOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.colorButton,
                    { 
                      borderColor: selectedTextures[selectedPart as keyof typeof selectedTextures] === option.value 
                        ? colors.tint 
                        : 'transparent'
                    },
                    selectedTextures[selectedPart as keyof typeof selectedTextures] === option.value && styles.selectedColor
                  ]}
                  onPress={() => handleTextureSelect(option.value)}
                >
                  <View style={[styles.colorCircle, { backgroundColor: option.color }]} />
                  <ThemedText style={styles.colorName}>{option.name}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Accessories Section */}
          <View style={styles.accessoriesSection}>
            <ThemedText style={styles.sectionTitle}>
              Accessories
            </ThemedText>
            
            {/* Category Tabs */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryTabScroll}
            >
              <TouchableOpacity
                style={[
                  styles.categoryTab,
                  { 
                    backgroundColor: selectedAccessoryCategory === 'jacket' 
                      ? colors.tint 
                      : (colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5')
                  }
                ]}
                onPress={() => setSelectedAccessoryCategory('jacket')}
              >
                <ThemedText style={[
                  styles.categoryTabText,
                  selectedAccessoryCategory === 'jacket' && { color: '#fff', fontWeight: '700' }
                ]}>
                  🧥 Jacket
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.categoryTab,
                  { 
                    backgroundColor: selectedAccessoryCategory === 'pants' 
                      ? colors.tint 
                      : (colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5')
                  }
                ]}
                onPress={() => setSelectedAccessoryCategory('pants')}
              >
                <ThemedText style={[
                  styles.categoryTabText,
                  selectedAccessoryCategory === 'pants' && { color: '#fff', fontWeight: '700' }
                ]}>
                  👖 Pants
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.categoryTab,
                  { 
                    backgroundColor: selectedAccessoryCategory === 'hair' 
                      ? colors.tint 
                      : (colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5')
                  }
                ]}
                onPress={() => setSelectedAccessoryCategory('hair')}
              >
                <ThemedText style={[
                  styles.categoryTabText,
                  selectedAccessoryCategory === 'hair' && { color: '#fff', fontWeight: '700' }
                ]}>
                  💇 Hair
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.categoryTab,
                  { 
                    backgroundColor: selectedAccessoryCategory === 'mask' 
                      ? colors.tint 
                      : (colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5')
                  }
                ]}
                onPress={() => setSelectedAccessoryCategory('mask')}
              >
                <ThemedText style={[
                  styles.categoryTabText,
                  selectedAccessoryCategory === 'mask' && { color: '#fff', fontWeight: '700' }
                ]}>
                  😷 Mask
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.categoryTab,
                  { 
                    backgroundColor: selectedAccessoryCategory === 'suit' 
                      ? colors.tint 
                      : (colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5')
                  }
                ]}
                onPress={() => setSelectedAccessoryCategory('suit')}
              >
                <ThemedText style={[
                  styles.categoryTabText,
                  selectedAccessoryCategory === 'suit' && { color: '#fff', fontWeight: '700' }
                ]}>
                  👔 Suit
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.categoryTab,
                  { 
                    backgroundColor: selectedAccessoryCategory === 'shoes' 
                      ? colors.tint 
                      : (colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5')
                  }
                ]}
                onPress={() => setSelectedAccessoryCategory('shoes')}
              >
                <ThemedText style={[
                  styles.categoryTabText,
                  selectedAccessoryCategory === 'shoes' && { color: '#fff', fontWeight: '700' }
                ]}>
                  👞 Shoes
                </ThemedText>
              </TouchableOpacity>
            </ScrollView>
            
            {/* Jacket Selection */}
            {selectedAccessoryCategory === 'jacket' && (
            <View style={styles.selectableAccessory}>
              <View style={styles.selectableAccessoryHeader}>
                <ThemedText style={styles.selectableAccessoryTitle}>
                  🧥 Jacket
                </ThemedText>
                <ThemedText style={styles.selectableAccessoryHint}>
                  Choose a style
                </ThemedText>
              </View>
              <View style={styles.selectionButtonsRow}>
                <TouchableOpacity
                  style={[
                    styles.selectionButtonSmall,
                    { 
                      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                      borderColor: accessories.jacket === null ? colors.tint : (colorScheme === 'dark' ? '#444' : '#ddd')
                    },
                    accessories.jacket === null && styles.selectionButtonSmallActive
                  ]}
                  onPress={() => selectJacket(null)}
                >
                  <ThemedText style={[
                    styles.selectionButtonSmallText,
                    accessories.jacket === null && { color: colors.tint, fontWeight: '700' }
                  ]}>
                    OFF
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.selectionButtonSmall,
                    { 
                      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                      borderColor: accessories.jacket === 1 ? colors.tint : (colorScheme === 'dark' ? '#444' : '#ddd')
                    },
                    accessories.jacket === 1 && styles.selectionButtonSmallActive
                  ]}
                  onPress={() => selectJacket(1)}
                >
                  <ThemedText style={[
                    styles.selectionButtonSmallText,
                    accessories.jacket === 1 && { color: colors.tint, fontWeight: '700' }
                  ]}>
                    1
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.selectionButtonSmall,
                    { 
                      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                      borderColor: accessories.jacket === 2 ? colors.tint : (colorScheme === 'dark' ? '#444' : '#ddd')
                    },
                    accessories.jacket === 2 && styles.selectionButtonSmallActive
                  ]}
                  onPress={() => selectJacket(2)}
                >
                  <ThemedText style={[
                    styles.selectionButtonSmallText,
                    accessories.jacket === 2 && { color: colors.tint, fontWeight: '700' }
                  ]}>
                    2
                  </ThemedText>
                </TouchableOpacity>
                {selectedGender === 'female' && (
                  <TouchableOpacity
                    style={[
                      styles.selectionButtonSmall,
                      { 
                        backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                        borderColor: accessories.jacket === 3 ? colors.tint : (colorScheme === 'dark' ? '#444' : '#ddd')
                      },
                      accessories.jacket === 3 && styles.selectionButtonSmallActive
                    ]}
                    onPress={() => selectJacket(3)}
                  >
                    <ThemedText style={[
                      styles.selectionButtonSmallText,
                      accessories.jacket === 3 && { color: colors.tint, fontWeight: '700' }
                    ]}>
                      3
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            )}
            
            {/* Pants Selection */}
            {selectedAccessoryCategory === 'pants' && (
            <View style={styles.selectableAccessory}>
              <View style={styles.selectableAccessoryHeader}>
                <ThemedText style={styles.selectableAccessoryTitle}>
                  👖 Pants
                </ThemedText>
                <ThemedText style={styles.selectableAccessoryHint}>
                  Choose a style
                </ThemedText>
              </View>
              <View style={styles.selectionButtonsRow}>
                <TouchableOpacity
                  style={[
                    styles.selectionButtonSmall,
                    { 
                      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                      borderColor: accessories.pants === null ? colors.tint : (colorScheme === 'dark' ? '#444' : '#ddd')
                    },
                    accessories.pants === null && styles.selectionButtonSmallActive
                  ]}
                  onPress={() => selectPants(null)}
                >
                  <ThemedText style={[
                    styles.selectionButtonSmallText,
                    accessories.pants === null && { color: colors.tint, fontWeight: '700' }
                  ]}>
                    OFF
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.selectionButtonSmall,
                    { 
                      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                      borderColor: accessories.pants === 1 ? colors.tint : (colorScheme === 'dark' ? '#444' : '#ddd')
                    },
                    accessories.pants === 1 && styles.selectionButtonSmallActive
                  ]}
                  onPress={() => selectPants(1)}
                >
                  <ThemedText style={[
                    styles.selectionButtonSmallText,
                    accessories.pants === 1 && { color: colors.tint, fontWeight: '700' }
                  ]}>
                    1
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.selectionButtonSmall,
                    { 
                      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                      borderColor: accessories.pants === 2 ? colors.tint : (colorScheme === 'dark' ? '#444' : '#ddd')
                    },
                    accessories.pants === 2 && styles.selectionButtonSmallActive
                  ]}
                  onPress={() => selectPants(2)}
                >
                  <ThemedText style={[
                    styles.selectionButtonSmallText,
                    accessories.pants === 2 && { color: colors.tint, fontWeight: '700' }
                  ]}>
                    2
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
            )}
            
            {/* Hair Selection */}
            {selectedAccessoryCategory === 'hair' && (
            <View style={styles.selectableAccessory}>
              <View style={styles.selectableAccessoryHeader}>
                <ThemedText style={styles.selectableAccessoryTitle}>
                  💇 Hair Style
                </ThemedText>
                <ThemedText style={styles.selectableAccessoryHint}>
                  Choose a style
                </ThemedText>
              </View>
              <View style={styles.selectionButtonsRow}>
                <TouchableOpacity
                  style={[
                    styles.selectionButtonSmall,
                    { 
                      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                      borderColor: accessories.hair === null ? colors.tint : (colorScheme === 'dark' ? '#444' : '#ddd')
                    },
                    accessories.hair === null && styles.selectionButtonSmallActive
                  ]}
                  onPress={() => selectHair(null)}
                >
                  <ThemedText style={[
                    styles.selectionButtonSmallText,
                    accessories.hair === null && { color: colors.tint, fontWeight: '700' }
                  ]}>
                    OFF
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.selectionButtonSmall,
                    { 
                      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                      borderColor: accessories.hair === 1 ? colors.tint : (colorScheme === 'dark' ? '#444' : '#ddd')
                    },
                    accessories.hair === 1 && styles.selectionButtonSmallActive
                  ]}
                  onPress={() => selectHair(1)}
                >
                  <ThemedText style={[
                    styles.selectionButtonSmallText,
                    accessories.hair === 1 && { color: colors.tint, fontWeight: '700' }
                  ]}>
                    1
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
            )}
            
            {/* Mask Selection */}
            {selectedAccessoryCategory === 'mask' && (
            <View style={styles.selectableAccessory}>
              <View style={styles.selectableAccessoryHeader}>
                <ThemedText style={styles.selectableAccessoryTitle}>
                  😷 Face Mask
                </ThemedText>
                <ThemedText style={styles.selectableAccessoryHint}>
                  Choose a style
                </ThemedText>
              </View>
              <View style={styles.selectionButtonsRow}>
                <TouchableOpacity
                  style={[
                    styles.selectionButtonSmall,
                    { 
                      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                      borderColor: accessories.mask === null ? colors.tint : (colorScheme === 'dark' ? '#444' : '#ddd')
                    },
                    accessories.mask === null && styles.selectionButtonSmallActive
                  ]}
                  onPress={() => selectMask(null)}
                >
                  <ThemedText style={[
                    styles.selectionButtonSmallText,
                    accessories.mask === null && { color: colors.tint, fontWeight: '700' }
                  ]}>
                    OFF
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.selectionButtonSmall,
                    { 
                      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                      borderColor: accessories.mask === 1 ? colors.tint : (colorScheme === 'dark' ? '#444' : '#ddd')
                    },
                    accessories.mask === 1 && styles.selectionButtonSmallActive
                  ]}
                  onPress={() => selectMask(1)}
                >
                  <ThemedText style={[
                    styles.selectionButtonSmallText,
                    accessories.mask === 1 && { color: colors.tint, fontWeight: '700' }
                  ]}>
                    1
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
            )}
            
            {/* Full Suit Selection */}
            {selectedAccessoryCategory === 'suit' && (
            <View style={styles.selectableAccessory}>
              <View style={styles.selectableAccessoryHeader}>
                <ThemedText style={styles.selectableAccessoryTitle}>
                  👔 Full Suit
                </ThemedText>
                <ThemedText style={styles.selectableAccessoryHint}>
                  Choose a style
                </ThemedText>
              </View>
              <View style={styles.selectionButtonsRow}>
                <TouchableOpacity
                  style={[
                    styles.selectionButtonSmall,
                    { 
                      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                      borderColor: accessories.fullSuit === null ? colors.tint : (colorScheme === 'dark' ? '#444' : '#ddd')
                    },
                    accessories.fullSuit === null && styles.selectionButtonSmallActive
                  ]}
                  onPress={() => selectFullSuit(null)}
                >
                  <ThemedText style={[
                    styles.selectionButtonSmallText,
                    accessories.fullSuit === null && { color: colors.tint, fontWeight: '700' }
                  ]}>
                    OFF
                  </ThemedText>
                </TouchableOpacity>
                {selectedGender === 'female' && (
                  <TouchableOpacity
                    style={[
                      styles.selectionButtonSmall,
                      { 
                        backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                        borderColor: accessories.fullSuit === 1 ? colors.tint : (colorScheme === 'dark' ? '#444' : '#ddd')
                      },
                      accessories.fullSuit === 1 && styles.selectionButtonSmallActive
                    ]}
                    onPress={() => selectFullSuit(1)}
                  >
                    <ThemedText style={[
                      styles.selectionButtonSmallText,
                      accessories.fullSuit === 1 && { color: colors.tint, fontWeight: '700' }
                    ]}>
                      1
                    </ThemedText>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[
                    styles.selectionButtonSmall,
                    { 
                      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                      borderColor: accessories.fullSuit === 3 ? colors.tint : (colorScheme === 'dark' ? '#444' : '#ddd')
                    },
                    accessories.fullSuit === 3 && styles.selectionButtonSmallActive
                  ]}
                  onPress={() => selectFullSuit(3)}
                >
                  <ThemedText style={[
                    styles.selectionButtonSmallText,
                    accessories.fullSuit === 3 && { color: colors.tint, fontWeight: '700' }
                  ]}>
                    {selectedGender === 'female' ? '2' : '1'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
            )}
            
            {/* Shoes Selection */}
            {selectedAccessoryCategory === 'shoes' && (
            <View style={styles.selectableAccessory}>
              <View style={styles.selectableAccessoryHeader}>
                <ThemedText style={styles.selectableAccessoryTitle}>
                  👞 Shoes
                </ThemedText>
                <ThemedText style={styles.selectableAccessoryHint}>
                  Choose a style
                </ThemedText>
              </View>
              <View style={styles.selectionButtonsRow}>
                <TouchableOpacity
                  style={[
                    styles.selectionButtonSmall,
                    { 
                      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                      borderColor: accessories.shoes === null ? colors.tint : (colorScheme === 'dark' ? '#444' : '#ddd')
                    },
                    accessories.shoes === null && styles.selectionButtonSmallActive
                  ]}
                  onPress={() => selectShoes(null)}
                >
                  <ThemedText style={[
                    styles.selectionButtonSmallText,
                    accessories.shoes === null && { color: colors.tint, fontWeight: '700' }
                  ]}>
                    OFF
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.selectionButtonSmall,
                    { 
                      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                      borderColor: accessories.shoes === 1 ? colors.tint : (colorScheme === 'dark' ? '#444' : '#ddd')
                    },
                    accessories.shoes === 1 && styles.selectionButtonSmallActive
                  ]}
                  onPress={() => selectShoes(1)}
                >
                  <ThemedText style={[
                    styles.selectionButtonSmallText,
                    accessories.shoes === 1 && { color: colors.tint, fontWeight: '700' }
                  ]}>
                    1
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.selectionButtonSmall,
                    { 
                      backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f5f5f5',
                      borderColor: accessories.shoes === 2 ? colors.tint : (colorScheme === 'dark' ? '#444' : '#ddd')
                    },
                    accessories.shoes === 2 && styles.selectionButtonSmallActive
                  ]}
                  onPress={() => selectShoes(2)}
                >
                  <ThemedText style={[
                    styles.selectionButtonSmallText,
                    accessories.shoes === 2 && { color: colors.tint, fontWeight: '700' }
                  ]}>
                    2
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity 
              style={[styles.resetButton, { 
                borderColor: colors.tint,
              }]}
              onPress={() => {
                setSelectedGender('female');
                setSelectedBody('female');
                setSelectedTextures({
                  eyes: 'eyes_default',
                  hair: 'hair_default',
                  top: 'top_default',
                  pants: 'pants_default',
                  shoes: 'shoes_default',
                });
                setAccessories({
                  jacket: null,
                  pants: null,
                  hair: null,
                  mask: null,
                  fullSuit: null,
                  shoes: null,
                });
                sendMessageToWebView('SET_BODY', 'female');
                sendMessageToWebView('SET_EYES', 'eyes_default');
                sendMessageToWebView('SET_HAIR', 'hair_default');
                sendMessageToWebView('SET_TOP', 'top_default');
                sendMessageToWebView('SET_PANTS', 'pants_default');
                sendMessageToWebView('SET_SHOES', 'shoes_default');
                // Reset accessories
                webViewRef.current?.postMessage(JSON.stringify({ 
                  type: 'SET_JACKET', 
                  selection: null
                }));
                webViewRef.current?.postMessage(JSON.stringify({ 
                  type: 'SET_PANTS_ACCESSORY', 
                  selection: null
                }));
                webViewRef.current?.postMessage(JSON.stringify({ 
                  type: 'SET_HAIR_ACCESSORY', 
                  selection: null
                }));
                webViewRef.current?.postMessage(JSON.stringify({ 
                  type: 'SET_MASK_ACCESSORY', 
                  selection: null
                }));
                webViewRef.current?.postMessage(JSON.stringify({ 
                  type: 'SET_FULL_SUIT', 
                  selection: null
                }));
                webViewRef.current?.postMessage(JSON.stringify({ 
                  type: 'SET_SHOES_ACCESSORY', 
                  selection: null
                }));
              }}
            >
              <ThemedText style={[styles.resetButtonText, { color: colors.tint }]}>
                Reset All
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: colors.tint }]}
              onPress={() => {
                // Save avatar configuration
              }}
            >
              <ThemedText style={[
                styles.saveButtonText, 
                { color: colorScheme === 'dark' ? '#000' : '#fff' }
              ]}>
                Save Avatar
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Full screen avatar
  avatarContainer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 20,
  },
  // Bottom panel
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  dragHandle: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingTop: 8,
  },
  dragBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  dragText: {
    fontSize: 11,
    opacity: 0.5,
  },
  panelScroll: {
    flex: 1,
  },
  panelContent: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },
  // Gender selection
  genderSection: {
    marginBottom: 16,
  },
  genderToggle: {
    flexDirection: 'row',
    gap: 10,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  genderText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Quick body selection
  quickSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    opacity: 0.7,
  },
  bodyIconGrid: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  bodyIconButton: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  selectedBodyIcon: {
    borderWidth: 4,
    elevation: 3,
  },
  // Tab section
  tabSection: {
    marginBottom: 20,
  },
  tabScroll: {
    gap: 10,
    paddingRight: 20,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Color section
  colorSection: {
    marginBottom: 20,
  },
  colorLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  colorButton: {
    alignItems: 'center',
    gap: 6,
    borderWidth: 3,
    borderRadius: 12,
    padding: 8,
  },
  selectedColor: {
    borderWidth: 3.5,
    elevation: 3,
  },
  colorCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  colorName: {
    fontSize: 11,
    fontWeight: '600',
  },
  // Accessories section
  accessoriesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  // Category tabs
  categoryTabScroll: {
    gap: 8,
    marginBottom: 16,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Simple accessories (Jacket & Pants)
  simpleAccessoriesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  simpleAccessoryButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 3,
    gap: 6,
  },
  simpleAccessoryActive: {
    borderWidth: 3.5,
    elevation: 2,
  },
  simpleAccessoryEmoji: {
    fontSize: 28,
  },
  simpleAccessoryLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Selectable accessories (Full Suit & Shoes)
  selectableAccessory: {
    marginBottom: 14,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  selectableAccessoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectableAccessoryTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  selectableAccessoryHint: {
    fontSize: 11,
    opacity: 0.5,
    fontStyle: 'italic',
  },
  selectionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  selectionButtonSmall: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
  },
  selectionButtonSmallActive: {
    borderWidth: 3,
    elevation: 2,
  },
  selectionButtonSmallText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Actions
  actionSection: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  resetButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  saveButton: {
    flex: 2,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
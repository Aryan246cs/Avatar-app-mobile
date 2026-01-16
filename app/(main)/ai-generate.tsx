import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function AIGenerateScreen() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    
    // Mock generation - no real AI yet
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  const examplePrompts = [
    'Futuristic cyberpunk jacket',
    'Medieval fantasy crown',
    'Neon sunglasses',
    'Steampunk goggles',
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title">AI Generate</ThemedText>
          <ThemedText style={styles.subtitle}>Create custom items with AI</ThemedText>
        </View>

        {/* AI Icon */}
        <View style={[styles.aiIconContainer, { backgroundColor: colors.tint }]}>
          <IconSymbol name="sparkles" size={48} color="#fff" />
        </View>

        {/* Prompt Input */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Describe what you want
          </ThemedText>
          <TextInput
            style={[styles.promptInput, { 
              backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f8f9fa',
              color: colors.text,
              borderColor: colorScheme === 'dark' ? '#333' : '#e0e0e0'
            }]}
            placeholder="E.g., A golden crown with emeralds..."
            placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
            value={prompt}
            onChangeText={setPrompt}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Example Prompts */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Try these examples
          </ThemedText>
          <View style={styles.examplesGrid}>
            {examplePrompts.map((example, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.exampleChip, { 
                  backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
                  borderColor: colorScheme === 'dark' ? '#333' : '#e0e0e0'
                }]}
                onPress={() => setPrompt(example)}
              >
                <ThemedText style={styles.exampleText}>{example}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Generation Result Placeholder */}
        {isGenerating && (
          <View style={[styles.resultContainer, { 
            backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f8f9fa' 
          }]}>
            <IconSymbol name="hourglass" size={40} color={colors.icon} />
            <ThemedText style={styles.resultText}>Generating...</ThemedText>
          </View>
        )}

        {/* Info Card */}
        <View style={[styles.infoCard, { 
          backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff8e1' 
        }]}>
          <IconSymbol name="info.circle.fill" size={24} color="#f59e0b" />
          <View style={styles.infoContent}>
            <ThemedText style={styles.infoTitle}>AI Generation Coming Soon</ThemedText>
            <ThemedText style={styles.infoText}>
              This feature will use AI to generate custom avatar items based on your descriptions.
            </ThemedText>
          </View>
        </View>

        {/* Generate Button */}
        <TouchableOpacity 
          style={[
            styles.generateButton, 
            { backgroundColor: colors.tint },
            (!prompt.trim() || isGenerating) && styles.generateButtonDisabled
          ]}
          onPress={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
        >
          <IconSymbol 
            name="sparkles" 
            size={24} 
            color={colorScheme === 'dark' ? '#000' : '#fff'} 
          />
          <ThemedText style={[
            styles.generateButtonText, 
            { color: colorScheme === 'dark' ? '#000' : '#fff' }
          ]}>
            {isGenerating ? 'Generating...' : 'Generate Item'}
          </ThemedText>
        </TouchableOpacity>
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
  content: {
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
  aiIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  promptInput: {
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    borderWidth: 1,
  },
  examplesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  exampleChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  exampleText: {
    fontSize: 14,
  },
  resultContainer: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  resultText: {
    fontSize: 16,
    marginTop: 12,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 24,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    opacity: 0.8,
  },
  generateButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  generateButtonDisabled: {
    opacity: 0.5,
  },
  generateButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

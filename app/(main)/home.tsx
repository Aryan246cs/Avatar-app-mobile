import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const cards = [
    {
      title: 'Create Avatar',
      description: 'Design your unique digital identity',
      icon: 'person.fill',
      route: '/(main)/avatar-editor',
      color: '#6366f1',
    },
    {
      title: 'Browse Items',
      description: 'Explore clothes and accessories',
      icon: 'square.grid.2x2.fill',
      route: '/(main)/item-selection',
      color: '#8b5cf6',
    },
    {
      title: 'AI Generate',
      description: 'Create custom items with AI',
      icon: 'sparkles',
      route: '/(main)/ai-generate',
      color: '#ec4899',
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title">Welcome Back!</ThemedText>
          <ThemedText style={styles.subtitle}>Ready to create your avatar?</ThemedText>
        </View>

        <View style={styles.cardsContainer}>
          {cards.map((card, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff' }]}
              onPress={() => router.push(card.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: card.color }]}>
                <IconSymbol name={card.icon as any} size={32} color="#fff" />
              </View>
              <View style={styles.cardContent}>
                <ThemedText type="subtitle" style={styles.cardTitle}>{card.title}</ThemedText>
                <ThemedText style={styles.cardDescription}>{card.description}</ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.icon} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.statsCard, { backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f8f9fa' }]}>
          <ThemedText type="subtitle" style={styles.statsTitle}>Your Progress</ThemedText>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ThemedText type="title" style={styles.statValue}>0</ThemedText>
              <ThemedText style={styles.statLabel}>Avatars Created</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText type="title" style={styles.statValue}>0</ThemedText>
              <ThemedText style={styles.statLabel}>Items Owned</ThemedText>
            </View>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 4,
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  statsCard: {
    padding: 24,
    borderRadius: 16,
    marginTop: 8,
  },
  statsTitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
});

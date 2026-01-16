import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

type Category = 'all' | 'hair' | 'clothes' | 'accessories';

type Item = {
  id: string;
  name: string;
  category: Category;
  icon: string;
  color: string;
};

// Mock data - replace with real data later
const mockItems: Item[] = [
  { id: '1', name: 'Short Hair', category: 'hair', icon: 'scissors', color: '#8b4513' },
  { id: '2', name: 'Long Hair', category: 'hair', icon: 'scissors', color: '#000' },
  { id: '3', name: 'Curly Hair', category: 'hair', icon: 'scissors', color: '#ffd700' },
  { id: '4', name: 'T-Shirt', category: 'clothes', icon: 'tshirt.fill', color: '#4169e1' },
  { id: '5', name: 'Hoodie', category: 'clothes', icon: 'tshirt.fill', color: '#808080' },
  { id: '6', name: 'Jacket', category: 'clothes', icon: 'tshirt.fill', color: '#000' },
  { id: '7', name: 'Glasses', category: 'accessories', icon: 'eyeglasses', color: '#000' },
  { id: '8', name: 'Hat', category: 'accessories', icon: 'crown.fill', color: '#ff6347' },
  { id: '9', name: 'Earrings', category: 'accessories', icon: 'circle.fill', color: '#ffd700' },
];

const categories = [
  { id: 'all', name: 'All', icon: 'square.grid.2x2.fill' },
  { id: 'hair', name: 'Hair', icon: 'scissors' },
  { id: 'clothes', name: 'Clothes', icon: 'tshirt.fill' },
  { id: 'accessories', name: 'Accessories', icon: 'eyeglasses' },
];

export default function ItemSelectionScreen() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const filteredItems = selectedCategory === 'all' 
    ? mockItems 
    : mockItems.filter(item => item.category === selectedCategory);

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity
      style={[
        styles.itemCard,
        { 
          backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
          borderColor: selectedItem === item.id ? colors.tint : 'transparent'
        },
        selectedItem === item.id && styles.itemCardSelected
      ]}
      onPress={() => setSelectedItem(item.id)}
    >
      <View style={[styles.itemIcon, { backgroundColor: item.color }]}>
        <IconSymbol name={item.icon as any} size={32} color="#fff" />
      </View>
      <ThemedText style={styles.itemName}>{item.name}</ThemedText>
      {selectedItem === item.id && (
        <View style={[styles.checkmark, { backgroundColor: colors.tint }]}>
          <IconSymbol name="checkmark" size={16} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Browse Items</ThemedText>
        <ThemedText style={styles.subtitle}>Choose items for your avatar</ThemedText>
      </View>

      {/* Category Filter */}
      <View style={styles.categoriesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                { 
                  backgroundColor: selectedCategory === category.id 
                    ? colors.tint 
                    : (colorScheme === 'dark' ? '#1a1a1a' : '#f0f0f0')
                }
              ]}
              onPress={() => setSelectedCategory(category.id as Category)}
            >
              <IconSymbol 
                name={category.icon as any} 
                size={18} 
                color={selectedCategory === category.id 
                  ? (colorScheme === 'dark' ? '#000' : '#fff')
                  : colors.icon
                } 
              />
              <ThemedText style={[
                styles.categoryText,
                selectedCategory === category.id && { 
                  color: colorScheme === 'dark' ? '#000' : '#fff' 
                }
              ]}>
                {category.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Items Grid */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.itemsGrid}
        columnWrapperStyle={styles.itemsRow}
        showsVerticalScrollIndicator={false}
      />

      {/* Apply Button */}
      {selectedItem && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.applyButton, { backgroundColor: colors.tint }]}
          >
            <ThemedText style={[
              styles.applyButtonText, 
              { color: colorScheme === 'dark' ? '#000' : '#fff' }
            ]}>
              Apply to Avatar
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 4,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 10,
    paddingVertical: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    minWidth: 80,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemsGrid: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
  itemsRow: {
    gap: 16,
    marginBottom: 16,
  },
  itemCard: {
    flex: 1,
    aspectRatio: 0.85,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemCardSelected: {
    borderWidth: 3,
  },
  itemIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 20,
    paddingTop: 12,
  },
  applyButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

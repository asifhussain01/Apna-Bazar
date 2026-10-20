import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { useLocalizationStore } from '../store/localizationStore';
import { fetchCategories } from '../api/products';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Props {
  navigation: NavigationProp;
}

export const CategoryScreen: React.FC<Props> = ({ navigation }) => {
  const { currentLanguage, t } = useLocalizationStore();
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header title={t('categories')} subtitle="दुकान का सभी सामान देखें" />

      <ScrollView contentContainerStyle={styles.listContainer}>
        {categories.map(cat => {
          const name = currentLanguage === 'hi' ? cat.name?.hi || cat.name?.en : cat.name?.en || cat.name?.hi;
          const desc = currentLanguage === 'hi' ? cat.description?.hi || cat.description?.en : cat.description?.en;

          return (
            <TouchableOpacity
              key={cat._id || cat.slug}
              activeOpacity={0.8}
              style={styles.card}
              onPress={() =>
                navigation.navigate('ProductList', {
                  categoryId: cat._id,
                  categoryTitle: name
                })
              }
            >
              <View style={styles.iconCircle}>
                <Ionicons name={(cat.iconName || 'basket') as any} size={32} color={colors.primary} />
              </View>

              <View style={styles.textCol}>
                <Text style={styles.title}>{name}</Text>
                {desc && <Text style={styles.desc} numberOfLines={2}>{desc}</Text>}
              </View>

              <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  listContainer: {
    padding: 16
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  textCol: {
    flex: 1
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4
  },
  desc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18
  }
});

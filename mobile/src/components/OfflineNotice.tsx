import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalizationStore } from '../store/localizationStore';

interface OfflineNoticeProps {
  isOffline: boolean;
}

export const OfflineNotice: React.FC<OfflineNoticeProps> = ({ isOffline }) => {
  const { t } = useLocalizationStore();

  if (!isOffline) return null;

  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline-outline" size={18} color="#FFFFFF" />
      <Text style={styles.text}>{t('offlineNotice')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#D97706', // Warning amber
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6
  }
});

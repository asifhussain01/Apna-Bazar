import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useLocalizationStore } from '../store/localizationStore';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  onOpenLanguage?: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  onOpenLanguage,
  onOpenNotifications,
  unreadNotificationsCount = 0
}) => {
  const { currentLanguage, t } = useLocalizationStore();

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {showBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={26} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.brandIconContainer}>
            <Ionicons name="storefront" size={24} color="#FFFFFF" />
          </View>
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title || t('appName')}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : (
            <Text style={styles.subtitle} numberOfLines={1}>
              {t('appTagline')}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightSection}>
        {onOpenLanguage && (
          <TouchableOpacity onPress={onOpenLanguage} style={styles.languagePill}>
            <Ionicons name="language" size={16} color={colors.primary} />
            <Text style={styles.languageText}>
              {currentLanguage === 'hi' ? 'हिन्दी' : 'English'}
            </Text>
          </TouchableOpacity>
        )}

        {onOpenNotifications && (
          <TouchableOpacity onPress={onOpenNotifications} style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
            {unreadNotificationsCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  backButton: {
    padding: 6,
    marginRight: 8
  },
  brandIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  titleContainer: {
    flex: 1
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  languagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    marginRight: 10
  },
  languageText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 4
  },
  iconButton: {
    padding: 6,
    position: 'relative'
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.error,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold'
  }
});

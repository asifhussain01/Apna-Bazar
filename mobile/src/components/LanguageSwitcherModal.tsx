import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useLocalizationStore } from '../store/localizationStore';
import { LanguageCode } from '../i18n/i18n';

interface LanguageSwitcherModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LanguageSwitcherModal: React.FC<LanguageSwitcherModalProps> = ({
  visible,
  onClose
}) => {
  const { currentLanguage, setLanguage } = useLocalizationStore();

  const handleSelect = async (code: LanguageCode) => {
    await setLanguage(code);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <Text style={styles.title}>भाषा चुनें / Choose Language</Text>
          <Text style={styles.subtitle}>अपनी पसंदीदा भाषा चुनें</Text>

          {/* Hindi Option */}
          <TouchableOpacity
            style={[
              styles.optionButton,
              currentLanguage === 'hi' && styles.selectedOption
            ]}
            onPress={() => handleSelect('hi')}
          >
            <View style={styles.optionLeft}>
              <View style={styles.flagIcon}>
                <Text style={styles.flagText}>अ</Text>
              </View>
              <View>
                <Text style={styles.optionTitle}>हिन्दी (Hindi)</Text>
                <Text style={styles.optionSub}>गाँव और परिवार के लिए आसान</Text>
              </View>
            </View>
            {currentLanguage === 'hi' && (
              <Ionicons name="checkmark-circle" size={24} color={colors.secondary} />
            )}
          </TouchableOpacity>

          {/* English Option */}
          <TouchableOpacity
            style={[
              styles.optionButton,
              currentLanguage === 'en' && styles.selectedOption
            ]}
            onPress={() => handleSelect('en')}
          >
            <View style={styles.optionLeft}>
              <View style={styles.flagIcon}>
                <Text style={styles.flagText}>A</Text>
              </View>
              <View>
                <Text style={styles.optionTitle}>English</Text>
                <Text style={styles.optionSub}>Default English layout</Text>
              </View>
            </View>
            {currentLanguage === 'en' && (
              <Ionicons name="checkmark-circle" size={24} color={colors.secondary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>बंद करें (Close)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    elevation: 5
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 12,
    backgroundColor: '#F8FAFC'
  },
  selectedOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  flagIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  flagText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary
  },
  optionSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  closeButton: {
    marginTop: 10,
    paddingVertical: 12,
    alignItems: 'center'
  },
  closeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary
  }
});

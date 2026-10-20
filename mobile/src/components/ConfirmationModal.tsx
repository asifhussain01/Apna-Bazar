import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { Button } from './Button';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'रद्द करें (Cancel)',
  isDestructive = false,
  onConfirm,
  onCancel
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actionCol}>
            <Button
              title={confirmLabel}
              onPress={onConfirm}
              variant={isDestructive ? 'danger' : 'secondary'}
              style={styles.confirmBtn}
            />

            <Button
              title={cancelLabel}
              onPress={onCancel}
              variant="outline"
              style={styles.cancelBtn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    elevation: 6
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20
  },
  actionCol: {
    width: '100%'
  },
  confirmBtn: {
    marginBottom: 10
  },
  cancelBtn: {
    borderColor: colors.border
  }
});

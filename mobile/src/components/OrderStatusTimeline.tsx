import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useLocalizationStore } from '../store/localizationStore';

interface TimelineProps {
  currentStatus: string;
  statusHistory?: Array<{
    status: string;
    timestamp: string;
    note: string;
    updatedBy?: string;
  }>;
  shopkeeperName?: string;
}

const STEPS = [
  { key: 'PLACED', labelKey: 'placed', icon: 'receipt-outline' },
  { key: 'CONFIRMED', labelKey: 'confirmed', icon: 'checkmark-circle-outline' },
  { key: 'PREPARING', labelKey: 'preparing', icon: 'cube-outline' },
  { key: 'SHIPPED', labelKey: 'shipped', icon: 'bicycle-outline' },
  { key: 'OUT_FOR_DELIVERY', labelKey: 'outForDelivery', icon: 'navigate-outline' },
  { key: 'DELIVERED', labelKey: 'delivered', icon: 'home-outline' }
];

export const OrderStatusTimeline: React.FC<TimelineProps> = ({
  currentStatus,
  statusHistory = [],
  shopkeeperName
}) => {
  const { t } = useLocalizationStore();

  const isCancelled = currentStatus === 'CANCELLED';
  const isRejected = currentStatus === 'REJECTED';

  const currentStepIndex = STEPS.findIndex(s => s.key === currentStatus);

  if (isCancelled || isRejected) {
    return (
      <View style={styles.cancelledContainer}>
        <View style={styles.cancelledIcon}>
          <Ionicons name="close-circle" size={40} color={colors.error} />
        </View>
        <Text style={styles.cancelledTitle}>
          {isCancelled ? t('cancelled') : t('rejected')}
        </Text>
        <Text style={styles.cancelledSubtitle}>
          {statusHistory.length > 0 && statusHistory[statusHistory.length - 1].note
            ? statusHistory[statusHistory.length - 1].note
            : 'यह ऑर्डर आगे प्रोसेस नहीं किया जा सका (Order was not fulfilled)'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.timeline}>
      {STEPS.map((step, index) => {
        const isPassed = index <= currentStepIndex;
        const isCurrent = index === currentStepIndex;

        // Find timestamp from history if available
        const historyEntry = statusHistory.find(h => h.status === step.key);
        const timeFormatted = historyEntry?.timestamp
          ? new Date(historyEntry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : null;

        let noteText = historyEntry?.note || '';
        if (step.key === 'CONFIRMED' && shopkeeperName && isPassed) {
          noteText = `दुकानदार: ${shopkeeperName} ने ऑर्डर स्वीकार किया`;
        }

        return (
          <View key={step.key} style={styles.stepRow}>
            {/* Left Indicator & Connecting Line */}
            <View style={styles.indicatorCol}>
              <View
                style={[
                  styles.circle,
                  isPassed ? styles.circleActive : styles.circleInactive,
                  isCurrent && styles.circleCurrent
                ]}
              >
                <Ionicons
                  name={step.icon as any}
                  size={18}
                  color={isPassed ? '#FFFFFF' : colors.textMuted}
                />
              </View>

              {index < STEPS.length - 1 && (
                <View
                  style={[
                    styles.line,
                    index < currentStepIndex ? styles.lineActive : styles.lineInactive
                  ]}
                />
              )}
            </View>

            {/* Right Step Label & Details */}
            <View style={styles.labelCol}>
              <View style={styles.labelHeader}>
                <Text
                  style={[
                    styles.stepLabel,
                    isPassed ? styles.stepLabelActive : styles.stepLabelInactive,
                    isCurrent && styles.stepLabelCurrent
                  ]}
                >
                  {t(step.labelKey)}
                </Text>

                {timeFormatted && (
                  <Text style={styles.stepTime}>{timeFormatted}</Text>
                )}
              </View>

              {noteText ? (
                <Text style={[styles.stepNote, step.key === 'CONFIRMED' && shopkeeperName && styles.shopkeeperConfirmedNote]}>
                  {noteText}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  timeline: {
    paddingVertical: 12
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 64
  },
  indicatorCol: {
    alignItems: 'center',
    width: 36,
    marginRight: 14
  },
  circle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2
  },
  circleActive: {
    backgroundColor: colors.secondary
  },
  circleInactive: {
    backgroundColor: '#E2E8F0'
  },
  circleCurrent: {
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.primaryLight
  },
  line: {
    width: 3,
    flex: 1,
    marginTop: -2,
    marginBottom: -2
  },
  lineActive: {
    backgroundColor: colors.secondary
  },
  lineInactive: {
    backgroundColor: '#E2E8F0'
  },
  labelCol: {
    flex: 1,
    paddingTop: 4
  },
  labelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  stepLabel: {
    fontSize: 15,
    fontWeight: '600'
  },
  stepLabelActive: {
    color: colors.textPrimary,
    fontWeight: '700'
  },
  stepLabelInactive: {
    color: colors.textMuted
  },
  stepLabelCurrent: {
    color: colors.primary,
    fontWeight: '800'
  },
  stepTime: {
    fontSize: 12,
    color: colors.textSecondary
  },
  stepNote: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  shopkeeperConfirmedNote: {
    color: '#15803D',
    fontWeight: '700'
  },
  cancelledContainer: {
    padding: 20,
    backgroundColor: colors.errorLight,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 12
  },
  cancelledIcon: {
    marginBottom: 8
  },
  cancelledTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.error,
    marginBottom: 4
  },
  cancelledSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center'
  }
});

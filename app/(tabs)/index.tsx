import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/src/store/useStore';
import StreakRing from '@/src/components/StreakRing';
import Card from '@/src/components/Card';
import BenefitBadge from '@/src/components/BenefitBadge';
import { getDailyQuote } from '@/src/constants/quotes';
import { getNextBenefit, getUnlockedBenefits, BENEFITS } from '@/src/constants/benefits';
import { COLORS, SPACING, RADIUS } from '@/src/constants/theme';
import {
  scheduleMotivationNotifications,
  sendInstantEncouragement,
} from '@/src/utils/notifications';

export default function HomeScreen() {
  const store = useStore();
  const [showRelapseModal, setShowRelapseModal] = useState(false);
  const [relapseNote, setRelapseNote] = useState('');
  const [showStartModal, setShowStartModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const quote = getDailyQuote();
  const nextBenefit = getNextBenefit(store.currentStreak);
  const unlockedBenefits = getUnlockedBenefits(store.currentStreak);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    // Show encouragement on milestone days
    const milestones = [1, 7, 14, 21, 30, 60, 90, 180, 365];
    if (milestones.includes(store.currentStreak)) {
      sendInstantEncouragement(store.currentStreak);
    }
  }, [store.currentStreak]);

  const handleStartJourney = () => {
    store.startJourney();
    setShowStartModal(false);
    if (store.notificationsEnabled) {
      scheduleMotivationNotifications();
    }
  };

  const handleRelapse = () => {
    Alert.alert(
      'Log a Relapse',
      'This does NOT mean failure. Every warrior stumbles. The key is getting back up.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log it',
          style: 'destructive',
          onPress: () => setShowRelapseModal(true),
        },
      ]
    );
  };

  const confirmRelapse = () => {
    store.resetStreak(relapseNote);
    setShowRelapseModal(false);
    setRelapseNote('');
  };

  const handleCheckIn = () => {
    if (store.dailyCheckInDone) {
      Alert.alert("Already Checked In", "Great job checking in today! Come back tomorrow.");
      return;
    }
    store.completeDailyCheckIn();
    Alert.alert("Check-in Complete! ✅", "Keep building. Every day counts.");
  };

  // Compute next milestone for ring
  const milestones = [7, 14, 21, 30, 45, 60, 90, 180, 365];
  const nextMilestone = milestones.find((m) => m > store.currentStreak) ?? 365;

  if (!store.loaded) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.header}>
            <View>
              <Text style={styles.appName}>FreedomPath</Text>
              <Text style={styles.subtitle}>
                {store.startDate ? 'Your journey continues' : 'Begin your transformation'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.checkInBtn}
              onPress={handleCheckIn}
            >
              <Ionicons
                name={store.dailyCheckInDone ? 'checkmark-circle' : 'checkmark-circle-outline'}
                size={28}
                color={store.dailyCheckInDone ? COLORS.success : COLORS.textMuted}
              />
              <Text style={[styles.checkInLabel, store.dailyCheckInDone && { color: COLORS.success }]}>
                {store.dailyCheckInDone ? 'Checked' : 'Check In'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Streak Ring */}
          <View style={styles.ringWrapper}>
            {store.startDate ? (
              <StreakRing
                days={store.currentStreak}
                size={220}
                milestone={nextMilestone}
              />
            ) : (
              <View style={styles.noStreakContainer}>
                <Text style={styles.noStreakIcon}>🔥</Text>
                <Text style={styles.noStreakText}>Your journey hasn't started yet.</Text>
                <TouchableOpacity
                  style={styles.startBtn}
                  onPress={() => setShowStartModal(true)}
                >
                  <Text style={styles.startBtnText}>Begin Today</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Stats Row */}
          {store.startDate && (
            <View style={styles.statsRow}>
              <Card style={styles.statCard}>
                <Text style={styles.statNumber}>{store.currentStreak}</Text>
                <Text style={styles.statLabel}>Current{'\n'}Streak</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={styles.statNumber}>{store.longestStreak}</Text>
                <Text style={styles.statLabel}>Best{'\n'}Streak</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={[styles.statNumber, store.relapses > 0 && { color: COLORS.warning }]}>
                  {store.relapses}
                </Text>
                <Text style={styles.statLabel}>Relapses{'\n'}Total</Text>
              </Card>
            </View>
          )}

          {/* Daily Quote */}
          <Card style={styles.quoteCard} variant="bordered">
            <View style={styles.quoteHeader}>
              <Ionicons name="sparkles" size={16} color={COLORS.gold} />
              <Text style={styles.quoteHeaderText}>Daily Quote</Text>
            </View>
            <Text style={styles.quoteText}>"{quote.text}"</Text>
            <Text style={styles.quoteAuthor}>— {quote.author}</Text>
          </Card>

          {/* Next Milestone */}
          {store.startDate && nextBenefit && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Next Unlock</Text>
              <BenefitBadge benefit={nextBenefit} unlocked={false} isNext />
            </View>
          )}

          {/* Unlocked Benefits */}
          {unlockedBenefits.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Unlocked Benefits ({unlockedBenefits.length}/{BENEFITS.length})
              </Text>
              {unlockedBenefits.map((b) => (
                <BenefitBadge key={b.day} benefit={b} unlocked />
              ))}
            </View>
          )}

          {/* Action Buttons */}
          {store.startDate && (
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.relapseBtn} onPress={handleRelapse}>
                <Ionicons name="refresh" size={18} color={COLORS.danger} />
                <Text style={styles.relapseBtnText}>Log Relapse</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Bottom Padding */}
          <View style={{ height: 32 }} />
        </Animated.View>
      </ScrollView>

      {/* Start Journey Modal */}
      <Modal visible={showStartModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalIcon}>🔥</Text>
            <Text style={styles.modalTitle}>Start Your Journey</Text>
            <Text style={styles.modalBody}>
              Today is Day 0. Tomorrow will be Day 1. The person you will become in 90 days depends on the choice you make right now.
            </Text>
            <TouchableOpacity style={styles.modalBtn} onPress={handleStartJourney}>
              <Text style={styles.modalBtnText}>I'm Starting Today</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowStartModal(false)}
            >
              <Text style={styles.modalCancelText}>Not yet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Relapse Modal */}
      <Modal visible={showRelapseModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalIcon}>💪</Text>
            <Text style={styles.modalTitle}>Log the Relapse</Text>
            <Text style={styles.modalBody}>
              This is not the end. This is data. What triggered it? Write it down so you can learn from it.
            </Text>
            <TextInput
              style={styles.relapseInput}
              placeholder="What triggered it? (optional)"
              placeholderTextColor={COLORS.textMuted}
              value={relapseNote}
              onChangeText={setRelapseNote}
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: COLORS.danger }]} onPress={confirmRelapse}>
              <Text style={styles.modalBtnText}>Reset & Start Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowRelapseModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  appName: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  checkInBtn: {
    alignItems: 'center',
    gap: 2,
  },
  checkInLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },

  ringWrapper: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    height: 240,
    justifyContent: 'center',
  },

  noStreakContainer: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  noStreakIcon: { fontSize: 64 },
  noStreakText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  startBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: RADIUS.full,
    marginTop: SPACING.sm,
  },
  startBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },

  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.accent,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 16,
  },

  quoteCard: {
    marginBottom: SPACING.lg,
  },
  quoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  quoteHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gold,
    letterSpacing: 1,
  },
  quoteText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  quoteAuthor: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 8,
    textAlign: 'right',
  },

  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },

  actionRow: {
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  relapseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  relapseBtnText: {
    fontSize: 14,
    color: COLORS.danger,
    fontWeight: '600',
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.xl,
    paddingBottom: 40,
    alignItems: 'center',
  },
  modalIcon: { fontSize: 48, marginBottom: SPACING.md },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  modalBtn: {
    width: '100%',
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  modalBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  modalCancel: {
    paddingVertical: 10,
  },
  modalCancelText: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
  relapseInput: {
    width: '100%',
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: 14,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});

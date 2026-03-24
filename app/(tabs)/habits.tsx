import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useStore } from '@/src/store/useStore';
import Card from '@/src/components/Card';
import { COLORS, SPACING, RADIUS } from '@/src/constants/theme';

const MOOD_LABELS = ['Terrible', 'Bad', 'Okay', 'Good', 'Great'];
const MOOD_COLORS = [COLORS.danger, '#FF7F50', COLORS.warning, '#90EE90', COLORS.success];
const MOOD_ICONS = ['😞', '😕', '😐', '🙂', '😄'];

export default function HabitsScreen() {
  const store = useStore();
  const todayHabits = store.getTodayHabits();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [showJournal, setShowJournal] = useState(false);
  const [journalText, setJournalText] = useState('');
  const [selectedMood, setSelectedMood] = useState(3);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const completedCount = todayHabits.filter((h) => h.completedToday).length;
  const completionPct = Math.round((completedCount / todayHabits.length) * 100);

  const handleHabitToggle = (habitId: string, completed: boolean) => {
    Haptics.impactAsync(
      completed ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium
    );
    if (!completed) {
      store.completeHabit(habitId);
    } else {
      store.uncompleteHabit(habitId);
    }
  };

  const submitJournal = () => {
    if (!journalText.trim()) {
      Alert.alert('Write something', 'Even a sentence counts.');
      return;
    }
    store.addJournalEntry(journalText.trim(), selectedMood);
    setJournalText('');
    setSelectedMood(3);
    setShowJournal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const getStreakBadge = (streak: number) => {
    if (streak >= 30) return { label: '🔥 30+', color: COLORS.gold };
    if (streak >= 14) return { label: `🏆 ${streak}d`, color: '#4CAF50' };
    if (streak >= 7) return { label: `⚡ ${streak}d`, color: COLORS.accent };
    if (streak >= 3) return { label: `✅ ${streak}d`, color: COLORS.success };
    return null;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Daily Habits</Text>
              <Text style={styles.subtitle}>Small actions compound into transformation</Text>
            </View>
            <TouchableOpacity
              style={styles.journalBtn}
              onPress={() => setShowJournal(true)}
            >
              <Ionicons name="pencil" size={16} color={COLORS.accent} />
              <Text style={styles.journalBtnText}>Journal</Text>
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <Card style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Today's Progress</Text>
              <Text style={[styles.progressPct, { color: completionPct >= 80 ? COLORS.success : COLORS.accent }]}>
                {completionPct}%
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${completionPct}%`,
                    backgroundColor: completionPct >= 80 ? COLORS.success : COLORS.accent,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressSub}>
              {completedCount}/{todayHabits.length} habits complete
              {completionPct === 100 ? ' — Perfect Day! 🏆' : ''}
            </Text>
          </Card>

          {/* Habits List */}
          <Text style={styles.sectionTitle}>Habits</Text>
          {todayHabits.map((habit) => {
            const streak = store.getHabitStreak(habit.id);
            const badge = getStreakBadge(streak);
            return (
              <TouchableOpacity
                key={habit.id}
                style={[styles.habitCard, habit.completedToday && styles.habitDone]}
                onPress={() => handleHabitToggle(habit.id, habit.completedToday)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.habitIcon,
                    { backgroundColor: habit.color + '22' },
                    habit.completedToday && { backgroundColor: habit.color + '44' },
                  ]}
                >
                  <Text style={styles.habitEmoji}>{habit.icon}</Text>
                </View>
                <View style={styles.habitInfo}>
                  <Text style={[styles.habitTitle, habit.completedToday && styles.habitTitleDone]}>
                    {habit.title}
                  </Text>
                  {streak > 0 && (
                    <Text style={styles.habitStreak}>
                      🔥 {streak} day streak
                    </Text>
                  )}
                </View>
                <View style={styles.habitRight}>
                  {badge && (
                    <View style={[styles.badge, { backgroundColor: badge.color + '22' }]}>
                      <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.checkbox,
                      habit.completedToday && { backgroundColor: habit.color, borderColor: habit.color },
                    ]}
                  >
                    {habit.completedToday && (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Journal Entries */}
          {store.journalEntries.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>Recent Journal</Text>
              {store.journalEntries.slice(0, 3).map((entry) => (
                <Card key={entry.id} style={styles.journalCard} variant="bordered">
                  <View style={styles.journalCardHeader}>
                    <Text style={styles.moodIcon}>{MOOD_ICONS[entry.mood - 1]}</Text>
                    <Text style={styles.journalDate}>{entry.date}</Text>
                  </View>
                  <Text style={styles.journalText} numberOfLines={3}>
                    {entry.text}
                  </Text>
                </Card>
              ))}
            </>
          )}

          {/* Identity Statement */}
          <Card style={styles.identityCard}>
            <Text style={styles.identityTitle}>Your Identity</Text>
            <Text style={styles.identityText}>
              "I am someone who is intentional with my energy. I invest my focus into growth, discipline, and building the life I deserve."
            </Text>
            <Text style={styles.identityNote}>
              Read this every morning. What you repeatedly tell yourself, you become.
            </Text>
          </Card>

          <View style={{ height: 32 }} />
        </Animated.View>
      </ScrollView>

      {/* Journal Modal */}
      <Modal visible={showJournal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Journal Entry</Text>
              <TouchableOpacity onPress={() => setShowJournal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Mood Selector */}
            <Text style={styles.moodLabel}>How are you feeling?</Text>
            <View style={styles.moodRow}>
              {MOOD_ICONS.map((icon, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.moodBtn,
                    selectedMood === i + 1 && { backgroundColor: MOOD_COLORS[i] + '33', borderColor: MOOD_COLORS[i] },
                  ]}
                  onPress={() => {
                    setSelectedMood(i + 1);
                    Haptics.selectionAsync();
                  }}
                >
                  <Text style={styles.moodBtnIcon}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.moodSelectedLabel, { color: MOOD_COLORS[selectedMood - 1] }]}>
              {MOOD_LABELS[selectedMood - 1]}
            </Text>

            {/* Text Input */}
            <TextInput
              style={styles.journalInput}
              placeholder="What's on your mind? What are you grateful for? What did you do well today?"
              placeholderTextColor={COLORS.textMuted}
              value={journalText}
              onChangeText={setJournalText}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <TouchableOpacity style={styles.submitBtn} onPress={submitJournal}>
              <Text style={styles.submitBtnText}>Save Entry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  content: { padding: SPACING.md },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  title: { fontSize: 26, fontWeight: '900', color: COLORS.text },
  subtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  journalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.accent + '22',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.accent + '60',
  },
  journalBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accent,
  },

  progressCard: {
    marginBottom: SPACING.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  progressPct: { fontSize: 22, fontWeight: '900' },
  progressTrack: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: RADIUS.full,
    minWidth: 4,
  },
  progressSub: { fontSize: 12, color: COLORS.textMuted },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },

  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  habitDone: {
    borderColor: COLORS.success + '40',
    backgroundColor: '#0F1F0F',
  },
  habitIcon: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitEmoji: { fontSize: 22 },
  habitInfo: { flex: 1 },
  habitTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  habitTitleDone: {
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  habitStreak: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  habitRight: {
    alignItems: 'flex-end',
    gap: SPACING.xs,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  journalCard: {
    marginBottom: SPACING.sm,
  },
  journalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  moodIcon: { fontSize: 18 },
  journalDate: { fontSize: 12, color: COLORS.textMuted },
  journalText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },

  identityCard: {
    marginTop: SPACING.lg,
    backgroundColor: '#1A0A2E',
    borderWidth: 1,
    borderColor: COLORS.accent + '40',
  },
  identityTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.accentLight,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  identityText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: SPACING.sm,
  },
  identityNote: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  // Modal
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
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
  },
  moodLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  moodRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  moodBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  moodBtnIcon: { fontSize: 22 },
  moodSelectedLabel: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  journalInput: {
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 120,
    marginBottom: SPACING.md,
  },
  submitBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: RADIUS.full,
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
});

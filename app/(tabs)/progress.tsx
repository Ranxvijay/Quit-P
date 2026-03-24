import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/src/store/useStore';
import Card from '@/src/components/Card';
import { COLORS, SPACING, RADIUS } from '@/src/constants/theme';
import { BENEFITS, getNextBenefit } from '@/src/constants/benefits';

const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function ProgressScreen() {
  const store = useStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const weeklyData = store.getWeeklyHabitData();
  const nextBenefit = getNextBenefit(store.currentStreak);

  const totalDaysClean = store.currentStreak;
  const successRate = store.relapses > 0
    ? Math.round((totalDaysClean / (totalDaysClean + store.relapses * 7)) * 100)
    : 100;

  const maxBarVal = Math.max(...weeklyData.map((d) => d.completed), 1);

  const avgFocusPerDay = store.focusSessions.length > 0
    ? Math.round(store.totalFocusMinutes / Math.max(store.currentStreak, 1))
    : 0;

  const shareProgress = () => {
    Alert.alert(
      'Share Progress',
      `My FreedomPath stats:\n🔥 ${store.currentStreak} day streak\n🏆 Best: ${store.longestStreak} days\n⏱️ ${store.totalFocusMinutes} focus minutes\n\nJoining the journey of freedom!`
    );
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
            <Text style={styles.title}>Progress</Text>
            <TouchableOpacity style={styles.shareBtn} onPress={shareProgress}>
              <Ionicons name="share-outline" size={18} color={COLORS.accent} />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Your journey in numbers</Text>

          {/* Main Stats */}
          <View style={styles.mainStats}>
            <Card style={[styles.bigStatCard, { borderColor: COLORS.accent + '60' }]} variant="bordered">
              <Text style={styles.bigStatIcon}>🔥</Text>
              <Text style={[styles.bigStatNum, { color: COLORS.accent }]}>{store.currentStreak}</Text>
              <Text style={styles.bigStatLabel}>Current Streak</Text>
            </Card>
            <Card style={[styles.bigStatCard, { borderColor: COLORS.gold + '60' }]} variant="bordered">
              <Text style={styles.bigStatIcon}>🏆</Text>
              <Text style={[styles.bigStatNum, { color: COLORS.gold }]}>{store.longestStreak}</Text>
              <Text style={styles.bigStatLabel}>Best Streak</Text>
            </Card>
          </View>

          {/* Secondary Stats */}
          <View style={styles.secStats}>
            <Card style={styles.secCard}>
              <Ionicons name="timer" size={18} color={COLORS.warning} />
              <Text style={styles.secNum}>{store.totalFocusMinutes}</Text>
              <Text style={styles.secLabel}>Focus Mins</Text>
            </Card>
            <Card style={styles.secCard}>
              <Ionicons name="trending-up" size={18} color={COLORS.success} />
              <Text style={styles.secNum}>{successRate}%</Text>
              <Text style={styles.secLabel}>Success Rate</Text>
            </Card>
            <Card style={styles.secCard}>
              <Ionicons name="flash" size={18} color={COLORS.accent} />
              <Text style={styles.secNum}>{avgFocusPerDay}</Text>
              <Text style={styles.secLabel}>Avg Focus/Day</Text>
            </Card>
            <Card style={styles.secCard}>
              <Ionicons name="refresh-circle" size={18} color={COLORS.danger} />
              <Text style={styles.secNum}>{store.relapses}</Text>
              <Text style={styles.secLabel}>Relapses</Text>
            </Card>
          </View>

          {/* Weekly Habit Chart */}
          <Card style={styles.chartCard}>
            <Text style={styles.chartTitle}>Weekly Habits</Text>
            <View style={styles.barChart}>
              {weeklyData.map((day, i) => {
                const height = maxBarVal > 0
                  ? Math.max((day.completed / maxBarVal) * 100, 4)
                  : 4;
                const today = new Date();
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                const isToday = date.toDateString() === today.toDateString();
                return (
                  <View key={i} style={styles.barWrapper}>
                    <View style={styles.barOuter}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${height}%`,
                            backgroundColor: isToday ? COLORS.accent : COLORS.success,
                            opacity: isToday ? 1 : 0.6,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.barLabel, isToday && { color: COLORS.accent }]}>
                      {WEEK_DAYS[i]}
                    </Text>
                    <Text style={styles.barNum}>{day.completed}</Text>
                  </View>
                );
              })}
            </View>
            <Text style={styles.chartLegend}>
              Habits completed per day (max: {store.habits.length})
            </Text>
          </Card>

          {/* Benefits Timeline */}
          <Text style={styles.sectionTitle}>Benefits Timeline</Text>
          <View style={styles.timeline}>
            {BENEFITS.map((benefit, index) => {
              const unlocked = store.currentStreak >= benefit.day;
              const isNext = !unlocked && getNextBenefit(store.currentStreak)?.day === benefit.day;
              const isCurrent = Math.abs(store.currentStreak - benefit.day) < 5 && !unlocked;
              return (
                <View key={benefit.day} style={styles.timelineRow}>
                  {/* Line */}
                  <View style={styles.timelineLine}>
                    <View
                      style={[
                        styles.timelineDot,
                        unlocked && { backgroundColor: COLORS.success },
                        isNext && { backgroundColor: COLORS.gold, transform: [{ scale: 1.3 }] },
                        !unlocked && !isNext && { backgroundColor: COLORS.border },
                      ]}
                    >
                      {unlocked && (
                        <Ionicons name="checkmark" size={10} color="#fff" />
                      )}
                    </View>
                    {index < BENEFITS.length - 1 && (
                      <View
                        style={[
                          styles.timelineConnector,
                          { backgroundColor: unlocked ? COLORS.success : COLORS.border },
                        ]}
                      />
                    )}
                  </View>

                  {/* Content */}
                  <View
                    style={[
                      styles.timelineContent,
                      isNext && styles.timelineContentNext,
                    ]}
                  >
                    <View style={styles.timelineHeader}>
                      <Text style={styles.timelineIcon}>{benefit.icon}</Text>
                      <Text style={[styles.timelineDay, unlocked && { color: COLORS.success }]}>
                        Day {benefit.day}
                      </Text>
                      {isNext && (
                        <View style={styles.nextBadge}>
                          <Text style={styles.nextBadgeText}>NEXT</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.timelineTitle, !unlocked && !isNext && styles.dimText]}>
                      {benefit.title}
                    </Text>
                    {(unlocked || isNext) && (
                      <Text style={styles.timelineDesc} numberOfLines={2}>
                        {benefit.description}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* Motivation Footer */}
          <Card style={styles.footerCard}>
            <Text style={styles.footerTitle}>The Science</Text>
            <Text style={styles.footerText}>
              Every day you abstain, your dopamine receptors become more sensitive — making real
              life more enjoyable, social connections more meaningful, and focus sharper. You are
              literally rebuilding your brain.
            </Text>
            <Text style={styles.footerRef}>
              Source: Kühn & Gallinat (2014), Cambridge Neuroscience
            </Text>
          </Card>

          <View style={{ height: 32 }} />
        </Animated.View>
      </ScrollView>
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
    alignItems: 'center',
    marginBottom: 4,
  },
  title: { fontSize: 26, fontWeight: '900', color: COLORS.text },
  shareBtn: {
    backgroundColor: COLORS.card,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  subtitle: { fontSize: 13, color: COLORS.textMuted, marginBottom: SPACING.lg },

  mainStats: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  bigStatCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  bigStatIcon: { fontSize: 28, marginBottom: 4 },
  bigStatNum: { fontSize: 40, fontWeight: '900' },
  bigStatLabel: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600', marginTop: 4 },

  secStats: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  secCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    gap: 2,
  },
  secNum: { fontSize: 18, fontWeight: '900', color: COLORS.text },
  secLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600', textAlign: 'center' },

  chartCard: {
    marginBottom: SPACING.lg,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barOuter: {
    width: '100%',
    height: 80,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: RADIUS.sm,
  },
  barLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '700',
    marginTop: 4,
  },
  barNum: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  chartLegend: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
  },

  timeline: {
    marginBottom: SPACING.lg,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  timelineLine: {
    width: 32,
    alignItems: 'center',
  },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    minHeight: 20,
    marginVertical: 2,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginLeft: SPACING.sm,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timelineContentNext: {
    borderColor: COLORS.gold,
    backgroundColor: '#1F1A0E',
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: 2,
  },
  timelineIcon: { fontSize: 16 },
  timelineDay: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  nextBadge: {
    backgroundColor: COLORS.gold + '33',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  nextBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.gold,
    letterSpacing: 1,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  dimText: { opacity: 0.4 },
  timelineDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },

  footerCard: {
    backgroundColor: '#0D1F0D',
    borderWidth: 1,
    borderColor: COLORS.success + '40',
  },
  footerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.success,
    marginBottom: SPACING.sm,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  footerRef: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
});

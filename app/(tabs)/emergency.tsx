import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, RADIUS } from '@/src/constants/theme';
import {
  COPING_TOOLS,
  URGE_ACTIVITIES,
  EMERGENCY_AFFIRMATIONS,
} from '@/src/constants/coping';
import Card from '@/src/components/Card';

export default function EmergencyScreen() {
  const [activeAffirmation, setActiveAffirmation] = useState(0);
  const [urgeSurfing, setUrgeSurfing] = useState(false);
  const [urgeSeconds, setUrgeSeconds] = useState(600); // 10 min
  const [urgeActive, setUrgeActive] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    startPulse();
  }, []);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  };

  const startUrgeTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setUrgeActive(true);
    setUrgeSeconds(600);
    timerRef.current = setInterval(() => {
      setUrgeSeconds((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          setUrgeActive(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert(
            "You Survived! 🏆",
            "10 minutes passed. The urge has weakened. You are stronger than it.",
            [{ text: "I Win" }]
          );
          return 600;
        }
        return s - 1;
      });
    }, 1000);
  };

  const stopUrgeTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setUrgeActive(false);
    setUrgeSeconds(600);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const nextAffirmation = () => {
    Haptics.selectionAsync();
    setActiveAffirmation((i) => (i + 1) % EMERGENCY_AFFIRMATIONS.length);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
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
            <Ionicons name="shield" size={28} color={COLORS.danger} />
            <Text style={styles.title}>Emergency SOS</Text>
          </View>
          <Text style={styles.headerSub}>
            You're feeling an urge. That's okay. Here are tools to get through it.
          </Text>

          {/* Affirmation Card */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={styles.affirmationCard}
              onPress={nextAffirmation}
              activeOpacity={0.9}
            >
              <Text style={styles.affirmationText}>
                {EMERGENCY_AFFIRMATIONS[activeAffirmation]}
              </Text>
              <Text style={styles.affirmationHint}>Tap for next affirmation</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* 10-Minute Urge Surfer */}
          <Card style={styles.urgeCard} variant="elevated">
            <View style={styles.urgeSectionHeader}>
              <Text style={styles.urgeSectionTitle}>⏱️ Urge Surfer</Text>
              <Text style={styles.urgeSectionSub}>
                Urges peak at 10 min then drop sharply
              </Text>
            </View>

            {urgeActive ? (
              <View style={styles.timerDisplay}>
                <Text style={styles.timerText}>{formatTime(urgeSeconds)}</Text>
                <Text style={styles.timerLabel}>Hang on... you're almost through it</Text>
                <TouchableOpacity style={styles.stopBtn} onPress={stopUrgeTimer}>
                  <Text style={styles.stopBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.startUrgeBtn} onPress={startUrgeTimer}>
                <Ionicons name="timer" size={20} color="#fff" />
                <Text style={styles.startUrgeBtnText}>Start 10-Minute Timer</Text>
              </TouchableOpacity>
            )}
          </Card>

          {/* Coping Tools Grid */}
          <Text style={styles.sectionTitle}>Instant Coping Tools</Text>
          <View style={styles.toolsGrid}>
            {COPING_TOOLS.map((tool) => (
              <TouchableOpacity
                key={tool.id}
                style={[styles.toolCard, { borderColor: tool.color + '60' }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  if (tool.id === 'breathing') {
                    Alert.alert(
                      '4-7-8 Breathing',
                      '1. Inhale through nose for 4 seconds\n2. Hold breath for 7 seconds\n3. Exhale through mouth for 8 seconds\n\nRepeat 4 times. This activates the parasympathetic nervous system.',
                      [{ text: 'Got it' }]
                    );
                  } else if (tool.id === 'cold') {
                    Alert.alert(
                      'Cold Shower Protocol',
                      'Go to your bathroom NOW. Turn on cold water. Step in. Stay for at least 2 minutes.\n\nCold water is the single most effective urge killer known. Your body cannot maintain arousal while cold.',
                      [{ text: 'Going now' }]
                    );
                  } else {
                    Alert.alert(tool.title, tool.subtitle, [{ text: 'Do it now' }]);
                  }
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.toolIcon, { backgroundColor: tool.color + '22' }]}>
                  <Ionicons name={tool.icon as any} size={24} color={tool.color} />
                </View>
                <Text style={styles.toolTitle}>{tool.title}</Text>
                <Text style={styles.toolSub}>{tool.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Activity List */}
          <Text style={styles.sectionTitle}>What to Do Right Now</Text>
          {URGE_ACTIVITIES.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              style={styles.activityCard}
              onPress={() => {
                Haptics.selectionAsync();
                Alert.alert(activity.title, activity.description, [
                  { text: 'Doing it now 💪' },
                ]);
              }}
            >
              <View style={styles.activityLeft}>
                <Text style={styles.activityIcon}>{activity.icon}</Text>
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityDesc} numberOfLines={2}>
                  {activity.description}
                </Text>
              </View>
              <View style={styles.activityDuration}>
                <Text style={styles.durationText}>{activity.duration}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* Remember Section */}
          <Card style={styles.rememberCard} variant="bordered">
            <Text style={styles.rememberTitle}>🧠 Remember</Text>
            <Text style={styles.rememberItem}>
              • An urge is just dopamine looking for a shortcut. It ALWAYS passes.
            </Text>
            <Text style={styles.rememberItem}>
              • The average urge lasts 10-20 minutes at peak intensity.
            </Text>
            <Text style={styles.rememberItem}>
              • Every urge you survive makes the next one weaker.
            </Text>
            <Text style={styles.rememberItem}>
              • You are not fighting porn. You are building a better version of yourself.
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
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.danger,
  },
  headerSub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },

  affirmationCard: {
    backgroundColor: '#1A0A2E',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.accent + '60',
  },
  affirmationText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: SPACING.md,
  },
  affirmationHint: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  urgeCard: {
    marginBottom: SPACING.lg,
  },
  urgeSectionHeader: { marginBottom: SPACING.md },
  urgeSectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },
  urgeSectionSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  timerDisplay: { alignItems: 'center' },
  timerText: {
    fontSize: 64,
    fontWeight: '900',
    color: COLORS.accent,
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  stopBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
  },
  stopBtnText: {
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  startUrgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
    paddingVertical: 14,
  },
  startUrgeBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },

  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  toolCard: {
    width: '47%',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    gap: SPACING.xs,
  },
  toolIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  toolTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  toolSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 15,
  },

  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activityLeft: {
    marginRight: SPACING.sm,
  },
  activityIcon: { fontSize: 28 },
  activityContent: { flex: 1 },
  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  activityDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  activityDuration: {
    backgroundColor: COLORS.accent + '22',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginLeft: SPACING.sm,
  },
  durationText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accentLight,
  },

  rememberCard: {
    marginTop: SPACING.md,
  },
  rememberTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  rememberItem: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 6,
  },
});

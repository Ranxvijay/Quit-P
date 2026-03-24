import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useStore } from '@/src/store/useStore';
import Card from '@/src/components/Card';
import { COLORS, SPACING, RADIUS } from '@/src/constants/theme';

type TimerMode = 'work' | 'short_break' | 'long_break';

interface TimerPreset {
  mode: TimerMode;
  label: string;
  minutes: number;
  color: string;
  icon: string;
}

const PRESETS: TimerPreset[] = [
  { mode: 'work', label: 'Deep Work', minutes: 25, color: COLORS.accent, icon: 'flame' },
  { mode: 'short_break', label: 'Short Break', minutes: 5, color: COLORS.success, icon: 'leaf' },
  { mode: 'long_break', label: 'Long Break', minutes: 15, color: COLORS.warning, icon: 'sunny' },
];

const CUSTOM_PRESETS = [10, 20, 25, 30, 45, 60, 90];

const FOCUS_TIPS = [
  { icon: '📵', tip: 'Put your phone face-down or in another room.' },
  { icon: '🎵', tip: 'Use brown noise or lo-fi music to block distractions.' },
  { icon: '💧', tip: 'Have water within reach. Dehydration kills focus.' },
  { icon: '🚫', tip: 'Close all tabs except what you\'re working on.' },
  { icon: '📋', tip: 'Write down ONE thing to accomplish this session.' },
  { icon: '🏃', tip: 'Take a quick walk between sessions to reset.' },
];

export default function FocusScreen() {
  const store = useStore();
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [customMinutes, setCustomMinutes] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(PRESETS[0].minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'running' | 'paused' | 'done'>('idle');

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ringAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const totalSeconds = (customMinutes ?? selectedPreset.minutes) * 60;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  // Ring animation
  const progress = 1 - secondsLeft / totalSeconds;
  useEffect(() => {
    Animated.timing(ringAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const startTimer = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRunning(true);
    setPhase('running');
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          setPhase('done');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  const pauseTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setPhase('paused');
    Haptics.selectionAsync();
  };

  const resumeTimer = () => {
    startTimer();
    setPhase('running');
  };

  const resetTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setPhase('idle');
    setSecondsLeft(totalSeconds);
  };

  const finishSession = () => {
    const minutes = customMinutes ?? selectedPreset.minutes;
    const type = selectedPreset.mode === 'work' ? 'work' : 'break';
    store.recordFocusSession(minutes, type);
    if (type === 'work') setSessionCount((c) => c + 1);
    setPhase('idle');
    setSecondsLeft(totalSeconds);
    Alert.alert(
      sessionCount + 1 >= 4 && type === 'work'
        ? 'Time for a long break! 🌟' : type === 'work' ? 'Session complete! 🎯' : 'Break over!',
      type === 'work'
        ? `Great work! ${minutes} minutes of focused time logged. ${sessionCount + 1} sessions today.`
        : 'Ready to focus again?',
      [{ text: 'Continue' }]
    );
  };

  const selectPreset = (preset: TimerPreset) => {
    resetTimer();
    setSelectedPreset(preset);
    setCustomMinutes(null);
    setSecondsLeft(preset.minutes * 60);
  };

  const selectCustom = (mins: number) => {
    resetTimer();
    setCustomMinutes(mins);
    setSecondsLeft(mins * 60);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const activeColor = selectedPreset.color;
  const totalMinutesToday = store.focusSessions
    .filter((s) => s.date === new Date().toISOString().split('T')[0] && s.type === 'work')
    .reduce((sum, s) => sum + s.duration, 0);

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
            <Text style={styles.title}>Focus Timer</Text>
            <View style={styles.todayStats}>
              <Ionicons name="flame" size={14} color={COLORS.gold} />
              <Text style={styles.todayText}>{totalMinutesToday} min today</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            Build deep work habits. Channel your energy into creating.
          </Text>

          {/* Mode Selector */}
          <View style={styles.modeRow}>
            {PRESETS.map((preset) => (
              <TouchableOpacity
                key={preset.mode}
                style={[
                  styles.modeBtn,
                  selectedPreset.mode === preset.mode &&
                    !customMinutes && { backgroundColor: preset.color + '22', borderColor: preset.color },
                ]}
                onPress={() => selectPreset(preset)}
              >
                <Ionicons
                  name={preset.icon as any}
                  size={14}
                  color={selectedPreset.mode === preset.mode && !customMinutes ? preset.color : COLORS.textMuted}
                />
                <Text
                  style={[
                    styles.modeBtnText,
                    selectedPreset.mode === preset.mode && !customMinutes && { color: preset.color },
                  ]}
                >
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Timer Display */}
          <View style={styles.timerContainer}>
            {/* SVG Ring via View simulation */}
            <View style={[styles.timerRing, { borderColor: activeColor + '30' }]}>
              <View style={styles.timerInner}>
                <Text style={[styles.timerText, { color: activeColor }]}>
                  {formatTime(secondsLeft)}
                </Text>
                <Text style={styles.timerMode}>
                  {customMinutes ? `${customMinutes} min custom` : selectedPreset.label}
                </Text>
                {sessionCount > 0 && (
                  <View style={styles.sessionDots}>
                    {Array.from({ length: Math.min(sessionCount, 4) }).map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.dot,
                          { backgroundColor: i < sessionCount ? activeColor : COLORS.border },
                        ]}
                      />
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            {phase === 'idle' && (
              <TouchableOpacity
                style={[styles.mainBtn, { backgroundColor: activeColor }]}
                onPress={startTimer}
              >
                <Ionicons name="play" size={22} color="#fff" />
                <Text style={styles.mainBtnText}>Start Focus</Text>
              </TouchableOpacity>
            )}
            {phase === 'running' && (
              <View style={styles.runningControls}>
                <TouchableOpacity style={styles.secondaryBtn} onPress={pauseTimer}>
                  <Ionicons name="pause" size={20} color={activeColor} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.mainBtn, { backgroundColor: activeColor, flex: 1 }]}
                  onPress={finishSession}
                >
                  <Ionicons name="checkmark" size={22} color="#fff" />
                  <Text style={styles.mainBtnText}>Finish Session</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryBtn} onPress={resetTimer}>
                  <Ionicons name="refresh" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            )}
            {phase === 'paused' && (
              <View style={styles.runningControls}>
                <TouchableOpacity style={styles.secondaryBtn} onPress={resetTimer}>
                  <Ionicons name="refresh" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.mainBtn, { backgroundColor: activeColor, flex: 1 }]}
                  onPress={resumeTimer}
                >
                  <Ionicons name="play" size={22} color="#fff" />
                  <Text style={styles.mainBtnText}>Resume</Text>
                </TouchableOpacity>
              </View>
            )}
            {phase === 'done' && (
              <TouchableOpacity
                style={[styles.mainBtn, { backgroundColor: COLORS.success }]}
                onPress={finishSession}
              >
                <Ionicons name="checkmark-circle" size={22} color="#fff" />
                <Text style={styles.mainBtnText}>Complete Session! 🎯</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Custom Duration */}
          <View style={styles.customSection}>
            <Text style={styles.customLabel}>Custom Duration</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.customRow}>
                {CUSTOM_PRESETS.map((mins) => (
                  <TouchableOpacity
                    key={mins}
                    style={[
                      styles.customBtn,
                      customMinutes === mins && { backgroundColor: activeColor + '22', borderColor: activeColor },
                    ]}
                    onPress={() => selectCustom(mins)}
                  >
                    <Text
                      style={[
                        styles.customBtnText,
                        customMinutes === mins && { color: activeColor },
                      ]}
                    >
                      {mins}m
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Text style={styles.statNum}>{sessionCount}</Text>
              <Text style={styles.statLbl}>Sessions{'\n'}Today</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statNum}>{totalMinutesToday}</Text>
              <Text style={styles.statLbl}>Focus{'\n'}Minutes</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statNum}>{store.totalFocusMinutes}</Text>
              <Text style={styles.statLbl}>Total{'\n'}Minutes</Text>
            </Card>
          </View>

          {/* Focus Tips */}
          <Text style={styles.sectionTitle}>Focus Tips</Text>
          {FOCUS_TIPS.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipIcon}>{tip.icon}</Text>
              <Text style={styles.tipText}>{tip.tip}</Text>
            </View>
          ))}

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
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.text,
  },
  todayStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.card,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  todayText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gold,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
  },

  modeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  modeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },

  timerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  timerRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
  },
  timerInner: { alignItems: 'center' },
  timerText: {
    fontSize: 52,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  timerMode: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 4,
  },
  sessionDots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: SPACING.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  controls: {
    marginBottom: SPACING.lg,
  },
  mainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: 16,
    borderRadius: RADIUS.full,
  },
  mainBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  runningControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  secondaryBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  customSection: {
    marginBottom: SPACING.lg,
  },
  customLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  customRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingBottom: 4,
  },
  customBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  customBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
  },

  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  statNum: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.accent,
  },
  statLbl: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 15,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tipIcon: { fontSize: 20 },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});

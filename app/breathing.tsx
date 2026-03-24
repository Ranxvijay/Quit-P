import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING } from '@/src/constants/theme';

type Phase = 'idle' | 'inhale' | 'hold' | 'exhale' | 'rest';

const PHASES: { phase: Phase; duration: number; label: string; color: string }[] = [
  { phase: 'inhale', duration: 4, label: 'Inhale', color: '#6C63FF' },
  { phase: 'hold', duration: 7, label: 'Hold', color: '#FFD700' },
  { phase: 'exhale', duration: 8, label: 'Exhale', color: '#4CAF50' },
  { phase: 'rest', duration: 0, label: 'Rest', color: '#00B4D8' },
];

export default function BreathingScreen() {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.5)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  const MAX_CYCLES = 4;
  const phase = PHASES[currentPhaseIndex];

  const runAnimation = (p: typeof PHASES[0]) => {
    if (animRef.current) animRef.current.stop();
    if (p.phase === 'inhale') {
      animRef.current = Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 1.6, duration: p.duration * 1000, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: p.duration * 1000, useNativeDriver: true }),
      ]);
    } else if (p.phase === 'hold') {
      animRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.65, duration: 500, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1.6, duration: 500, useNativeDriver: true }),
        ]),
        { iterations: Math.ceil(p.duration / 1) }
      );
    } else if (p.phase === 'exhale') {
      animRef.current = Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 1, duration: p.duration * 1000, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0.5, duration: p.duration * 1000, useNativeDriver: true }),
      ]);
    }
    animRef.current?.start();
  };

  const startBreathing = () => {
    setRunning(true);
    setCurrentPhaseIndex(0);
    setSecondsLeft(PHASES[0].duration);
    setCycle(0);
    setDone(false);
    runAnimation(PHASES[0]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          // Move to next phase
          setCurrentPhaseIndex((idx) => {
            const nextIdx = (idx + 1) % PHASES.length;
            const nextPhase = PHASES[nextIdx];
            if (nextIdx === 0) {
              setCycle((c) => {
                const newCycle = c + 1;
                if (newCycle >= MAX_CYCLES) {
                  clearInterval(timerRef.current!);
                  setRunning(false);
                  setDone(true);
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
                return newCycle;
              });
            }
            runAnimation(nextPhase);
            return nextIdx;
          });
          return PHASES[(currentPhaseIndex + 1) % PHASES.length].duration;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running, currentPhaseIndex]);

  const stopBreathing = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animRef.current) animRef.current.stop();
    setRunning(false);
    scaleAnim.setValue(1);
    opacityAnim.setValue(0.5);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { stopBreathing(); router.back(); }}>
          <Ionicons name="chevron-down" size={28} color={COLORS.textMuted} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Box Breathing</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        {/* Breathing Circle */}
        <View style={styles.circleContainer}>
          <Animated.View
            style={[
              styles.outerCircle,
              {
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
                borderColor: phase.color,
                backgroundColor: phase.color + '11',
              },
            ]}
          />
          <View style={[styles.innerCircle, { borderColor: phase.color }]}>
            <Text style={[styles.phaseLabel, { color: phase.color }]}>
              {running || done ? phase.label : 'Ready'}
            </Text>
            {running && (
              <Text style={styles.phaseSeconds}>{secondsLeft}</Text>
            )}
            {!running && !done && (
              <Text style={styles.startHint}>Tap to begin</Text>
            )}
            {done && <Text style={styles.doneText}>✓</Text>}
          </View>
        </View>

        {/* Cycle dots */}
        <View style={styles.cycleDots}>
          {Array.from({ length: MAX_CYCLES }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.cycleDot,
                i < cycle && { backgroundColor: COLORS.success },
                i === cycle && running && { backgroundColor: phase.color },
              ]}
            />
          ))}
        </View>

        {/* Phase guide */}
        <View style={styles.phaseGuide}>
          {[
            { label: 'Inhale', seconds: 4, color: '#6C63FF' },
            { label: 'Hold', seconds: 7, color: '#FFD700' },
            { label: 'Exhale', seconds: 8, color: '#4CAF50' },
          ].map((p) => (
            <View key={p.label} style={styles.phaseGuideItem}>
              <View style={[styles.phaseGuideDot, { backgroundColor: p.color }]} />
              <Text style={styles.phaseGuideLabel}>{p.label}</Text>
              <Text style={styles.phaseGuideSec}>{p.seconds}s</Text>
            </View>
          ))}
        </View>

        {/* Info */}
        <Text style={styles.infoText}>
          This 4-7-8 breathing technique activates the parasympathetic nervous system, reducing anxiety and urge intensity within 2-4 minutes.
        </Text>

        {/* Controls */}
        {done ? (
          <View style={styles.doneContainer}>
            <Text style={styles.doneTitle}>Exercise Complete 🎉</Text>
            <Text style={styles.doneBody}>
              Your nervous system is calmer now. The urge should be significantly weaker.
            </Text>
            <TouchableOpacity style={styles.startBtn} onPress={startBreathing}>
              <Text style={styles.startBtnText}>Do Another Round</Text>
            </TouchableOpacity>
          </View>
        ) : !running ? (
          <TouchableOpacity style={[styles.startBtn, { backgroundColor: COLORS.accent }]} onPress={startBreathing}>
            <Ionicons name="play" size={20} color="#fff" />
            <Text style={styles.startBtnText}>Start Breathing</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopBtn} onPress={stopBreathing}>
            <Text style={styles.stopBtnText}>Stop</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },

  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
  },

  circleContainer: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  outerCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
  },
  innerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  phaseLabel: {
    fontSize: 20,
    fontWeight: '800',
  },
  phaseSeconds: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.text,
    marginTop: 4,
  },
  startHint: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  doneText: { fontSize: 36 },

  cycleDots: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  cycleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.border,
  },

  phaseGuide: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  phaseGuideItem: {
    alignItems: 'center',
    gap: 4,
  },
  phaseGuideDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  phaseGuideLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  phaseGuideSec: {
    fontSize: 11,
    color: COLORS.textMuted,
  },

  infoText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: SPACING.xl,
  },

  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 999,
  },
  startBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  stopBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 999,
  },
  stopBtnText: { color: COLORS.textMuted, fontWeight: '700', fontSize: 15 },

  doneContainer: { alignItems: 'center', gap: SPACING.sm },
  doneTitle: { fontSize: 22, fontWeight: '900', color: COLORS.text },
  doneBody: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
});

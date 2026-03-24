import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '@/src/constants/theme';

interface Props {
  days: number;
  size?: number;
  strokeWidth?: number;
  milestone?: number; // next milestone (e.g. 30, 90)
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function StreakRing({ days, size = 220, strokeWidth = 14, milestone = 30 }: Props) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(days / milestone, 1);

  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: progress,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const strokeDashoffset = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const cx = size / 2;
  const cy = size / 2;

  // Color changes based on streak length
  let ringColor = COLORS.accent;
  if (days >= 90) ringColor = '#FFD700';
  else if (days >= 30) ringColor = '#4CAF50';
  else if (days >= 7) ringColor = '#00B4D8';

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Track */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={COLORS.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress */}
        <AnimatedCircle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          rotation="-90"
          origin={`${cx}, ${cy}`}
        />
      </Svg>

      {/* Center Content */}
      <View style={[styles.center, { width: size, height: size }]}>
        <Text style={styles.daysNumber}>{days}</Text>
        <Text style={styles.daysLabel}>{days === 1 ? 'DAY' : 'DAYS'}</Text>
        <Text style={styles.statusLabel}>
          {days === 0 ? 'Start Today' : days >= 90 ? 'REWIRED 🏆' : days >= 30 ? 'THRIVING 🌟' : days >= 7 ? 'BUILDING 💪' : 'FIGHTING ⚔️'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysNumber: {
    fontSize: 64,
    fontWeight: '900',
    color: COLORS.text,
    lineHeight: 72,
  },
  daysLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 4,
    marginTop: -4,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accentLight,
    marginTop: 8,
    letterSpacing: 1,
  },
});

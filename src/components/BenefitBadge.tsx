import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Benefit } from '@/src/constants/benefits';
import { COLORS, RADIUS, SPACING } from '@/src/constants/theme';

interface Props {
  benefit: Benefit;
  unlocked: boolean;
  isNext?: boolean;
}

const CATEGORY_COLORS: Record<Benefit['category'], string> = {
  mental: '#6C63FF',
  physical: '#4CAF50',
  social: '#00B4D8',
  spiritual: '#FFD700',
};

export default function BenefitBadge({ benefit, unlocked, isNext }: Props) {
  return (
    <View
      style={[
        styles.container,
        unlocked && styles.unlocked,
        isNext && styles.next,
        !unlocked && !isNext && styles.locked,
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.icon, !unlocked && !isNext && styles.dimmed]}>
          {unlocked ? benefit.icon : isNext ? benefit.icon : '🔒'}
        </Text>
        <View
          style={[
            styles.dayBadge,
            { backgroundColor: unlocked ? CATEGORY_COLORS[benefit.category] : COLORS.border },
          ]}
        >
          <Text style={styles.dayText}>Day {benefit.day}</Text>
        </View>
      </View>
      <Text style={[styles.title, !unlocked && !isNext && styles.dimmed]}>
        {benefit.title}
      </Text>
      {(unlocked || isNext) && (
        <Text style={styles.description} numberOfLines={2}>
          {benefit.description}
        </Text>
      )}
      {isNext && (
        <Text style={styles.nextLabel}>NEXT UNLOCK</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  unlocked: {
    borderColor: COLORS.accentDark,
    backgroundColor: '#1A1A2E',
  },
  next: {
    borderColor: COLORS.gold,
    borderStyle: 'dashed',
    backgroundColor: '#1F1A0E',
  },
  locked: {
    opacity: 0.4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  icon: {
    fontSize: 28,
  },
  dimmed: {
    opacity: 0.4,
  },
  dayBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  dayText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  nextLabel: {
    marginTop: 8,
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.gold,
    letterSpacing: 2,
  },
});

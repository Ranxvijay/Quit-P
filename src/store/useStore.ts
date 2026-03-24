import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Types ──────────────────────────────────────────────────────────────────

export interface HabitEntry {
  id: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface Habit {
  id: string;
  title: string;
  icon: string;
  color: string;
  entries: HabitEntry[];
}

export interface JournalEntry {
  id: string;
  date: string;
  text: string;
  mood: number; // 1-5
}

export interface FocusSession {
  id: string;
  date: string;
  duration: number; // minutes
  type: 'work' | 'break';
}

export interface AppState {
  startDate: string | null;          // ISO string when journey started
  currentStreak: number;
  longestStreak: number;
  relapses: number;
  habits: Habit[];
  journalEntries: JournalEntry[];
  focusSessions: FocusSession[];
  totalFocusMinutes: number;
  notificationsEnabled: boolean;
  dailyCheckInDone: boolean;
  lastCheckInDate: string | null;
}

// ── Storage Keys ──────────────────────────────────────────────────────────

const KEYS = {
  STATE: '@freedom_path_state',
} as const;

// ── Default Habits ────────────────────────────────────────────────────────

const DEFAULT_HABITS: Habit[] = [
  { id: '1', title: 'Exercise / Move', icon: '🏃', color: '#4CAF50', entries: [] },
  { id: '2', title: 'Cold Shower', icon: '🚿', color: '#00B4D8', entries: [] },
  { id: '3', title: 'Meditate', icon: '🧘', color: '#6C63FF', entries: [] },
  { id: '4', title: 'Read 30 min', icon: '📚', color: '#FFA502', entries: [] },
  { id: '5', title: 'No social media before 10am', icon: '📵', color: '#FF6B81', entries: [] },
  { id: '6', title: 'Get 7+ hours sleep', icon: '😴', color: '#2ED573', entries: [] },
];

const DEFAULT_STATE: AppState = {
  startDate: null,
  currentStreak: 0,
  longestStreak: 0,
  relapses: 0,
  habits: DEFAULT_HABITS,
  journalEntries: [],
  focusSessions: [],
  totalFocusMinutes: 0,
  notificationsEnabled: false,
  dailyCheckInDone: false,
  lastCheckInDate: null,
};

// ── Helpers ───────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 86400000;
  return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / msPerDay);
}

function computeStreak(startDate: string | null): number {
  if (!startDate) return 0;
  const days = daysBetween(startDate, todayStr());
  return Math.max(0, days);
}

// ── Hook ──────────────────────────────────────────────────────────────────

export function useStore() {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEYS.STATE);
        if (raw) {
          const parsed: AppState = JSON.parse(raw);
          // Recompute streak on load
          parsed.currentStreak = computeStreak(parsed.startDate);
          // Check daily check-in reset
          if (parsed.lastCheckInDate !== todayStr()) {
            parsed.dailyCheckInDone = false;
          }
          setState(parsed);
        }
      } catch (e) {
        console.warn('Failed to load state', e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // Persist whenever state changes
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(KEYS.STATE, JSON.stringify(state)).catch(() => {});
  }, [state, loaded]);

  // ── Actions ─────────────────────────────────────────────────────────────

  const startJourney = useCallback(() => {
    setState((prev) => ({
      ...prev,
      startDate: new Date().toISOString(),
      currentStreak: 0,
    }));
  }, []);

  const resetStreak = useCallback((note?: string) => {
    setState((prev) => ({
      ...prev,
      startDate: new Date().toISOString(),
      currentStreak: 0,
      relapses: prev.relapses + 1,
      journalEntries: note
        ? [
            {
              id: Date.now().toString(),
              date: todayStr(),
              text: `Relapse note: ${note}`,
              mood: 1,
            },
            ...prev.journalEntries,
          ]
        : prev.journalEntries,
    }));
  }, []);

  const completeHabit = useCallback((habitId: string) => {
    const today = todayStr();
    setState((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => {
        if (h.id !== habitId) return h;
        const alreadyDone = h.entries.some((e) => e.date === today && e.completed);
        if (alreadyDone) return h;
        return {
          ...h,
          entries: [
            ...h.entries,
            { id: Date.now().toString(), date: today, completed: true },
          ],
        };
      }),
    }));
  }, []);

  const uncompleteHabit = useCallback((habitId: string) => {
    const today = todayStr();
    setState((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => {
        if (h.id !== habitId) return h;
        return {
          ...h,
          entries: h.entries.filter((e) => e.date !== today),
        };
      }),
    }));
  }, []);

  const addJournalEntry = useCallback((text: string, mood: number) => {
    setState((prev) => ({
      ...prev,
      journalEntries: [
        {
          id: Date.now().toString(),
          date: todayStr(),
          text,
          mood,
        },
        ...prev.journalEntries,
      ],
    }));
  }, []);

  const recordFocusSession = useCallback((duration: number, type: 'work' | 'break') => {
    setState((prev) => ({
      ...prev,
      focusSessions: [
        {
          id: Date.now().toString(),
          date: todayStr(),
          duration,
          type,
        },
        ...prev.focusSessions,
      ],
      totalFocusMinutes: prev.totalFocusMinutes + (type === 'work' ? duration : 0),
    }));
  }, []);

  const completeDailyCheckIn = useCallback(() => {
    setState((prev) => {
      const streak = computeStreak(prev.startDate);
      const longest = Math.max(prev.longestStreak, streak);
      return {
        ...prev,
        currentStreak: streak,
        longestStreak: longest,
        dailyCheckInDone: true,
        lastCheckInDate: todayStr(),
      };
    });
  }, []);

  const toggleNotifications = useCallback(() => {
    setState((prev) => ({
      ...prev,
      notificationsEnabled: !prev.notificationsEnabled,
    }));
  }, []);

  // ── Derived Helpers ──────────────────────────────────────────────────────

  const getTodayHabits = useCallback(() => {
    const today = todayStr();
    return state.habits.map((h) => ({
      ...h,
      completedToday: h.entries.some((e) => e.date === today && e.completed),
    }));
  }, [state.habits]);

  const getHabitStreak = useCallback(
    (habitId: string): number => {
      const habit = state.habits.find((h) => h.id === habitId);
      if (!habit) return 0;
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        if (habit.entries.some((e) => e.date === dateStr && e.completed)) {
          streak++;
        } else {
          break;
        }
      }
      return streak;
    },
    [state.habits]
  );

  const getWeeklyHabitData = useCallback(() => {
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days.map((date) => {
      const completed = state.habits.filter((h) =>
        h.entries.some((e) => e.date === date && e.completed)
      ).length;
      return { date, completed, total: state.habits.length };
    });
  }, [state.habits]);

  const currentStreak = computeStreak(state.startDate);

  return {
    ...state,
    currentStreak,
    loaded,
    startJourney,
    resetStreak,
    completeHabit,
    uncompleteHabit,
    addJournalEntry,
    recordFocusSession,
    completeDailyCheckIn,
    toggleNotifications,
    getTodayHabits,
    getHabitStreak,
    getWeeklyHabitData,
    todayStr,
  };
}

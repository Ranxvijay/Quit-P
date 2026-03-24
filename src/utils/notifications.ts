import * as Notifications from 'expo-notifications';

export async function scheduleMotivationNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Morning check-in
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Good morning, warrior 🔥',
      body: "Start your day with intention. Check in and stack your habits.",
      sound: true,
    },
    trigger: {
      hour: 8,
      minute: 0,
      repeats: true,
    } as any,
  });

  // Danger zone — evening
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Evening reminder 🛡️',
      body: "Peak urge time. Stay busy, stay strong. You've got this.",
      sound: true,
    },
    trigger: {
      hour: 21,
      minute: 0,
      repeats: true,
    } as any,
  });

  // Streak milestone reminders
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Midday check-in 💪',
      body: "How are you feeling? Open FreedomPath and log your progress.",
      sound: false,
    },
    trigger: {
      hour: 13,
      minute: 0,
      repeats: true,
    } as any,
  });
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function sendInstantEncouragement(streakDays: number) {
  let message = "You're doing great!";
  if (streakDays === 1) message = "Day 1 complete. The journey begins. 🔥";
  else if (streakDays === 7) message = "ONE WEEK! Testosterone is surging. Keep going! 💪";
  else if (streakDays === 14) message = "Two weeks of freedom. You're rewiring your brain! 🧠";
  else if (streakDays === 21) message = "21 days! Old habit pathways are breaking down! ⚡";
  else if (streakDays === 30) message = "30 DAYS! You are a different person. 🌟";
  else if (streakDays === 60) message = "60 days deep. Emotional depth and focus unlocked. ❤️";
  else if (streakDays === 90) message = "90 DAYS! Full brain rewire. You did it. 🏆";

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${streakDays} day streak! 🎯`,
      body: message,
      sound: true,
    },
    trigger: null,
  });
}

export interface CopingTool {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  route: string;
}

export interface UrgeActivity {
  id: string;
  title: string;
  description: string;
  duration: string;
  icon: string;
}

export const COPING_TOOLS: CopingTool[] = [
  {
    id: 'breathing',
    title: 'Box Breathing',
    subtitle: 'Calm your nervous system in 4 minutes',
    icon: 'wind',
    color: '#6C63FF',
    route: '/breathing',
  },
  {
    id: 'cold',
    title: 'Cold Shower',
    subtitle: 'The ultimate urge killer',
    icon: 'water',
    color: '#00B4D8',
    route: 'cold',
  },
  {
    id: 'exercise',
    title: 'Do 20 Push-ups',
    subtitle: 'Redirect that energy immediately',
    icon: 'body',
    color: '#4CAF50',
    route: 'exercise',
  },
  {
    id: 'journal',
    title: 'Write It Out',
    subtitle: 'Name the feeling — defuse its power',
    icon: 'pencil',
    color: '#FFA502',
    route: 'journal',
  },
  {
    id: 'walk',
    title: 'Get Outside',
    subtitle: 'Change your environment instantly',
    icon: 'walk',
    color: '#2ED573',
    route: 'walk',
  },
  {
    id: 'audio',
    title: 'Listen to Music',
    subtitle: 'Shift your brain state with sound',
    icon: 'musical-notes',
    color: '#FF6B81',
    route: 'audio',
  },
];

export const URGE_ACTIVITIES: UrgeActivity[] = [
  {
    id: '1',
    title: 'The 10-Minute Rule',
    description: 'Tell yourself you only need to wait 10 minutes. Urges always peak and pass. Start a timer and do something else.',
    duration: '10 min',
    icon: '⏱️',
  },
  {
    id: '2',
    title: 'Cold Water Splash',
    description: 'Splash cold water on your face 5 times. This activates the dive reflex and rapidly lowers heart rate.',
    duration: '1 min',
    icon: '💧',
  },
  {
    id: '3',
    title: 'Name the Urge',
    description: 'Say out loud: "I notice I am having an urge to ___." Naming it creates distance between you and the feeling.',
    duration: '30 sec',
    icon: '🗣️',
  },
  {
    id: '4',
    title: 'Call Someone',
    description: 'Call a friend, family member, or accountability partner. Connection is the #1 antidote to compulsion.',
    duration: '5 min',
    icon: '📞',
  },
  {
    id: '5',
    title: 'Read Your "Why"',
    description: 'Open your journal and re-read exactly why you started this journey. Reconnect with your purpose.',
    duration: '2 min',
    icon: '📖',
  },
  {
    id: '6',
    title: '100 Jumping Jacks',
    description: 'Physical intensity immediately changes your neurochemistry. Do them now — no thinking, just moving.',
    duration: '2 min',
    icon: '🏃',
  },
  {
    id: '7',
    title: 'Visualize Your Future Self',
    description: 'Close your eyes and vividly picture the person you are becoming. That person is watching this moment.',
    duration: '3 min',
    icon: '🌟',
  },
  {
    id: '8',
    title: 'Write in Your Journal',
    description: 'Open the app journal and write what you\'re feeling. Externalizing the urge on paper makes it concrete and manageable.',
    duration: '5 min',
    icon: '✍️',
  },
];

export const EMERGENCY_AFFIRMATIONS = [
  "I am stronger than this urge.",
  "This feeling is temporary. My resolve is permanent.",
  "I choose freedom over a 2-minute moment of weakness.",
  "Every urge I resist makes the next one weaker.",
  "I am not my brain's first impulse. I am my highest choice.",
  "The urge is a wave. I am the shore. It will break and recede.",
  "My future self is counting on me right now.",
  "I've gotten through this before. I'll get through it now.",
  "I am in control. I always have been.",
  "This is my defining moment. I choose growth.",
];

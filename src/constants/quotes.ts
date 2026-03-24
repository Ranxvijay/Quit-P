export interface Quote {
  text: string;
  author: string;
}

export const QUOTES: Quote[] = [
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "You are not your urges. You are the one who watches them.", author: "Anonymous" },
  { text: "Every day you resist is a day you win back your power.", author: "FreedomPath" },
  { text: "The chains of habit are too weak to be felt until they are too strong to be broken.", author: "Samuel Johnson" },
  { text: "Strength does not come from what you can do. It comes from overcoming the things you once thought you couldn't.", author: "Rikki Rogers" },
  { text: "You don't have to be great to get started, but you have to get started to be great.", author: "Les Brown" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "An urge is just a wave. Ride it out — it always passes.", author: "FreedomPath" },
  { text: "Real men build themselves. They don't waste energy on temporary pleasure.", author: "FreedomPath" },
  { text: "The present moment is where your power lives. Use it.", author: "FreedomPath" },
  { text: "Self-control is the chief element in self-respect.", author: "Thucydides" },
  { text: "The first wealth is health.", author: "Ralph Waldo Emerson" },
  { text: "Conquer yourself and you conquer the world.", author: "St. Francis de Sales" },
  { text: "Every battle is won before it is fought.", author: "Sun Tzu" },
  { text: "What you allow is what will continue.", author: "FreedomPath" },
  { text: "Your future self is watching. Don't let him down.", author: "FreedomPath" },
  { text: "Pain is temporary. The pride of discipline lasts forever.", author: "FreedomPath" },
  { text: "You become what you repeatedly do.", author: "Aristotle" },
  { text: "Comfort is the enemy of achievement.", author: "Farrah Gray" },
  { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
  { text: "Do the hard work, especially when you don't feel like it.", author: "Seth Godin" },
  { text: "True freedom is the ability to choose what controls you.", author: "FreedomPath" },
  { text: "Urges are not commands. You have the power to choose.", author: "FreedomPath" },
  { text: "A warrior is not defined by his desires, but by his mastery over them.", author: "FreedomPath" },
  { text: "Every day clean is a day of growth. Stack them.", author: "FreedomPath" },
];

export function getDailyQuote(): Quote {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return QUOTES[dayOfYear % QUOTES.length];
}

export function getRandomQuote(): Quote {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

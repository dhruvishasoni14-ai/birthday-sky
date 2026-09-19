import { SecretStar } from '../types/celestial';

// =====================================================
// PROGRAMMER-DEFINED SECRET STARS
// Edit, add, or remove secret stars here.
// Coordinates (x, y) are percentage positions within the movable sky space.
// =====================================================

export const DEFAULT_SECRET_STARS: SecretStar[] = [
  {
    id: 'star-blue',
    colorName: 'BLUE',
    hexColor: '#3b82f6',
    message: 'Congratulations. You found absolutely nothing useful.',
    x: 22,
    y: 28,
    discovered: false
  },
  {
    id: 'star-red',
    colorName: 'RED',
    hexColor: '#ef4444',
    message: 'There are 600+ stars here and somehow you clicked THIS one.',
    x: 78,
    y: 18,
    discovered: false
  },
  {
    id: 'star-pink',
    colorName: 'PINK',
    hexColor: '#ec4899',
    message: "This star has no purpose. I just wanted to see if you'd click it.",
    x: 35,
    y: 65,
    discovered: false
  },
  {
    id: 'star-teal',
    colorName: 'TEAL',
    hexColor: '#14b8a6',
    message: 'Fun fact: Summ was probably supposed to be doing something productive right now',
    x: 82,
    y: 52,
    discovered: false
  },
  {
    id: 'star-yellow',
    colorName: 'YELLOW',
    hexColor: '#eab308',
    message: 'Why are you clicking random stars? 🤨',
    x: 18,
    y: 80,
    discovered: false
  },
  {
    id: 'star-green',
    colorName: 'GREEN',
    hexColor: '#22c55e',
    message: "You really had to click EVERYTHING, didn't you?",
    x: 62,
    y: 78,
    discovered: false
  },
  {
    id: 'star-purple',
    colorName: 'PURPLE',
    hexColor: '#a855f7',
    message: "Secret star discovered. Achievement unlocked: Touching Things You Probably Shouldn't.",
    x: 48,
    y: 15,
    discovered: false
  },
  {
    id: 'star-gold',
    colorName: 'GOLD',
    hexColor: '#f59e0b',
    message: 'You found a secret star. Unfortunately, Summ is still not getting extra presents.',
    x: 68,
    y: 36,
    discovered: false
  }
];

export type FontType = 'elegant' | 'modern' | 'playful' | 'handwritten' | 'cursive' | 'typewriter';

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  avatarUrl: string;
  createdAt: number;
  uploadedStickers?: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface StickerItem {
  id: string;
  symbol: string;
  isCustom?: boolean;
  customUrl?: string;
  x: number; // percentage (0-100)
  y: number;
  scale: number;
  rotation: number;
}

export interface TextStyleConfig {
  font: FontType;
  color: string;
  size: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

export type StoryLayoutType = 1 | 2 | 3 | 4;

export type PageThemeType =
  | 'midnight'
  | 'stardust'
  | 'parchment'
  | 'blossom'
  | 'cosmic'
  | 'sunset'
  | 'custom';
export interface StoryPage {
  id: string;
  layout: StoryLayoutType;
  text: string;
  textStyle: TextStyleConfig;

  // Story text box position and size
  textBoxX: number;
  textBoxY: number;
  textBoxWidth: number;
  textBoxHeight: number;

  imageUrl?: string;

  // Story image position and size
  imageX: number;
  imageY: number;
  imageWidth: number;
  imageHeight: number;

  stickers: StickerItem[];
  theme: PageThemeType;
  customGradientFrom?: string;
  customGradientTo?: string;
}

export interface PlanetDesign {
  canvasDataUrl: string;
  hasRings: boolean;
  accentColor: string;
}

export interface ConstellationPoint {
  id: number;
  x: number;
  y: number;
}

export interface ConstellationConnection {
  fromId: number;
  toId: number;
}

export interface CardTextBox {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  style: TextStyleConfig;
}

export interface WishCard {
  id: string;
  creatorId?: string;
  creatorName?: string;
  creatorAvatar?: string;
  title: string;
  titleStyle: TextStyleConfig;
  body: string;
  bodyStyle: TextStyleConfig;
  from: string;
  fromStyle: TextStyleConfig;
  titleBox?: CardTextBox;
  bodyBox?: CardTextBox;
  fromBox?: CardTextBox;
  frame?: string;
  accentColor: string;
  bgGradientFrom?: string;
  bgGradientTo?: string;
  stickers: StickerItem[];
  // Sky coordinates (percentages within space container)
  x: number;
  y: number;
  points: ConstellationPoint[];
  connections: ConstellationConnection[];
  unopened: boolean;
  createdAt: number;
}

export interface Story {
  id: string;
  creatorId?: string;
  creatorName?: string;
  creatorAvatar?: string;
  title: string;
  planetDesign: PlanetDesign;
  pages: StoryPage[];
  x: number;
  y: number;
  unopened: boolean;
  createdAt: number;
}

export interface NebulaWordEntry {
  id: string;
  word: string;
  explanation: string;
  creatorId?: string;
  creatorName: string;
  creatorAvatar?: string;
  createdAt: number;
  x: number; // float coordinate %
  y: number;
  color: string;
  floatDelay: number;
  floatDuration: number;
}

export interface BlackHoleWish {
  id: string;
  wishText: string;
  creatorId?: string;
  creatorName: string;
  creatorAvatar?: string;
  createdAt: number;
}

export interface VoiceNote {
  id: string;
  creatorId?: string;
  creatorName?: string;
  contributor: string;
  creatorAvatar?: string;
  title: string;
  audioUrl?: string;
  noteColor: string;
  x: number;
  y: number;
  heard: boolean;
  createdAt: number;
}

export interface SecretStar {
  id: string;
  colorName: string;
  hexColor: string;
  message: string;
  x: number;
  y: number;
  discovered: boolean;
}

export type ModalType =
  | null
  | 'profile'
  | 'auth'
  | 'add-menu'
  | 'wish-studio'
  | 'wish-view'
  | 'moon-message'
  | 'planet-designer'
  | 'story-studio'
  | 'story-view'
  | 'nebula'
  | 'voice-probe'
  | 'secret-star'
  | 'black-hole';

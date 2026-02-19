export enum GameState {
  MENU = 'MENU',
  MISSION_SELECT = 'MISSION_SELECT',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  SHOP = 'SHOP',
}

export interface PlayerStats {
  money: number;
  speedLevel: number; // 1 to 10
  skin: string; // 'classic', 'gold', 'neon', 'stealth'
  highScore: number;
}

export interface LocationData {
  name: string;
  address: string;
  mapUri?: string;
  description?: string;
}

export enum SkinType {
  CLASSIC = 'classic',
  GOLD = 'gold',
  NEON = 'neon',
  STEALTH = 'stealth'
}

export const SHOP_ITEMS = [
  { id: 'speed', name: 'Engine Upgrade', cost: 500, maxLevel: 5, description: 'Increase top speed by 10%' },
  { id: 'skin_gold', name: 'Gold Plating', cost: 2000, type: 'skin', skinId: SkinType.GOLD, description: 'Show off your wealth' },
  { id: 'skin_neon', name: 'Cyber Neon', cost: 1500, type: 'skin', skinId: SkinType.NEON, description: 'Glow in the dark' },
  { id: 'skin_stealth', name: 'Matte Stealth', cost: 1000, type: 'skin', skinId: SkinType.STEALTH, description: 'Tactical look' },
];

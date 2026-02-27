// src/types/game.ts

export type Direction = 'NORTH' | 'EAST' | 'SOUTH' | 'WEST';
export type Command = 'FORWARD' | 'RIGHT' | 'LEFT';

export interface Position {
  x: number;
  y: number;
}

export interface Level {
  id: number;
  gridSize: number;
  playerPos: Position;
  playerDir: Direction;
  targetPos: Position;
  obstacles: Position[];
  collectibles: Position[]; // Yumurtalar
  maxMoves: number; // Sınırlı hamle
}

export interface GameState {
  currentLevelId: number;
  playerPos: Position;
  playerDir: Direction;
  commands: Command[];
  isPlaying: boolean;
  status: 'idle' | 'won' | 'crashed' | 'incomplete' | 'out_of_moves' | 'missing_collectibles';
  activeIndex: number;
  collectedItems: Position[]; // Sayı yerine toplanan objelerin koordinatlarını tutuyoruz
}
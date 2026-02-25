// src/hooks/useGame.ts
import { useState } from 'react';
import type { GameState, Command, Direction, Position } from '../types/game';
import { LEVELS } from '../constants/levels';

const DIRS: Direction[] = ['NORTH', 'EAST', 'SOUTH', 'WEST'];
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useGame = () => {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const currentLevel = LEVELS[currentLevelIndex];

  const [gameState, setGameState] = useState<GameState>({
    currentLevelId: currentLevel.id,
    playerPos: currentLevel.playerPos,
    playerDir: currentLevel.playerDir,
    commands: [],
    isPlaying: false,
    status: 'idle',
    activeIndex: -1,
    collectedItems: [],
  });

  const addCommand = (cmd: Command) => {
    if (!gameState.isPlaying && gameState.commands.length < currentLevel.maxMoves) {
      setGameState((prev) => ({ ...prev, commands: [...prev.commands, cmd] }));
    }
  };

  const clearCommands = () => {
    if (!gameState.isPlaying) resetGame();
  };

  const resetGame = () => {
    setGameState({
      currentLevelId: currentLevel.id,
      playerPos: currentLevel.playerPos,
      playerDir: currentLevel.playerDir,
      commands: [],
      isPlaying: false,
      status: 'idle',
      activeIndex: -1,
      collectedItems: [],
    });
  };

  const nextLevel = () => {
    if (currentLevelIndex < LEVELS.length - 1) {
      const newIndex = currentLevelIndex + 1;
      const newLevel = LEVELS[newIndex];
      setCurrentLevelIndex(newIndex);
      // Yeni seviyenin başlangıç değerleriyle state'i sıfırla
      setGameState({
        currentLevelId: newLevel.id,
        playerPos: newLevel.playerPos,
        playerDir: newLevel.playerDir,
        commands: [],
        isPlaying: false,
        status: 'idle',
        activeIndex: -1,
        collectedItems: [],
      });
    }
  };

  // Pozisyon çakışma kontrolü
  const checkCollision = (pos: Position, items: Position[]) => 
    items.some(item => item.x === pos.x && item.y === pos.y);

  const runCommands = async () => {
    if (gameState.commands.length === 0 || gameState.isPlaying) return;

    setGameState((prev) => ({ ...prev, isPlaying: true, status: 'idle' }));

    let currentPos = { ...gameState.playerPos };
    let currentDir = gameState.playerDir;
    const collectedItems: Position[] = [];

    for (let i = 0; i < gameState.commands.length; i++) {
      setGameState((prev) => ({ ...prev, activeIndex: i }));
      const cmd = gameState.commands[i];

      if (cmd === 'RIGHT') {
        currentDir = DIRS[(DIRS.indexOf(currentDir) + 1) % 4];
      } else if (cmd === 'LEFT') {
        currentDir = DIRS[(DIRS.indexOf(currentDir) + 3) % 4];
      } else if (cmd === 'FORWARD') {
        let newX = currentPos.x;
        let newY = currentPos.y;

        if (currentDir === 'NORTH') newY -= 1;
        if (currentDir === 'EAST') newX += 1;
        if (currentDir === 'SOUTH') newY += 1;
        if (currentDir === 'WEST') newX -= 1;

        // 1. Sınır Kontrolü
        if (newX < 0 || newX >= currentLevel.gridSize || newY < 0 || newY >= currentLevel.gridSize) {
          setGameState(prev => ({ ...prev, status: 'crashed', isPlaying: false }));
          return;
        }

        // 2. Engel (Kaya) Kontrolü
        if (checkCollision({ x: newX, y: newY }, currentLevel.obstacles)) {
          setGameState(prev => ({ ...prev, status: 'crashed', isPlaying: false }));
          return;
        }

        currentPos = { x: newX, y: newY };

        // 3. Toplanabilir Obje (Pil) Kontrolü
        const onCollectible = currentLevel.collectibles.find(c => c.x === currentPos.x && c.y === currentPos.y);
        if (onCollectible && !checkCollision(onCollectible, collectedItems)) {
          collectedItems.push(onCollectible);
          // Ekranda anında kaybolması için state'i güncelliyoruz:
          setGameState(prev => ({ ...prev, collectedItems: [...collectedItems] }));
        }
      }

      setGameState(prev => ({ ...prev, playerPos: currentPos, playerDir: currentDir }));
      await sleep(600);

      // Hedefe ulaştı mı?
      if (currentPos.x === currentLevel.targetPos.x && currentPos.y === currentLevel.targetPos.y) {
        // Tüm pilleri topladı mı?
        if (collectedItems.length === currentLevel.collectibles.length) {
          setGameState(prev => ({ ...prev, status: 'won', isPlaying: false }));
        } else {
          setGameState(prev => ({ ...prev, status: 'missing_collectibles', isPlaying: false }));
        }
        return;
      }
    }

    // Komutlar bitti ama yıldıza veya hedeflere ulaşılamadı
    setGameState(prev => ({ ...prev, status: 'out_of_moves', isPlaying: false, activeIndex: -1 }));
  };

  return {
    ...gameState,
    currentLevel,
    addCommand,
    clearCommands,
    resetGame,
    runCommands,
    nextLevel
  };
};
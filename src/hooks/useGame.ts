// src/hooks/useGame.ts
import { useState, useEffect, useRef } from 'react';
import type { GameState, Command, Direction, Position } from '../types/game';
import { LEVELS } from '../constants/levels';

const DIRS: Direction[] = ['NORTH', 'EAST', 'SOUTH', 'WEST'];
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useGame = () => {
  // Load level progress from localStorage
  const [currentLevelIndex, setCurrentLevelIndex] = useState(() => {
    const saved = localStorage.getItem('currentLevelIndex');
    return saved ? parseInt(saved, 10) : 0;
  });
  const currentLevel = LEVELS[currentLevelIndex];
  const [duration, setDuration] = useState(0);
  const timerIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Save level progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('currentLevelIndex', currentLevelIndex.toString());
  }, [currentLevelIndex]);

  // Start timer when level loads
  useEffect(() => {
    startTimeRef.current = Date.now();
    setDuration(0);
  }, [currentLevelIndex]);

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

  // Timer effect - always running
  useEffect(() => {
    if (startTimeRef.current && gameState.status !== 'won') {
      timerIntervalRef.current = window.setInterval(() => {
        if (startTimeRef.current) {
          setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }
      }, 100);
    } else if (gameState.status === 'won') {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [gameState.status, currentLevelIndex]);

  const addCommand = (cmd: Command) => {
    if (!gameState.isPlaying && gameState.commands.length < currentLevel.maxMoves) {
      setGameState((prev) => ({ ...prev, commands: [...prev.commands, cmd] }));
    }
  };

  const undoCommand = () => {
    if (!gameState.isPlaying && gameState.commands.length > 0) {
      setGameState((prev) => ({ ...prev, commands: prev.commands.slice(0, -1) }));
    }
  };

  const clearCommands = () => {
    if (!gameState.isPlaying) resetGame();
  };

  const resetGame = () => {
    setDuration(0);
    startTimeRef.current = Date.now(); // Restart timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
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
    }

    // Tüm komutlar çalıştı, şimdi hedefe ulaşıp ulaşılmadığını kontrol et
    if (currentPos.x === currentLevel.targetPos.x && currentPos.y === currentLevel.targetPos.y) {
      // Tüm pilleri topladı mı?
      if (collectedItems.length === currentLevel.collectibles.length) {
        setGameState(prev => ({ ...prev, status: 'won', isPlaying: false, activeIndex: -1 }));
      } else {
        setGameState(prev => ({ ...prev, status: 'missing_collectibles', isPlaying: false, activeIndex: -1 }));
      }
      return;
    }

    // Komutlar bitti ama yıldıza veya hedeflere ulaşılamadı
    setGameState(prev => ({ ...prev, status: 'out_of_moves', isPlaying: false, activeIndex: -1 }));
  };

  return {
    ...gameState,
    currentLevel,
    duration,
    addCommand,
    undoCommand,
    clearCommands,
    resetGame,
    runCommands,
    nextLevel
  };
};
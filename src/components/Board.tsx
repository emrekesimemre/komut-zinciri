// src/components/Board.tsx
import React from 'react';
import type { Direction, Position, Level } from '../types/game';

interface BoardProps {
  playerPos: Position;
  playerDir: Direction;
  currentLevel: Level;
  collectedItems: Position[];
}

export const Board: React.FC<BoardProps> = ({ playerPos, playerDir, currentLevel, collectedItems }) => {
  const { gridSize, targetPos, obstacles, collectibles } = currentLevel;

  // Yönlere göre dinozoru döndürecek CSS transform değerleri
 // Yönlere göre dinozoru döndürecek GÜNCELLENMİŞ CSS transform değerleri
  const getTransform = (dir: Direction) => {
    switch (dir) {
      case 'EAST': return 'scaleX(-1)';     // Sağa gitmesi için aynalayıp ters çeviriyoruz
      case 'WEST': return 'scaleX(1)';      // Zaten sola bakıyor, dokunmuyoruz
      case 'NORTH': return 'rotate(90deg)'; // Sola bakan dinozor saat yönünde 90 derece dönerse yukarı bakar
      case 'SOUTH': return 'rotate(-90deg)';// Sola bakan dinozor ters yönde 90 derece dönerse aşağı bakar
      default: return 'none';
    }
  };

  const isCollision = (x: number, y: number, items: Position[]) =>
    items.some(item => item.x === x && item.y === y);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
      gridTemplateRows: `repeat(${gridSize}, 1fr)`, 
      gap: '2px',
      width: '100%',
      backgroundColor: '#e0e0e0',
      padding: '4px',
      borderRadius: '8px',
      boxSizing: 'border-box'
    }}>
      {Array.from({ length: gridSize * gridSize }).map((_, index) => {
        const x = index % gridSize;
        const y = Math.floor(index / gridSize);
        const cellKey = `${x}-${y}`;

        const isPlayerHere = playerPos.x === x && playerPos.y === y;
        const isTargetHere = targetPos.x === x && targetPos.y === y;
        const isObstacleHere = isCollision(x, y, obstacles);
        const isCollectibleHere = isCollision(x, y, collectibles) && !isCollision(x, y, collectedItems);

        let content: React.ReactNode = '';
        let bgColor = 'white';

        if (isPlayerHere) {
          // İçine Dinozoru koyup, CSS ile baktığı yöne doğru animasyonlu çeviriyoruz
          content = (
            <div style={{ 
              transform: getTransform(playerDir), 
              transition: 'transform 0.3s ease', // Dönüşlerde tatlı bir animasyon olsun
              lineHeight: 1
            }}>
              🦖
            </div>
          );
          bgColor = '#4facfe'; 
        } else if (isObstacleHere) {
          content = '🪨';
          bgColor = '#a8a8a8'; 
        } else if (isCollectibleHere) { 
          content = '🥚';
          bgColor = '#e6ffed'; 
        } else if (isTargetHere) {
          content = '🏠';
          bgColor = '#ffd700'; 

        }

        return (
          <div key={cellKey} style={{
            backgroundColor: bgColor,
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            aspectRatio: '1/1',
            width: '100%',
            overflow: 'hidden'
          }}>
            {content}
          </div>
        );
      })}
    </div>
  );
};
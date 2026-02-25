// src/components/CommandQueue.tsx
import React from 'react';
import type { Command, Direction } from '../types/game';

interface CommandQueueProps {
  commands: Command[];
  activeIndex: number;
  initialDir: Direction;
}

export const CommandQueue: React.FC<CommandQueueProps> = ({ commands, activeIndex, initialDir }) => {
  const DIRS: Direction[] = ['NORTH', 'EAST', 'SOUTH', 'WEST'];

  // Her komutun çalıştığı andaki yönü hesapla
  const getCommandIcon = (cmd: Command, index: number) => {
    // Bu komuta kadar olan yönü hesapla
    let currentDir = initialDir;
    for (let i = 0; i < index; i++) {
      if (commands[i] === 'RIGHT') {
        currentDir = DIRS[(DIRS.indexOf(currentDir) + 1) % 4];
      } else if (commands[i] === 'LEFT') {
        currentDir = DIRS[(DIRS.indexOf(currentDir) + 3) % 4];
      }
    }

    // Şimdi bu komutun ikonunu belirle
    if (cmd === 'FORWARD') {
      switch (currentDir) {
        case 'NORTH': return '⬆️';
        case 'EAST': return '➡️';
        case 'SOUTH': return '⬇️';
        case 'WEST': return '⬅️';
      }
    }
    return cmd === 'RIGHT' ? '↩️' : '↪️';
  };

  return (
    <div style={{ 
      width: '100%', 
      backgroundColor: '#f5f5f5', 
      padding: '12px', 
      borderRadius: '12px', 
      boxSizing: 'border-box',
    }}>
      <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#333' }}>📋 Komut Dizisi:</h4>
      
      {/* GRID DÜZEN - 2 SATIRLIK KOMPAKT GÖRÜNÜM */}
      <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, 36px)', // Her kutucuk 36px
          gap: '6px',
          maxHeight: '84px', // 2 satır (36px + 36px + gap)
          overflowY: 'auto', // Fazlası varsa dikey scroll
          overflowX: 'hidden', // Yatay taşma yok
          padding: '4px',
        }}
      >
        {commands.map((cmd, i) => (
          <div key={i} style={{
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: activeIndex === i ? '#ffd700' : 'white',
            border: `2px solid ${activeIndex === i ? '#d4b106' : '#ccc'}`,
            borderRadius: '6px',
            fontSize: '1rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            transition: 'all 0.2s ease',
            transform: activeIndex === i ? 'scale(1.15)' : 'scale(1)',
            position: 'relative',
            fontWeight: activeIndex === i ? 'bold' : 'normal'
          }}>
            {getCommandIcon(cmd, i)}
            {/* Komut numarası */}
            <span style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              fontSize: '0.5rem',
              backgroundColor: activeIndex === i ? '#d4b106' : '#999',
              color: 'white',
              borderRadius: '50%',
              width: '12px',
              height: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              {i + 1}
            </span>
          </div>
        ))}
      </div>

      {commands.length === 0 && (
        <div style={{ 
          padding: '12px', 
          textAlign: 'center',
          color: '#888', 
          fontSize: '0.9rem', 
          fontStyle: 'italic' 
        }}>
          Dino bekliyor...
        </div>
      )}
    </div>
  );
};
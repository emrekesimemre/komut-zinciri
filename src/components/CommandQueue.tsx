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

  // Komutları gruplandır
  const groupCommands = () => {
    if (commands.length === 0) return [];
    
    const groups: { cmd: Command; count: number; startIndex: number }[] = [];
    let currentCmd = commands[0];
    let count = 1;
    let startIndex = 0;

    for (let i = 1; i < commands.length; i++) {
      if (commands[i] === currentCmd) {
        count++;
      } else {
        groups.push({ cmd: currentCmd, count, startIndex });
        currentCmd = commands[i];
        count = 1;
        startIndex = i;
      }
    }
    groups.push({ cmd: currentCmd, count, startIndex });
    
    return groups;
  };

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

  const groupedCommands = groupCommands();

  return (
    <div style={{ 
      width: '100%', 
      backgroundColor: '#f5f5f5', 
      padding: '8px', 
      borderRadius: '10px', 
      boxSizing: 'border-box',
    }}>
      
      
      {/* GRID DÜZEN - GRUPLANMIŞ KOMUTLAR */}
      <div style={{ 
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          padding: '2px',
        }}
      >
        {groupedCommands.map((group, groupIndex) => {
          const isActive = activeIndex >= group.startIndex && activeIndex < group.startIndex + group.count;
          
          return (
            <div key={groupIndex} style={{
              minWidth: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isActive ? '#ffd700' : 'white',
              border: `2px solid ${isActive ? '#d4b106' : '#d9d9d9'}`,
              borderRadius: '8px',
              fontSize: '1rem',
              boxShadow: isActive ? '0 4px 8px rgba(212, 177, 6, 0.3)' : '0 2px 4px rgba(0,0,0,0.08)',
              transition: 'all 0.2s ease',
              transform: isActive ? 'scale(1.1)' : 'scale(1)',
              position: 'relative',
              fontWeight: isActive ? 'bold' : 'normal',
              padding: '4px 6px'
            }}>
              <span>{getCommandIcon(group.cmd, group.startIndex)}</span>
              {group.count > 1 && (
                <span style={{
                  marginLeft: '2px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  color: isActive ? '#8c6d06' : '#595959'
                }}>
                  x{group.count}
                </span>
              )}
            </div>
          );
        })}
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
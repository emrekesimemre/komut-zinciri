// src/components/Controls.tsx
import React from 'react';
import type { Command, Direction } from '../types/game';

interface ControlsProps {
  onAddCommand: (cmd: Command) => void;
  disabled: boolean;
  playerDir: Direction;
}

export const Controls: React.FC<ControlsProps> = ({ onAddCommand, disabled, playerDir }) => {
  const btnStyle = {
    flex: 1,
    padding: '10px 6px',
    fontSize: '0.95rem',
    fontWeight: 'bold',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#e6f7ff',
    color: '#0050b3',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'all 0.2s ease',
    minWidth: '70px'
  };

  // Karakterin yönüne göre doğru oku göster
  const getForwardArrow = () => {
    switch (playerDir) {
      case 'NORTH': return '⬆️';
      case 'EAST': return '➡️';
      case 'SOUTH': return '⬇️';
      case 'WEST': return '⬅️';
    }
  };

  return (
    <div style={{ display: 'flex', gap: '6px', width: '100%', marginBottom: '8px' }}>
      <button disabled={disabled} onClick={() => onAddCommand('LEFT')} style={btnStyle}>↪️ Sol</button>
      <button disabled={disabled} onClick={() => onAddCommand('FORWARD')} style={{...btnStyle, flex: 1.5}}>{getForwardArrow()} İleri</button>
      <button disabled={disabled} onClick={() => onAddCommand('RIGHT')} style={btnStyle}>Sağ ↩️</button>
    </div>
  );
};
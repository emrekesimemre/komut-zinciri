import React, { useEffect, useState } from 'react';
import { API_URL } from '../constants/config';

interface LeaderboardEntry {
  _id: string;
  username: string;
  totalScore: number;
  levelsCompleted: number;
}

interface LeaderboardProps {
  onClose?: () => void;
  standalone?: boolean;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onClose, standalone = false }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${API_URL}/leaderboard?limit=50`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      }
    } catch (error) {
      console.error('Lider tablosu yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      maxWidth: '600px',
      width: '100%',
      maxHeight: standalone ? 'none' : '80vh',
      overflow: 'auto',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#262626' }}>
          🏆 Puan Tablosu
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {standalone ? '← Geri' : '✕'}
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#8c8c8c' }}>
          Yükleniyor...
        </div>
      ) : leaderboard.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#8c8c8c' }}>
          Henüz kimse skor kaydı yapmamış
        </div>
      ) : (
        <div>
          {leaderboard.map((entry, index) => (
            <div
              key={entry._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                marginBottom: '8px',
                backgroundColor: index < 3 ? '#fff7e6' : '#fafafa',
                borderRadius: '8px',
                border: index < 3 ? '2px solid #ffd700' : '1px solid #f0f0f0'
              }}
            >
              <div style={{
                width: '40px',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                color: index === 0 ? '#ffd700' : index === 1 ? '#d9d9d9' : index === 2 ? '#cd7f32' : '#8c8c8c'
              }}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#262626' }}>
                  {entry.username}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#8c8c8c' }}>
                  Bölüm: {entry.levelsCompleted}
                </div>
              </div>
              <div style={{
                fontWeight: 'bold',
                fontSize: '1.1rem',
                color: '#52c41a'
              }}>
                {entry.totalScore.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (standalone) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#f5f5f5'
      }}>
        {content}
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      zIndex: 1000
    }}>
      {content}
    </div>
  );
};

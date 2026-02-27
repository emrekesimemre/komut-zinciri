// src/components/Menu.tsx
import { useAuth } from '../contexts/AuthContext';

interface MenuProps {
  onPlayGame: () => void;
  onViewLeaderboard: () => void;
}

export const Menu = ({ onPlayGame, onViewLeaderboard }: MenuProps) => {
  const { user, logout } = useAuth();

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
      {/* Game Title */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{
          fontSize: '3rem',
          margin: '0 0 10px 0',
          color: '#262626',
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
        }}>
          🦖 Dino Macerası
        </h1>
        <p style={{
          fontSize: '1.2rem',
          margin: 0,
          color: '#8c8c8c'
        }}>
          Dinoyu yönlendir, görevleri tamamla ve hedefe ulaş!
        </p>
      </div>

      {/* User Info Card */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px 40px',
        borderRadius: '12px',
        marginBottom: '30px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        textAlign: 'center',
        minWidth: '300px'
      }}>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#262626',
          marginBottom: '10px'
        }}>
          👤 {user?.username}
        </div>
        <div style={{
          fontSize: '1.2rem',
          color: '#52c41a',
          fontWeight: 'bold',
          marginBottom: '8px'
        }}>
          🏆 {user?.totalScore || 0} Puan
        </div>
        <div style={{
          fontSize: '1rem',
          color: '#8c8c8c'
        }}>
          📊 {user?.levelsCompleted || 0} Bölüm Tamamlandı
        </div>
      </div>

      {/* Menu Buttons */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        width: '100%',
        maxWidth: '300px'
      }}>
        <button
          onClick={onPlayGame}
          style={{
            padding: '20px',
            fontSize: '1.3rem',
            fontWeight: 'bold',
            backgroundColor: '#52c41a',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
          }}
        >
          🎮 Oyuna Başla
        </button>

        <button
          onClick={onViewLeaderboard}
          style={{
            padding: '20px',
            fontSize: '1.3rem',
            fontWeight: 'bold',
            backgroundColor: '#ffd700',
            color: '#262626',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
          }}
        >
          🏆 Liderlik Tablosu
        </button>

        <button
          onClick={logout}
          style={{
            padding: '15px',
            fontSize: '1rem',
            fontWeight: 'bold',
            backgroundColor: '#ff4d4f',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease',
            marginTop: '20px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
          }}
        >
          🚪 Çıkış Yap
        </button>
      </div>  
    </div>
  );
};

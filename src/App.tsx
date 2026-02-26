// src/App.tsx
import { useState, useEffect } from 'react';
import { useGame } from './hooks/useGame';
import { Board } from './components/Board';
import { Controls } from './components/Controls';
import { CommandQueue } from './components/CommandQueue';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Leaderboard } from './components/Leaderboard';
import { useAuth } from './contexts/AuthContext';
import { API_URL } from './constants/config';

export default function App() {
  const { user, logout, token } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  const {
    currentLevel,
    playerPos,
    playerDir,
    commands,
    isPlaying,
    status,
    activeIndex,
    collectedItems,
    duration,
    addCommand,
    undoCommand,
    clearCommands,
    resetGame,
    runCommands,
    nextLevel
  } = useGame();

  const submitScore = async () => {
    if (!user || !token) return;

    const maxTime = 60; // Maximum time in seconds
    const baseScore = 1000;
    const timeBonus = Math.max(0, (maxTime - duration) * 10);
    const moveBonus = (currentLevel.maxMoves - commands.length) * 50;
    const totalScore = baseScore + timeBonus + moveBonus;

    try {
      await fetch(`${API_URL}/scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          level: currentLevel.id,
          baseScore,
          timeBonus,
          moveBonus,
          totalScore,
          duration,
          movesUsed: commands.length
        })
      });
    } catch (error) {
      console.error('Skor gönderilemedi:', error);
    }
  };

  // Submit score when level is won
  useEffect(() => {
    if (status === 'won' && user && token) {
      submitScore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, user, token]);

  if (!user) {
    return authView === 'login' ? (
      <Login onNavigateToRegister={() => setAuthView('register')} />
    ) : (
      <Register onNavigateToLogin={() => setAuthView('login')} />
    );
  }

  const actionBtnStyle = {
    flex: 1,
    padding: '10px 8px',
    fontSize: '0.95rem',
    fontWeight: 'bold',
    borderRadius: '10px',
    border: 'none',
    color: 'white',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  // Çocuğun hamle sınırını aşıp aşmadığını kontrol ediyoruz
  const isMaxMovesReached = commands.length >= currentLevel.maxMoves;

  return (
    <div>
      {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} />}
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        padding: '6px', 
        fontFamily: 'system-ui, -apple-system, sans-serif', 
        width: '100%',
        maxWidth: '100vw',
        margin: '0',
        boxSizing: 'border-box',
        paddingBottom: '8px',
        overflowX: 'hidden',
        minHeight: '100vh'
      }}>
      
      {/* HEADER: User info & Timer */}
      <div style={{ 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '8px',
        padding: '8px',
        backgroundColor: '#fafafa',
        borderRadius: '10px',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#262626' }}>
            👤 {user.username}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#8c8c8c' }}>
            🏆 {user.totalScore}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button 
            onClick={() => setShowLeaderboard(true)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#ffd700',
              color: '#262626',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🏆 Tablo
          </button>
          <button 
            onClick={logout}
            style={{
              padding: '6px 12px',
              backgroundColor: '#ff4d4f',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Çıkış
          </button>
        </div>
      </div>
      
      {/* ÜST BİLGİ PANELİ: Bölüm, Hamle ve Timer */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', marginTop: '2px' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Bölüm: {currentLevel.id}</h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#1890ff' }}>
            ⏱️ {duration}s
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: isMaxMovesReached ? '#ff4d4f' : '#262626' }}>
            Hamle: {commands.length} / {currentLevel.maxMoves}
          </div>
        </div>
      </div>
      
      {/* OYUN ALANI */}
      <Board 
        playerPos={playerPos} 
        playerDir={playerDir} 
        currentLevel={currentLevel}
        collectedItems={collectedItems} // Yeni eklenen prop
      />

      {/* DETAYLI DURUM BİLDİRİMLERİ */}
      <div style={{ margin: '8px 0', fontSize: '0.9rem', fontWeight: 'bold', minHeight: '22px', textAlign: 'center' }}>
        {status === 'won' && <span style={{ color: '#52c41a' }}>Harika! Bölümü geçtin! 🎉</span>}
        {status === 'crashed' && <span style={{ color: '#ff4d4f' }}>Eyvah! Kayalara veya duvara çarptık. 💥</span>}
        {status === 'out_of_moves' && <span style={{ color: '#fa8c16' }}>Hedefe ulaşamadan hamlemiz bitti! 🔄</span>}
        {status === 'missing_collectibles' && <span style={{ color: '#fa8c16' }}>Yıldıza geldin ama pilleri unuttun! 🔋</span>}
        
        {/* Oyun oynanmıyorken toplanması gereken pilleri hatırlat */}
        {status === 'idle' && currentLevel.collectibles.length > 0 && (
          <span style={{ color: '#1890ff' }}>
            Hedef: Tüm pilleri topla ({collectedItems.length} / {currentLevel.collectibles.length})
          </span>
        )}
      </div>

      {/* YÖN KONTROLLERİ */}
      <Controls onAddCommand={addCommand} disabled={isPlaying || isMaxMovesReached} playerDir={playerDir} />
      
      <CommandQueue commands={commands} activeIndex={activeIndex} initialDir={currentLevel.playerDir} />

      {/* ALT BUTONLAR */}
      <div style={{ width: '100%', marginTop: '8px' }}>
        {/* Üst sıra: Geri Al ve Temizle */}
        <div style={{ display: 'flex', gap: '6px', width: '100%', marginBottom: '6px' }}>
          <button 
            onClick={undoCommand} 
            disabled={isPlaying || commands.length === 0 || status !== 'idle'} 
            style={{...actionBtnStyle, backgroundColor: '#faad14', opacity: isPlaying || commands.length === 0 || status !== 'idle' ? 0.5 : 1}}
          >
            ↶ Geri Al
          </button>
          <button 
            onClick={clearCommands} 
            disabled={isPlaying || commands.length === 0 || status !== 'idle'} 
            style={{...actionBtnStyle, backgroundColor: '#ff4d4f', opacity: isPlaying || commands.length === 0 || status !== 'idle' ? 0.5 : 1}}
          >
            🗑️ Temizle
          </button>
        </div>
        
        {/* Alt sıra: Ana aksiyon butonu */}
        {status === 'won' ? (
          <button onClick={nextLevel} style={{...actionBtnStyle, backgroundColor: '#722ed1', width: '100%'}}>
            ⏭️ Sonraki Bölüm
          </button>
        ) : status !== 'idle' && !isPlaying ? (
          <button onClick={resetGame} style={{...actionBtnStyle, backgroundColor: '#1890ff', width: '100%'}}>
            🔄 Tekrar Dene
          </button>
        ) : (
          <button 
            onClick={runCommands} 
            disabled={isPlaying || commands.length === 0} 
            style={{...actionBtnStyle, backgroundColor: '#52c41a', opacity: isPlaying || commands.length === 0 ? 0.5 : 1, width: '100%'}}
          >
            ▶️ Çalıştır
          </button>
        )}
      </div>
      </div>
    </div>
  );
}
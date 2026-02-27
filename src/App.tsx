// src/App.tsx
import { useState, useEffect, useRef } from 'react';
import { useGame } from './hooks/useGame';
import { Board } from './components/Board';
import { Controls } from './components/Controls';
import { CommandQueue } from './components/CommandQueue';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Leaderboard } from './components/Leaderboard';
import { Menu } from './components/Menu';
import { LevelSelect } from './components/LevelSelect';
import { useAuth } from './contexts/AuthContext';
import { API_URL } from './constants/config';

type Page = 'menu' | 'levelSelect' | 'game' | 'leaderboard';

export default function App() {
  const { user, logout, token, updateUser } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [currentPage, setCurrentPage] = useState<Page>('menu');
  const [selectedLevelIndex, setSelectedLevelIndex] = useState<number>(0);
  const lastSubmittedLevelRef = useRef<number | null>(null);
  
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
    nextLevel,
    startTimer,
    changeLevel
  } = useGame(selectedLevelIndex);

  const submitScore = async () => {
    if (!user || !token) return;

    const maxTime = 60; // Maximum time in seconds
    const baseScore = 1000;
    const timeBonus = Math.max(0, (maxTime - duration) * 10);
    const moveBonus = (currentLevel.maxMoves - commands.length) * 50;
    const totalScore = baseScore + timeBonus + moveBonus;

    try {
      const response = await fetch(`${API_URL}/scores`, {
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
      
      if (response.ok) {
        // Update user score instantly in UI
        updateUser({ 
          totalScore: user.totalScore + totalScore,
          levelsCompleted: Math.max(user.levelsCompleted || 0, currentLevel.id)
        });
        lastSubmittedLevelRef.current = currentLevel.id;
      }
    } catch (error) {
      console.error('Skor gönderilemedi:', error);
    }
  };

  // Submit score when level is won (only once per level)
  useEffect(() => {
    if (status === 'won' && user && token && lastSubmittedLevelRef.current !== currentLevel.id) {
      submitScore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, user, token, currentLevel.id]);

  const handleSelectLevel = (levelIndex: number) => {
    setSelectedLevelIndex(levelIndex);
    changeLevel(levelIndex);
    setCurrentPage('game');
    // Start timer when level is opened
    setTimeout(() => startTimer(), 100);
  };

  const handleBackToMenu = () => {
    setCurrentPage('menu');
  };

  const handleBackToLevelSelect = () => {
    setCurrentPage('levelSelect');
  };

  if (!user) {
    return authView === 'login' ? (
      <Login onNavigateToRegister={() => setAuthView('register')} />
    ) : (
      <Register onNavigateToLogin={() => setAuthView('login')} />
    );
  }

  // Show different pages based on currentPage state
  if (currentPage === 'menu') {
    return (
      <Menu 
        onPlayGame={() => setCurrentPage('levelSelect')}
        onViewLeaderboard={() => setCurrentPage('leaderboard')}
      />
    );
  }

  if (currentPage === 'levelSelect') {
    return (
      <LevelSelect 
        onSelectLevel={handleSelectLevel}
        onBack={handleBackToMenu}
      />
    );
  }

  if (currentPage === 'leaderboard') {
    return (
      <Leaderboard 
        onClose={handleBackToMenu}
        standalone={true}
      />
    );
  }

  // Game Page
  const actionBtnStyle = {
    flex: 1,
    padding: '8px 6px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    borderRadius: '8px',
    border: 'none',
    color: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  // Çocuğun hamle sınırını aşıp aşmadığını kontrol ediyoruz
  const isMaxMovesReached = commands.length >= currentLevel.maxMoves;

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        padding: '4px', 
        fontFamily: 'system-ui, -apple-system, sans-serif', 
        width: '100%',
        maxWidth: '100vw',
        height: '100vh',
        margin: '0',
        boxSizing: 'border-box',
        paddingBottom: '4px',
        overflowX: 'hidden',
        overflowY: 'auto'
      }}>
      
      {/* HEADER: User info & Timer */}
      <div style={{ 
        width: '100%', 
        maxWidth: '600px',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '4px',
        padding: '6px',
        backgroundColor: '#fafafa',
        borderRadius: '8px',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleBackToLevelSelect}
            style={{
              padding: '6px 12px',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ← Bölümler
          </button>
          <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#262626' }}>
            🦖 {user.username}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#8c8c8c' }}>
            🏆 {user.totalScore}
          </div>
        </div>
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
      
      {/* ÜST BİLGİ PANELİ: Bölüm, Hamle ve Timer */}
      <div style={{ width: '100%', maxWidth: '600px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', marginTop: '0' }}>
        <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Bölüm: {currentLevel.id}</h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1890ff' }}>
            ⏱️ {duration}s
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: isMaxMovesReached ? '#ff4d4f' : '#fff' }}>
            Hamle: {commands.length} / {currentLevel.maxMoves}
          </div>
        </div>
      </div>
      
      {/* OYUN ALANI */}
      <div style={{ 
        width: '100%', 
        maxWidth: '600px', 
        margin: '0 auto'
      }}>
        <Board 
          playerPos={playerPos} 
          playerDir={playerDir} 
          currentLevel={currentLevel}
          collectedItems={collectedItems} // Yeni eklenen prop
        />
      </div>

      {/* DETAYLI DURUM BİLDİRİMLERİ */}
      <div style={{ width: '100%', maxWidth: '600px', margin: '4px auto', fontSize: '0.85rem', fontWeight: 'bold', minHeight: '20px', textAlign: 'center' }}>
        {status === 'won' && <span style={{ color: '#52c41a' }}>Harika! Bölümü geçtin! 🎉</span>}
        {status === 'crashed' && <span style={{ color: '#ff4d4f' }}>Eyvah! Kayalara veya duvara çarptık. 💥</span>}
        {status === 'out_of_moves' && <span style={{ color: '#fa8c16' }}>Hedefe ulaşamadan hamlemiz bitti! 🔄</span>}
        {status === 'missing_collectibles' && <span style={{ color: '#fa8c16' }}>Yuvaya geldin ama yumurtaları unuttun! 🥚</span>}
        
        {/* Oyun oynanmıyorken toplanması gereken yumurtaları hatırlat */}
        {status === 'idle' && currentLevel.collectibles.length > 0 && (
          <span style={{ color: '#1890ff' }}>
            Hedef: Tüm yumurtaları topla ({collectedItems.length} / {currentLevel.collectibles.length})
          </span>
        )}
      </div>

      {/* YÖN KONTROLLERİ */}
      <div style={{ 
        width: '100%', 
        maxWidth: '600px', 
        margin: '0 auto'
      }}>
        <Controls onAddCommand={addCommand} disabled={isPlaying || isMaxMovesReached} playerDir={playerDir} />
      </div>
      
      <div style={{ 
        width: '100%', 
        maxWidth: '600px', 
        margin: '0 auto'
      }}>
        <CommandQueue commands={commands} activeIndex={activeIndex} initialDir={currentLevel.playerDir} />
      </div>

      {/* ALT BUTONLAR */}
      <div style={{ width: '100%', maxWidth: '600px', margin: '4px auto 0' }}>
        {/* Üst sıra: Geri Al ve Temizle */}
        <div style={{ display: 'flex', gap: '4px', width: '100%', marginBottom: '4px' }}>
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
// src/App.tsx
import { useGame } from './hooks/useGame';
import { Board } from './components/Board';
import { Controls } from './components/Controls';
import { CommandQueue } from './components/CommandQueue';

export default function App() {
  const {
    currentLevel,
    playerPos,
    playerDir,
    commands,
    isPlaying,
    status,
    activeIndex,
    collectedItems, // Yeni eklenen state
    addCommand,
    clearCommands,
    resetGame,
    runCommands,
    nextLevel // Yeni eklediğimiz seviye atlama fonksiyonu
  } = useGame();

  const actionBtnStyle = {
    flex: 1,
    padding: '15px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    borderRadius: '12px',
    border: 'none',
    color: 'white',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    cursor: 'pointer',
  };

  // Çocuğun hamle sınırını aşıp aşmadığını kontrol ediyoruz
  const isMaxMovesReached = commands.length >= currentLevel.maxMoves;

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      padding: '20px', 
      fontFamily: 'sans-serif', 
      width: '100%',
      maxWidth: '500px', 
      minWidth: '320px', // Minimum genişlik
      margin: '0 auto',
      boxSizing: 'border-box'
    }}>
      
      {/* ÜST BİLGİ PANELİ: Bölüm ve Hamle Sayısı */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h2 style={{ margin: 0 }}>Bölüm: {currentLevel.id}</h2>
        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: isMaxMovesReached ? 'red' : 'black' }}>
          Hamle: {commands.length} / {currentLevel.maxMoves}
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
      <div style={{ margin: '15px 0', fontSize: '1.1rem', fontWeight: 'bold', minHeight: '30px', textAlign: 'center' }}>
        {status === 'won' && <span style={{ color: 'green' }}>Harika! Bölümü geçtin! 🎉</span>}
        {status === 'crashed' && <span style={{ color: 'red' }}>Eyvah! Kayalara veya duvara çarptık. 💥</span>}
        {status === 'out_of_moves' && <span style={{ color: 'orange' }}>Hedefe ulaşamadan hamlemiz bitti! 🔄</span>}
        {status === 'missing_collectibles' && <span style={{ color: 'orange' }}>Yıldıza geldin ama pilleri unuttun! 🔋</span>}
        
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
      <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '20px' }}>
        <button 
          onClick={clearCommands} 
          disabled={isPlaying || commands.length === 0} 
          style={{...actionBtnStyle, backgroundColor: '#ff4d4f', opacity: isPlaying || commands.length === 0 ? 0.5 : 1}}
        >
          🗑️ Temizle
        </button>
        
        {status === 'won' ? (
          <button onClick={nextLevel} style={{...actionBtnStyle, backgroundColor: '#722ed1'}}>
            ⏭️ Sonraki Bölüm
          </button>
        ) : status !== 'idle' && !isPlaying ? (
          <button onClick={resetGame} style={{...actionBtnStyle, backgroundColor: '#1890ff'}}>
            🔄 Tekrar Dene
          </button>
        ) : (
          <button 
            onClick={runCommands} 
            disabled={isPlaying || commands.length === 0} 
            style={{...actionBtnStyle, backgroundColor: '#52c41a', opacity: isPlaying || commands.length === 0 ? 0.5 : 1}}
          >
            ▶️ Çalıştır
          </button>
        )}
      </div>
    </div>
  );
}
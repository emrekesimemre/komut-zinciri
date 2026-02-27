// src/components/LevelSelect.tsx
import { LEVELS } from '../constants/levels';
import { useAuth } from '../contexts/AuthContext';

interface LevelSelectProps {
  onSelectLevel: (levelIndex: number) => void;
  onBack: () => void;
}

export const LevelSelect = ({ onSelectLevel, onBack }: LevelSelectProps) => {
  const { user } = useAuth();
  const levelsCompleted = user?.levelsCompleted || 0;

  const getDifficulty = (levelId: number) => {
    if (levelId <= 5) return { text: 'Kolay', color: '#52c41a' };
    if (levelId <= 10) return { text: 'Orta', color: '#faad14' };
    if (levelId <= 15) return { text: 'İleri', color: '#fa8c16' };
    return { text: 'Zor', color: '#ff4d4f' };
  };

  const canPlayLevel = (levelId: number) => {
    // Level 1 is always available, others unlock after completing the previous one
    return levelId === 1 || levelsCompleted >= levelId - 1;
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Header */}
      <div style={{
        width: '100%',
        maxWidth: '800px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <button
          onClick={onBack}
          style={{
            padding: '10px 20px',
            backgroundColor: '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          ← Geri
        </button>
        <h1 style={{ margin: 0, color: '#262626', fontSize: '2rem' }}>
          🎮 Bölüm Seçimi
        </h1>
        <div style={{ width: '100px' }}></div>
      </div>

      {/* Progress Info */}
      <div style={{
        width: '100%',
        maxWidth: '800px',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#262626', marginBottom: '10px' }}>
          🏆 İlerleme
        </div>
        <div style={{ fontSize: '1rem', color: '#8c8c8c' }}>
          {levelsCompleted} / {LEVELS.length} Bölüm Tamamlandı
        </div>
        <div style={{
          width: '100%',
          height: '10px',
          backgroundColor: '#f0f0f0',
          borderRadius: '5px',
          marginTop: '15px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(levelsCompleted / LEVELS.length) * 100}%`,
            height: '100%',
            backgroundColor: '#52c41a',
            transition: 'width 0.3s ease'
          }}></div>
        </div>
      </div>

      {/* Level Grid */}
      <div style={{
        width: '100%',
        maxWidth: '800px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '15px'
      }}>
        {LEVELS.map((level, index) => {
          const difficulty = getDifficulty(level.id);
          const isUnlocked = canPlayLevel(level.id);
          const isCompleted = levelsCompleted >= level.id;

          return (
            <button
              key={level.id}
              onClick={() => isUnlocked && onSelectLevel(index)}
              disabled={!isUnlocked}
              style={{
                padding: '20px',
                backgroundColor: isUnlocked ? 'white' : '#f0f0f0',
                border: isCompleted ? '3px solid #52c41a' : '2px solid #d9d9d9',
                borderRadius: '12px',
                cursor: isUnlocked ? 'pointer' : 'not-allowed',
                opacity: isUnlocked ? 1 : 0.5,
                transition: 'all 0.2s ease',
                boxShadow: isUnlocked ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (isUnlocked) {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (isUnlocked) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)';
                }
              }}
            >
              {/* Completed Badge */}
              {isCompleted && (
                <div style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  fontSize: '1.2rem'
                }}>
                  ✅
                </div>
              )}

              {/* Lock Icon */}
              {!isUnlocked && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '2rem',
                  opacity: 0.6
                }}>
                  🔒
                </div>
              )}

              {/* Level Number */}
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#262626',
                marginBottom: '8px',
                opacity: isUnlocked ? 1 : 0.3
              }}>
                {level.id}
              </div>

              {/* Difficulty Badge */}
              <div style={{
                fontSize: '0.8rem',
                fontWeight: 'bold',
                color: difficulty.color,
                backgroundColor: `${difficulty.color}20`,
                padding: '4px 8px',
                borderRadius: '4px',
                marginBottom: '8px',
                opacity: isUnlocked ? 1 : 0.3
              }}>
                {difficulty.text}
              </div>

              {/* Level Info */}
              <div style={{
                fontSize: '0.75rem',
                color: '#8c8c8c',
                opacity: isUnlocked ? 1 : 0.3
              }}>
                {level.gridSize}×{level.gridSize} Grid
                <br />
                Max: {level.maxMoves} hamle
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

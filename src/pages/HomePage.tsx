import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { PUZZLE_CONFIGS } from '../utils/sudokuGenerator';
import type { Difficulty } from '../utils/sudokuGenerator';
import LevelScreen from '../components/ui/LevelScreen';

const DIFFICULTY_ORDER: Difficulty[] = ['4x4', '6x6', 'easy', 'medium', 'hard', 'expert'];

export default function HomePage() {
  const navigate  = useNavigate();
  const startGame = useGameStore(s => s.startGame);
  const bestTimes = useGameStore(s => s.bestTimes);

  return (
    <LevelScreen
      game="sudoku"
      onBack={() => navigate('/')}
      levels={DIFFICULTY_ORDER.map(key => {
        const cfg = PUZZLE_CONFIGS[key];
        return {
          id: key,
          label: cfg.label,
          meta: `${cfg.size === 9 ? '9×9 · ' : ''}${cfg.clueLabel} · ${cfg.description}`,
          best: bestTimes[key],
        };
      })}
      onPick={id => {
        startGame(id as Difficulty);
        navigate('/sudoku/play');
      }}
    />
  );
}

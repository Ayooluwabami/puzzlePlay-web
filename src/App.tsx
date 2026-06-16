import { Component, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import GameSelectPage from './pages/GameSelectPage';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import WordSearchPage from './pages/WordSearchPage';
import JigsawPage from './pages/JigsawPage';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null };
  static getDerivedStateFromError(e: Error) { return { error: e.message + '\n' + e.stack }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ background: '#0A0D14', color: '#F87171', padding: 32, fontFamily: 'monospace', whiteSpace: 'pre-wrap', fontSize: 13 }}>
          <strong style={{ fontSize: 16, color: '#FCA5A5' }}>Runtime Error</strong>{'\n\n'}{this.state.error}
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/"              element={<GameSelectPage />} />
          <Route path="/sudoku"        element={<HomePage />} />
          <Route path="/sudoku/play"   element={<GamePage />} />
          <Route path="/wordsearch"    element={<WordSearchPage />} />
          <Route path="/jigsaw"        element={<JigsawPage />} />
          <Route path="*"              element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

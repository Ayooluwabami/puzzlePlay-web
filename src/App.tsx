import { Component, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Toaster } from 'sonner';
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

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.18 } },
  exit:    { opacity: 0, transition: { duration: 0.12 } },
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} {...fade} style={{ width: '100%', minHeight: '100dvh' }}>
        <Routes location={location}>
          <Route path="/"              element={<GameSelectPage />} />
          <Route path="/sudoku"        element={<HomePage />} />
          <Route path="/sudoku/play"   element={<GamePage />} />
          <Route path="/wordsearch"    element={<WordSearchPage />} />
          <Route path="/jigsaw"        element={<JigsawPage />} />
          <Route path="*"              element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster position="top-center" richColors toastOptions={{ duration: 3000 }} />
        <AnimatedRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

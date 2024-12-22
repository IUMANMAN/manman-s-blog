import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import PostDetail from './components/PostDetail';
import EditPost from './components/EditPost';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {

  
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  const HomeWithSearch = useCallback(() => (
    <Home searchTerm={searchTerm} />
  ), [searchTerm]);

  const handleLogin = () => {
    localStorage.setItem('token', 'dummy-token');
    window.location.href = '/';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const header = document.querySelector('.App-header');
      
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsHeaderHidden(true);
      } else {
        setIsHeaderHidden(false);
      }
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  return (
    <Router>
      <div className="App">
        <header className={`App-header ${isHeaderHidden ? 'hidden' : ''}`}>
          <div className="header-content">
            <div className="header-left">
              <Link to="/" className="blog-title">
                <h1>my0sterick Blog</h1>
              </Link>
            </div>
            <div className="header-right">
              {isLoggedIn ? (
                <>
                  <Link to="/edit" className="nav-icon" title="新建文章">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </Link>
                  <button onClick={handleLogout} className="nav-icon logout-icon" title="登出">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </>
              ) : (
                <Link to="/login" className="login-icon" title="登录">
                  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </header>

        <div className="floating-buttons">
          <Link to="/" className="floating-button">
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
          <button className="floating-button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
          <button className="floating-button" onClick={toggleSearch}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        <div className={`search-overlay ${showSearch ? 'active' : ''}`}>
          <div className="search-container">
            <div className="search-input-container">
              <svg className="search-icon nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索文章..."
                className="search-input"
                autoFocus
              />
              <button className="close-search" onClick={toggleSearch}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <main>
          <Routes>
            <Route path="/" element={<HomeWithSearch />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route 
              path="/edit" 
              element={
                <PrivateRoute>
                  <EditPost />
                </PrivateRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 
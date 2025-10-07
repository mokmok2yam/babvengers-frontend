import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from './components/MainPage';
import MyMapPage from './components/MyMapPage';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';
import MyMapsPage from './components/MyMapsPage';
import MapDetailPage from './components/MapDetailPage';
import CommunityMapsPage from './components/CommunityMapsPage';
// import SearchPage from './components/SearchPage'; // 👈 1. 임포트 삭제
import './App.css';

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUser, setLoginUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setIsLoggedIn(true);
      setLoginUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setIsLoggedIn(true);
    setLoginUser(userData);
    setIsLoginOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={ <MainPage isLoggedIn={isLoggedIn} loginUser={loginUser?.nickname} onLoginClick={() => setIsLoginOpen(true)} onSignupClick={() => setIsSignupOpen(true)} onLogout={handleLogout} /> } 
        />
        <Route 
          path="/my-map" 
          element={ <MyMapPage isLoggedIn={isLoggedIn} loginUser={loginUser?.nickname} onLoginClick={() => setIsLoginOpen(true)} onSignupClick={() => setIsSignupOpen(true)} onLogout={handleLogout} /> } 
        />
        <Route 
          path="/my-maps" 
          element={ <MyMapsPage isLoggedIn={isLoggedIn} loginUser={loginUser} onLoginClick={() => setIsLoginOpen(true)} onSignupClick={() => setIsSignupOpen(true)} onLogout={handleLogout} /> } 
        />
        <Route 
          path="/map/:id" 
          element={ <MapDetailPage isLoggedIn={isLoggedIn} loginUser={loginUser} onLoginClick={() => setIsLoginOpen(true)} onSignupClick={() => setIsSignupOpen(true)} onLogout={handleLogout} /> } 
        />
        <Route 
          path="/maps" 
          element={ <CommunityMapsPage isLoggedIn={isLoggedIn} loginUser={loginUser} onLoginClick={() => setIsLoginOpen(true)} onSignupClick={() => setIsSignupOpen(true)} onLogout={handleLogout} /> } 
        />
        {/* 👇 2. /search 경로 삭제 */}
      </Routes>

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onLoginSuccess={handleLoginSuccess} 
      />
      <SignupModal 
        isOpen={isSignupOpen} 
        onClose={() => setIsSignupOpen(false)} 
      />
    </BrowserRouter>
  );
}

export default App;
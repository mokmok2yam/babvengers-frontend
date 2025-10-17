import { useState } from 'react';
import { Link } from 'react-router-dom';

function Header({ onLoginClick, onSignupClick, nickname, onHomeClick, isLoggedIn, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="menu-toggle" onClick={() => setIsMenuOpen(true)}>☰</div>
      <div className="brand" onClick={onHomeClick} style={{ cursor: 'pointer' }}>
        <img src="/logo.png" alt="밥벤저스 로고" className="logo" />
        <h1>밥벤저스</h1>
      </div>
      <nav className={isMenuOpen ? 'nav open' : 'nav'}>
        <span className="close-btn" onClick={() => setIsMenuOpen(false)}>✕</span>
        <ul>
          <li><Link to="/maps" onClick={() => setIsMenuOpen(false)}>맛집 지도</Link></li>
          <li><Link to="/my-maps" onClick={() => setIsMenuOpen(false)}>내 지도 관리</Link></li>
          <li><Link to="/my-reviews" onClick={() => setIsMenuOpen(false)}>내 리뷰 관리</Link></li>
          <li><Link to="/my-assemble" onClick={() => setIsMenuOpen(false)}>내 어셈블 관리</Link></li>
          <li>고객센터</li>
        </ul>
      </nav>
      <div className="auth-buttons">
        {isLoggedIn ? (
          <>
            <span style={{ fontWeight: 'bold', marginRight: '10px' }}>{nickname} 님</span>
            <button onClick={onLogout} style={{ marginLeft: '10px' }}>로그아웃</button>
          </>
        ) : (
          <>
            <button onClick={onLoginClick}>로그인</button>
            <button onClick={onSignupClick}>회원가입</button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
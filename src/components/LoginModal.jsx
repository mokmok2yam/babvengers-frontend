import { useState } from 'react';
import client from '../api/client';

function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      const response = await client.post('/users/login', {
        username: id,
        password: password,
      });

      const { nickname, token, userId, username } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ userId, username, nickname }));

      // App.js에 성공했다는 신호와 데이터를 보냄
      if (onLoginSuccess) {
        onLoginSuccess({ userId, username, nickname });
      }
      // (여기서 직접 모달을 닫는 코드는 없음)

    } catch (error) {
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'object') {
          setMessage('서버에서 오류가 발생했습니다.');
        } else {
          setMessage(error.response.data);
        }
      } else {
        setMessage('로그인 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>✕</span>
        <h2>로그인</h2>
        <form onSubmit={handleSubmit}>
          <label>
            아이디
            <input type="text" value={id} onChange={(e) => setId(e.target.value)} />
          </label>
          <label>
            비밀번호
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <button type="submit" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
          {message && <div style={{ marginTop: '10px', color: 'black' }}>{message}</div>}
        </form>
      </div>
    </div>
  );
}

export default LoginModal;
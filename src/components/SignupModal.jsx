import { useState } from 'react';
import client from '../api/client'; // axios 클라이언트 임포트

function SignupModal({ isOpen, onClose }) {
  // 백엔드에 필요한 필드만 남김
  const [formData, setFormData] = useState({
    username: '',
    nickname: '',
    password: '',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    try {
      // 백엔드에 회원가입 요청
      const response = await client.post('/users/signup', formData);

      setMessage('회원가입 완료! 잠시 후 창이 닫힙니다.');
      setTimeout(() => {
        setMessage('');
        onClose(); // 성공 시 모달 닫기
      }, 1000);

    } catch (error) {
      // 실패 응답을 받으면 (예: 아이디 중복)
      if (error.response && error.response.data) {
        setMessage(error.response.data); // 백엔드가 보내는 에러 메시지
      } else {
        setMessage('회원가입 중 오류가 발생했습니다.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>✕</span>
        <h2>회원가입</h2>
        <form onSubmit={handleSubmit}>
          {/* 아이디 입력란 */}
          <label>아이디</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="아이디"
            required
          />
          {/* 닉네임 입력란 */}
          <label>닉네임</label>
          <input
            type="text"
            name="nickname"
            value={formData.nickname}
            onChange={handleChange}
            placeholder="닉네임"
            required
          />
          {/* 비밀번호 입력란 */}
          <label>비밀번호</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="비밀번호"
            required
          />
          <div>
            <button type="submit">가입하기</button>
            <button type="button" onClick={onClose}>취소</button>
          </div>
          {message && <div style={{ marginTop: '10px', color: 'black' }}>{message}</div>}
        </form>
      </div>
    </div>
  );
}

export default SignupModal;
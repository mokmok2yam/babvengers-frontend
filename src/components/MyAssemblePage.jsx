import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from './Header';
import client from '../api/client';

function MyAssemblePage({ isLoggedIn, loginUser, onLoginClick, onSignupClick, onLogout }) {
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const fetchRequests = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      // API 엔드포인트 수정: 받은 요청 (내가 호스트)
      const [receivedRes, sentRes] = await Promise.all([
        client.get(`/matching/requests/received/${currentUser.userId}`),
        client.get(`/matching/requests/sent/${currentUser.userId}`)
      ]);
      
      setReceivedRequests(receivedRes.data);
      setSentRequests(sentRes.data);
    } catch (error) {
      console.error("어셈블 정보를 불러오는 데 실패했습니다:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 기능입니다.");
      navigate('/');
    } else {
      fetchRequests();
    }
  }, [isLoggedIn, navigate]);

  // 매칭 상태 업데이트 핸들러 (수락/거절)
  const handleUpdateStatus = async (matchingId, newStatus) => {
    try {
      await client.patch('/matching/update-status', { matchingId, status: newStatus });
      alert(`요청을 ${newStatus}했습니다.`);
      // 상태 업데이트 후 목록 새로고침
      fetchRequests();
    } catch (error) {
      console.error("상태 업데이트 실패:", error);
      alert("요청 처리 중 오류가 발생했습니다.");
    }
  };

  if (isLoading) {
    return (
      <>
        <Header isLoggedIn={isLoggedIn} nickname={loginUser?.nickname} onLoginClick={onLoginClick} onSignupClick={onSignupClick} onLogout={onLogout} onHomeClick={() => navigate('/')} />
        <p style={{ padding: '20px', textAlign: 'center' }}>어셈블 정보를 불러오는 중...</p>
      </>
    );
  }

  return (
    <>
      <Header isLoggedIn={isLoggedIn} nickname={loginUser?.nickname} onLoginClick={onLoginClick} onSignupClick={onSignupClick} onLogout={onLogout} onHomeClick={() => navigate('/')} />
      {/* ✨ 메인 콘텐츠 영역: 흰색 배경의 카드 스타일 적용 */}
      <div style={{ 
        padding: '30px 40px', 
        maxWidth: '1000px', 
        margin: '20px auto', 
        backgroundColor: '#ffffff', 
        borderRadius: '10px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
      }}>
        <h2>내 어셈블 관리 🤝 (신청 관리)</h2>

        {/* 받은 요청 섹션 (내가 호스트) */}
        <section style={{ marginBottom: '40px' }}>
          <h3 style={{ color: '#4CAF50' }}>받은 신청 (내가 호스트)</h3>
          {receivedRequests.length > 0 ? (
            receivedRequests.map(req => (
              <div key={req.id} style={{ 
                border: '1px solid #ddd', 
                padding: '15px', 
                borderRadius: '8px', 
                marginBottom: '10px', 
                backgroundColor: '#f9fff9', // 연한 녹색 계열 배경
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
              }}>
                <p style={{ margin: '0 0 10px' }}>
                  <strong>'{req.senderName}'</strong>님이 <strong style={{ color: '#FF9800' }}>'{req.title}'</strong> 모임에 신청했습니다.
                </p>
                <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#555' }}>
                  📍 맛집: {req.restaurantName} | 📅 시간: {req.meetingTime}
                </p>
                <p style={{ fontWeight: 'bold', color: req.status === '요청됨' ? '#FF9800' : (req.status === '수락됨' ? '#28a745' : '#dc3545') }}>
                    상태: {req.status}
                </p>
                {req.status === '요청됨' && (
                  <div>
                    <button onClick={() => handleUpdateStatus(req.id, '수락됨')} style={{ background: '#28a745', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', marginRight: '8px' }}>수락</button>
                    <button onClick={() => handleUpdateStatus(req.id, '거절됨')} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>거절</button>
                  </div>
                )}
              </div>
            ))
          ) : <p style={{ padding: '15px', border: '1px dashed #ccc', borderRadius: '8px', textAlign: 'center', backgroundColor: '#f9f9f9' }}>받은 신청이 없습니다.</p>}
        </section>

        {/* 보낸 요청 섹션 (내가 신청자) */}
        <section>
          <h3 style={{ color: '#FF6B6B' }}>보낸 신청 (내가 신청자)</h3>
          {sentRequests.length > 0 ? (
            sentRequests.map(req => (
              <div key={req.id} style={{ 
                border: '1px solid #ddd', 
                padding: '15px', 
                borderRadius: '8px', 
                marginBottom: '10px',
                backgroundColor: '#fff9f9', // 연한 붉은 계열 배경
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
              }}>
                <p style={{ margin: '0 0 10px' }}>
                  <strong>'{req.receiverName}'</strong>님(호스트)의 <strong style={{ color: '#FF9800' }}>'{req.title}'</strong> 모임에 신청했습니다.
                </p>
                <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#555' }}>
                  📍 맛집: {req.restaurantName} | 📅 시간: {req.meetingTime}
                </p>
                <p style={{ fontWeight: 'bold', color: req.status === '요청됨' ? '#FF9800' : (req.status === '수락됨' ? '#28a745' : '#dc3545') }}>
                    상태: {req.status}
                </p>
              </div>
            ))
          ) : <p style={{ padding: '15px', border: '1px dashed #ccc', borderRadius: '8px', textAlign: 'center', backgroundColor: '#f9f9f9' }}>보낸 신청이 없습니다.</p>}
        </section>
      </div>
    </>
  );
}

export default MyAssemblePage;
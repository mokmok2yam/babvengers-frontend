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
      // Promise.all을 사용해 두 API를 동시에 요청
      const [receivedRes, sentRes] = await Promise.all([
        client.get(`/matching/received/${currentUser.userId}`),
        client.get(`/matching/sent/${currentUser.userId}`)
      ]);
      setReceivedRequests(receivedRes.data);
      setSentRequests(sentRes.data);
    } catch (error) {
      console.error("매칭 정보를 불러오는 데 실패했습니다:", error);
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
        <p style={{ padding: '20px' }}>매칭 정보를 불러오는 중...</p>
      </>
    );
  }

  return (
    <>
      <Header isLoggedIn={isLoggedIn} nickname={loginUser?.nickname} onLoginClick={onLoginClick} onSignupClick={onSignupClick} onLogout={onLogout} onHomeClick={() => navigate('/')} />
      <div style={{ padding: '20px' }}>
        <h2>내 어셈블 관리 🤝</h2>

        {/* 받은 요청 섹션 */}
        <section style={{ marginBottom: '40px' }}>
          <h3>받은 요청</h3>
          {receivedRequests.length > 0 ? (
            receivedRequests.map(req => (
              <div key={req.id} style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>
                <p><strong>'{req.senderName}'</strong>님이 <strong>'{req.mapName}'</strong> 지도 기반으로 어셈블을 요청했습니다.</p>
                <p>상태: {req.status}</p>
                {req.status === '요청됨' && (
                  <div>
                    <button onClick={() => handleUpdateStatus(req.id, '수락됨')} style={{ background: '#28a745', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer', marginRight: '5px' }}>수락</button>
                    <button onClick={() => handleUpdateStatus(req.id, '거절됨')} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>거절</button>
                  </div>
                )}
              </div>
            ))
          ) : <p>받은 요청이 없습니다.</p>}
        </section>

        {/* 보낸 요청 섹션 */}
        <section>
          <h3>보낸 요청</h3>
          {sentRequests.length > 0 ? (
            sentRequests.map(req => (
              <div key={req.id} style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>
                <p><strong>'{req.receiverName}'</strong>님에게 <strong>'{req.mapName}'</strong> 지도로 어셈블을 요청했습니다.</p>
                <p>상태: {req.status}</p>
              </div>
            ))
          ) : <p>보낸 요청이 없습니다.</p>}
        </section>
      </div>
    </>
  );
}

export default MyAssemblePage;
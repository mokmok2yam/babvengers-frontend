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

  const handleUpdateStatus = async (matchingId, newStatus) => {
    try {
      await client.patch('/matching/update-status', { matchingId, status: newStatus });
      alert(`요청을 ${newStatus}했습니다.`);
      fetchRequests();
    } catch (error) {
      console.error("상태 업데이트 실패:", error);
      alert("요청 처리 중 오류가 발생했습니다.");
    }
  };

  // [New Logic] 신청 내역 삭제 핸들러
  const handleDeleteRequest = async (requestId, requestTitle, requestStatus) => {
    // 수락된 요청은 삭제 불가 확인
    if (requestStatus === '수락됨') {
        alert("수락된 신청은 삭제할 수 없습니다.");
        return;
    }

    const confirmMessage = requestStatus === '요청됨'
        ? `'${requestTitle}' 모임에 대한 신청을 취소하시겠습니까?`
        : `'${requestTitle}' 모임에 대한 신청 내역을 목록에서 삭제하시겠습니까?`;

    if (window.confirm(confirmMessage)) {
        try {
            // 백엔드 API 호출 시 신청 ID와 사용자 ID 전달
            await client.delete(`/matching/request/${requestId}/${currentUser.userId}`);
            alert(requestStatus === '요청됨' ? "신청이 취소되었습니다." : "신청 내역이 삭제되었습니다.");
            fetchRequests(); // 목록 새로고침
        } catch (error) {
            console.error("신청 내역 삭제 실패:", error.response?.data || error);
            alert(error.response?.data || "신청 내역 삭제/취소에 실패했습니다.");
        }
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
      <div style={{ padding: '30px 40px', maxWidth: '1000px', margin: '20px auto', backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
        <h2>내 어셈블 관리 🤝 (신청 관리)</h2>

        {/* 받은 요청 섹션 (내가 호스트) */}
        <section style={{ marginBottom: '40px' }}>
          <h3 style={{ color: '#4CAF50' }}>받은 신청 (내가 호스트)</h3>
          {receivedRequests.length > 0 ? (
            receivedRequests.map(req => (
              <div key={req.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '10px', backgroundColor: '#f9fff9', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <p style={{ margin: '0 0 10px' }}><strong>'{req.senderName}'</strong>님이 <strong style={{ color: '#FF9800' }}>'{req.title}'</strong> 모임에 신청했습니다.</p>
                <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#555' }}>📍 맛집: {req.restaurantName} | 📅 시간: {req.meetingTime}</p>
                <p style={{ fontWeight: 'bold', color: req.status === '요청됨' ? '#FF9800' : (req.status === '수락됨' ? '#28a745' : '#dc3545') }}>상태: {req.status}</p>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {req.status === '요청됨' && (
                      <>
                        <button onClick={() => handleUpdateStatus(req.id, '수락됨')} style={{ background: '#28a745', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', marginRight: '8px' }}>수락</button>
                        <button onClick={() => handleUpdateStatus(req.id, '거절됨')} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>거절</button>
                      </>
                    )}
                    {/* 👇 삭제 버튼: 수락됨이 아닐 때만 표시 (호스트가 받은 신청 삭제) */}
                    {req.status !== '수락됨' && (
                        <button
                            onClick={() => handleDeleteRequest(req.id, req.title, req.status)}
                            style={{ background: '#6c757d', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}
                            title="이 신청 내역을 내 목록에서 삭제합니다."
                        >
                            삭제
                        </button>
                    )}
                </div>
              </div>
            ))
          ) : <p style={{ padding: '15px', border: '1px dashed #ccc', borderRadius: '8px', textAlign: 'center', backgroundColor: '#f9f9f9' }}>받은 신청이 없습니다.</p>}
        </section>

        {/* 보낸 요청 섹션 (내가 신청자) */}
        <section>
          <h3 style={{ color: '#FF6B6B' }}>보낸 신청 (내가 신청자)</h3>
          {sentRequests.length > 0 ? (
            sentRequests.map(req => (
              <div key={req.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '10px', backgroundColor: '#fff9f9', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <p style={{ margin: '0 0 10px' }}><strong>'{req.receiverName}'</strong>님(호스트)의 <strong style={{ color: '#FF9800' }}>'{req.title}'</strong> 모임에 신청했습니다.</p>
                <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#555' }}>📍 맛집: {req.restaurantName} | 📅 시간: {req.meetingTime}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontWeight: 'bold', margin: 0, color: req.status === '요청됨' ? '#FF9800' : (req.status === '수락됨' ? '#28a745' : '#dc3545') }}>상태: {req.status}</p>
                    {/* 👇 삭제 버튼: 수락됨이 아닐 때만 표시 (신청자가 보낸 신청 취소/삭제) */}
                    {req.status !== '수락됨' && (
                        <button
                            onClick={() => handleDeleteRequest(req.id, req.title, req.status)}
                            style={{ background: '#6c757d', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}
                            title={req.status === '요청됨' ? "신청을 취소합니다." : "이 신청 내역을 내 목록에서 삭제합니다."}
                        >
                            {req.status === '요청됨' ? '신청 취소' : '삭제'}
                        </button>
                    )}
                </div>
              </div>
            ))
          ) : <p style={{ padding: '15px', border: '1px dashed #ccc', borderRadius: '8px', textAlign: 'center', backgroundColor: '#f9f9f9' }}>보낸 신청이 없습니다.</p>}
        </section>
      </div>
    </>
  );
}

export default MyAssemblePage;

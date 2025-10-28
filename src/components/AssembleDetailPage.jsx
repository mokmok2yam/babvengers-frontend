// 파일: src/components/AssembleDetailPage.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import client from '../api/client';

function AssembleDetailPage({ isLoggedIn, loginUser, onLoginClick, onSignupClick, onLogout }) {
  const [postData, setPostData] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams(); // 게시글 ID
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));

  // 1. 게시글 데이터 및 메시지 조회
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [postResponse, commentResponse] = await Promise.all([
        client.get(`/matching/${id}`),
        client.get(`/matching-comments/matching/${id}`) 
      ]);
      setPostData(postResponse.data);
      setComments(commentResponse.data);
    } catch (error) {
      console.error("데이터를 불러오는 데 실패했습니다:", error);
      alert("존재하지 않거나 삭제된 게시글입니다.");
      navigate('/assemble-board');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [id, navigate]);
  
  // 2. 카카오 지도 표시
  useEffect(() => {
    if (!postData || !window.kakao || !window.kakao.maps) return;
    const { latitude, longitude } = postData;
    if (latitude && longitude && (latitude !== 0.0 || longitude !== 0.0)) {
        window.kakao.maps.load(() => {
            const mapContainer = document.getElementById('assemble-map');
            if (!mapContainer) return;
            const position = new window.kakao.maps.LatLng(latitude, longitude);
            const map = new window.kakao.maps.Map(mapContainer, { center: position, level: 3 });
            const marker = new window.kakao.maps.Marker({ position });
            marker.setMap(map);
            const infowindow = new window.kakao.maps.InfoWindow({ removable: true });
            const content = `<div style="padding:5px; font-size:14px;"><b>${postData.restaurantName}</b></div>`;
            infowindow.setContent(content);
            infowindow.open(map, marker);
        });
    }
  }, [postData]);
  
  // 3. 신청 버튼 핸들러
  const handleApply = async () => {
    if (!isLoggedIn) {
      alert("신청하려면 로그인이 필요합니다.");
      onLoginClick();
      return;
    }
    if (window.confirm(`'${postData.title}' 모임에 신청하시겠습니까?`)) {
      try {
        await client.post(`/matching/${postData.id}/apply/${currentUser.userId}`);
        alert("신청 완료! '내 어셈블 관리' 페이지에서 호스트의 수락을 기다려주세요.");
        navigate('/assemble-board');
      } catch (error) {
        console.error("신청 실패:", error.response?.data || error);
        alert(error.response?.data || "신청에 실패했습니다. 이미 신청했는지 확인해주세요.");
      }
    }
  };
  
  // 4. 메시지 등록 핸들러
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!isLoggedIn) {
      alert("로그인이 필요합니다.");
      onLoginClick();
      return;
    }
    const commentData = { 
        userId: currentUser.userId, 
        matchingId: Number(id),
        content: newComment 
    };
    try {
        await client.post('/matching-comments', commentData);
        setNewComment('');
        // 메시지 목록만 새로고침
        const response = await client.get(`/matching-comments/matching/${id}`);
        setComments(response.data);
    } catch (error) {
        console.error("메시지 등록 실패:", error.response?.data || error);
        // 백엔드에서 보낸 권한 오류 메시지 표시
        alert(error.response?.data || "메시지 등록에 실패했습니다."); 
    }
  };
  
  // 5. 모집 마감 처리 핸들러
  const handleClosePost = async () => {
    if (!window.confirm("모집을 마감하면 더 이상 신청을 받을 수 없습니다. 계속하시겠습니까?")) {
        return;
    }
    try {
        await client.patch('/matching/update-status', { 
            matchingId: Number(id), 
            status: "모집마감" 
        });
        alert("게시글이 모집 마감되었습니다.");
        fetchAllData(); // 상태 변경 후 데이터 새로고침
    } catch (error) {
        console.error("모집 마감 실패:", error);
        alert("모집 마감 처리에 실패했습니다.");
    }
  };

  // 6. 게시글 삭제 핸들러
  const handleDeletePost = async () => {
    if (!window.confirm("정말로 이 게시글을 삭제하시겠습니까? 관련 신청 내역과 댓글도 모두 삭제됩니다.")) {
        return;
    }
    try {
        await client.delete(`/matching/${id}/${currentUser.userId}`);
        alert("게시글이 성공적으로 삭제되었습니다.");
        navigate('/assemble-board');
    } catch (error) {
        console.error("게시글 삭제 실패:", error.response?.data || error);
        alert(error.response?.data || "게시글 삭제에 실패했습니다.");
    }
  };


  if (isLoading) return <p>게시글을 불러오는 중...</p>;
  if (!postData) return <p>게시글 정보가 없습니다.</p>;

  const isHost = isLoggedIn && currentUser?.nickname === postData.senderName;
  const isRecruiting = postData.status === '모집중';
  const isClosed = postData.status === '모집마감';
  const isLocationValid = postData.latitude !== 0.0 && postData.longitude !== 0.0;
  
  // 👇👇👇 핵심 수정: 메시지 작성이 허용되는 조건 수정 👇👇👇
  // 로그인 되어 있고, 상태가 '모집중' 또는 '모집마감'이면 UI 활성화
  // (실제 권한: 호스트/수락된 참가자 여부는 백엔드가 검사)
  const isCommentAllowed = isLoggedIn && (isRecruiting || isClosed);
  // 👆👆👆 핵심 수정 끝 👆👆👆
  
  const mapStyle = { 
      width: '100%', 
      height: '300px', 
      borderRadius: '10px', 
      marginBottom: '20px', 
      backgroundColor: isLocationValid ? 'transparent' : '#f0f0f0' 
  };

  return (
    <>
      <Header isLoggedIn={isLoggedIn} nickname={loginUser?.nickname} onLoginClick={onLoginClick} onSignupClick={onSignupClick} onLogout={onLogout} onHomeClick={() => navigate('/')} />
      <div style={{ padding: '20px', maxWidth: '800px', margin: '20px auto', backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>

        {/* 게시글 제목 및 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', borderBottom: '2px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#FF6B6B' }}>{postData.title}</h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {isHost && isRecruiting && (
                <button onClick={handleClosePost} style={{ background: '#ffc107', color: 'black', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                    🔒 모집 마감하기
                </button>
            )}
            {isHost && (
                <button onClick={handleDeletePost} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                    🗑️ 게시글 삭제
                </button>
            )}
            {!isHost && isRecruiting && (
                <button onClick={handleApply} style={{ background: '#28a745', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }} disabled={!isLoggedIn}>
                    🤝 어셈블 신청하기
                </button>
            )}
          </div>
        </div>

        {/* 상세 정보 */}
        <div style={{ lineHeight: 1.8, marginBottom: '30px' }}>
          <p><strong>작성자:</strong> {postData.senderName}</p>
          <p><strong>모임 일시:</strong> {postData.meetingTime}</p>
          <p><strong>상태:</strong> <span style={{ color: isRecruiting ? '#FF9800' : (isClosed ? '#6c757d' : '#dc3545'), fontWeight: 'bold' }}>{postData.status}</span></p>
          <p style={{ marginTop: '15px', fontSize: '18px' }}>📍 <strong>맛집: {postData.restaurantName}</strong></p>
        </div>

        {/* 지도 표시 영역 */}
        <div id="assemble-map" style={mapStyle}>
           {!isLocationValid && (<div style={{ textAlign: 'center', paddingTop: '120px', height: '100%', borderRadius: '10px', backgroundColor: '#f0f0f0' }}>맛집 위치 정보가 정확하지 않아 지도를 표시할 수 없습니다.</div>)}
        </div>
        
        <hr style={{ margin: '40px 0' }} />
        
        {/* 메시지 섹션 */}
        <div>
            <h3 style={{ color: '#007bff' }}>모임 메시지 ({comments.length}개)</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>
                {comments.length > 0 ? (
                    comments.map(comment => (
                        <div key={comment.commentId} style={{ borderBottom: '1px dotted #ccc', padding: '8px 0' }}>
                            <strong style={{ color: '#4e342e' }}>{comment.nickname}</strong>: {comment.content}
                        </div>
                    ))
                ) : (
                    <p style={{ color: '#555', textAlign: 'center' }}>첫 메시지를 남겨보세요!</p>
                )}
            </div>
            
            {/* 메시지 입력 폼 */}
            {isLoggedIn ? (
                <form onSubmit={handleSubmitComment}>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        // 👇 placeholder 텍스트 수정
                        placeholder={isCommentAllowed ? "모임 참가자(호스트, 수락된 신청자)만 메시지를 남길 수 있습니다." : "모임이 모집중이거나 마감된 경우에만 메시지를 남길 수 있습니다."}
                        style={{ width: '100%', minHeight: '60px', padding: '5px', boxSizing: 'border-box', marginBottom: '10px' }}
                        required
                        disabled={!isCommentAllowed} // 권한(로그인 + 상태) 없으면 비활성화
                    />
                    <button 
                        type="submit" 
                        style={{ background: '#007bff', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px' }}
                        disabled={!isCommentAllowed} // 권한(로그인 + 상태) 없으면 비활성화
                    >
                        메시지 등록
                    </button>
                </form>
            ) : (
                <p style={{ textAlign: 'center', color: '#f44336' }}>로그인 후 메시지를 남길 수 있습니다.</p>
            )}
        </div>

        <p style={{ marginTop: '20px', textAlign: 'center' }}>
            <button onClick={() => navigate('/assemble-board')}>목록으로 돌아가기</button>
        </p>
      </div>
    </>
  );
}

export default AssembleDetailPage;


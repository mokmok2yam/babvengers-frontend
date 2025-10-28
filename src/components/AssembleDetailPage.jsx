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
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));

  // 1. 게시글 데이터 및 메시지 조회
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [postResponse, commentResponse] = await Promise.all([
        client.get(`/matching/${id}`),
        // 메시지 조회 API 호출 (게시글 ID는 신청 ID와 동일)
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
  
  // 2. 카카오 지도 표시 (로직 동일)
  useEffect(() => {
    if (!postData || !window.kakao || !window.kakao.maps) return;
    
    const { latitude, longitude } = postData;
    
    // 유효한 위치 정보가 있을 때만 지도 로직 실행
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
  
  // 3. 신청 버튼 핸들러 (로직 동일)
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
        navigate('/assemble-board'); // 신청 후 게시판 목록으로 돌아감
      } catch (error) {
        console.error("신청 실패:", error);
        alert("신청에 실패했습니다. 이미 신청했는지 확인해주세요.");
      }
    }
  };
  
  // 4. 메시지 등록 핸들러 (로직 수정)
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
        matchingId: Number(id), // 게시글 ID를 매칭 ID로 사용
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
        // 메시지 등록 권한이 없을 경우 메시지 출력
        alert(error.response?.data || "메시지 등록에 실패했습니다."); 
    }
  };
  
  // 5. [New Logic] 모집 마감 처리 핸들러 (로직 동일)
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


  if (isLoading) return <p>게시글을 불러오는 중...</p>;
  if (!postData) return <p>게시글 정보가 없습니다.</p>;

  const isHost = isLoggedIn && currentUser?.nickname === postData.senderName;
  const isRecruiting = postData.status === '모집중'; 
  const isLocationValid = postData.latitude !== 0.0 && postData.longitude !== 0.0;
  
  // [New Logic] 메시지 작성이 허용되는 조건
  // 현재 백엔드 로직에 따라 게시글 작성자(호스트)만 메시지 작성이 가능합니다.
  const isCommentAllowed = isHost && (isRecruiting || postData.status === '모집마감');
  
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
          
          <div style={{ display: 'flex', gap: '10px' }}>
            {/* 호스트이면서 모집중인 경우에만 '모집 마감하기' 버튼 표시 */}
            {isHost && isRecruiting && (
                <button
                    onClick={handleClosePost}
                    style={{ background: '#f44336', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    ❌ 모집 마감하기
                </button>
            )}

            {/* 호스트가 아니고 모집중인 경우에만 '어셈블 신청하기' 버튼 표시 */}
            {!isHost && isRecruiting && (
                <button
                    onClick={handleApply}
                    style={{ background: '#28a745', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                    disabled={!isLoggedIn}
                >
                    🤝 어셈블 신청하기
                </button>
            )}
          </div>
        </div>
        
        {/* 상세 정보 */}
        <div style={{ lineHeight: 1.8, marginBottom: '30px' }}>
          <p><strong>작성자:</strong> {postData.senderName}</p>
          <p><strong>모임 일시:</strong> {postData.meetingTime}</p>
          <p><strong>상태:</strong> <span style={{ color: isRecruiting ? '#FF9800' : '#dc3545', fontWeight: 'bold' }}>{postData.status}</span></p>
          <p style={{ marginTop: '15px', fontSize: '18px' }}>
            📍 <strong>맛집: {postData.restaurantName}</strong> 
          </p>
        </div>
        
        {/* 지도 표시 영역 */}
        <div id="assemble-map" style={mapStyle}>
           {!isLocationValid && (
               <div style={{ textAlign: 'center', paddingTop: '120px', height: '100%', borderRadius: '10px' }}>
                   맛집 위치 정보가 정확하지 않아 지도를 표시할 수 없습니다.
               </div>
           )}
        </div>
        
        <hr style={{ margin: '40px 0' }} />
        
        {/* 메시지 섹션 */}
        <div>
            <h3 style={{ color: '#007bff' }}>모임 메시지 ({comments.length}개)</h3>
            
            {/* 메시지 목록 */}
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
                        placeholder={isCommentAllowed ? "모임에 대한 질문이나 메시지를 남겨주세요." : "모임 참가자(현재는 호스트)만 메시지를 남길 수 있습니다."}
                        style={{ width: '100%', minHeight: '60px', padding: '5px', boxSizing: 'border-box', marginBottom: '10px' }}
                        required
                        disabled={!isCommentAllowed} // 권한이 없으면 비활성화
                    />
                    <button 
                        type="submit" 
                        style={{ background: '#007bff', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px' }}
                        disabled={!isCommentAllowed} // 권한이 없으면 비활성화
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
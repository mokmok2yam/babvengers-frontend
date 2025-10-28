// 파일: src/components/AssembleDetailPage.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import client from '../api/client';

function AssembleDetailPage({ isLoggedIn, loginUser, onLoginClick, onSignupClick, onLogout }) {
  const [postData, setPostData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));

  // 1. 게시글 데이터 조회
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 백엔드에 추가된 단일 게시글 조회 API 호출
        const response = await client.get(`/matching/${id}`);
        setPostData(response.data);
      } catch (error) {
        console.error("게시글을 불러오는 데 실패했습니다:", error);
        alert("존재하지 않거나 삭제된 게시글입니다.");
        navigate('/assemble-board');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);
  
  // 2. 카카오 지도 표시
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
        navigate('/assemble-board'); // 신청 후 게시판 목록으로 돌아감
      } catch (error) {
        console.error("신청 실패:", error);
        alert("신청에 실패했습니다. 이미 신청했는지 확인해주세요.");
      }
    }
  };

  if (isLoading) return <p>게시글을 불러오는 중...</p>;
  if (!postData) return <p>게시글 정보가 없습니다.</p>;

  const isHost = isLoggedIn && currentUser?.nickname === postData.senderName;
  const isLocationValid = postData.latitude !== 0.0 && postData.longitude !== 0.0;
  
  const mapStyle = { 
      width: '100%', 
      height: '300px', 
      borderRadius: '10px', 
      marginBottom: '20px', 
      backgroundColor: isLocationValid ? 'transparent' : '#f0f0f0' // 위치 정보 없으면 회색 배경
  };

  return (
    <>
      <Header isLoggedIn={isLoggedIn} nickname={loginUser?.nickname} onLoginClick={onLoginClick} onSignupClick={onSignupClick} onLogout={onLogout} onHomeClick={() => navigate('/')} />
      <div style={{ padding: '20px', maxWidth: '800px', margin: '20px auto', backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
        
        {/* 게시글 제목 및 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', borderBottom: '2px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#FF6B6B' }}>{postData.title}</h2>
          {!isHost && postData.status === '모집중' && (
            <button
              onClick={handleApply}
              style={{ background: '#28a745', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
              disabled={!isLoggedIn}
            >
              🤝 어셈블 신청하기
            </button>
          )}
        </div>
        
        {/* 상세 정보 */}
        <div style={{ lineHeight: 1.8, marginBottom: '30px' }}>
          <p><strong>작성자:</strong> {postData.senderName}</p>
          <p><strong>모임 일시:</strong> {postData.meetingTime}</p>
          <p><strong>상태:</strong> <span style={{ color: postData.status === '모집중' ? '#FF9800' : '#333' }}>{postData.status}</span></p>
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
        
        <p style={{ marginTop: '20px', textAlign: 'center' }}>
            <button onClick={() => navigate('/assemble-board')}>목록으로 돌아가기</button>
        </p>
      </div>
    </>
  );
}

export default AssembleDetailPage;
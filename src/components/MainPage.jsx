// 파일: src/components/MainPage.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Slider from './Slider';
import AssembleSection from './AssembleSection';
import client from '../api/client'; // 클라이언트 API 호출을 위한 파일 가정

function MainPage({ isLoggedIn, loginUser, onLoginClick, onSignupClick, onLogout }) {
  const navigate = useNavigate();
  
  // 상태 초기화 및 관리
  const [topRatedMaps, setTopRatedMaps] = useState([]);
  const [mostReviewedMaps, setMostReviewedMaps] = useState([]);
  
  // 관리자가 선정한 지도 (임시 데이터)
  const adminPicks = [
    { id: 0, name: '스윙스가 인정한 돈까스', averageRating: 5.0, reviewCount: 99, nickname: '밥벤저스' },
    { id: 1, name: '혼밥하기 좋은 국밥집', averageRating: 4.8, reviewCount: 102, nickname: '밥벤저스' },
  ];

  // API 호출로 데이터 가져오기 (마운트 시 실행)
  useEffect(() => {
    // API 주소 및 호출 방식은 사용자 프로젝트 환경에 맞춰 조정하세요.
    client.get('/map-collections?sortBy=averageRating')
      .then(response => setTopRatedMaps(response.data))
      .catch(error => console.error("Error fetching top rated maps:", error));
      
    client.get('/map-collections?sortBy=reviewCount')
      .then(response => setMostReviewedMaps(response.data))
      .catch(error => console.error("Error fetching most reviewed maps:", error));
  }, []);

  return (
    <>
      {/* Header 컴포넌트 */}
      <Header
        onLoginClick={onLoginClick}
        onSignupClick={onSignupClick}
        nickname={loginUser}
        onHomeClick={() => navigate('/')}
        isLoggedIn={isLoggedIn}
        onLogout={onLogout}
      />
      
      {/* 메인 콘텐츠 영역 (CSS의 max-width가 적용됨) */}
      <main>
        {/* AssembleSection: 지도 만들기 버튼 섹션 */}
        <AssembleSection onCreateMapClick={() => navigate('/my-map')} />
        
        {/* Slider: 지도 컬렉션 슬라이더 섹션 */}
        <Slider 
          topRatedMaps={topRatedMaps}
          mostReviewedMaps={mostReviewedMaps}
          adminPicks={adminPicks}
        />
        
        {/* Intro 섹션: '오늘 뭐 먹지?' - CSS로 카드 스타일 적용 */}
        <section className="intro">
          <div className="intro-content">
            <img 
              src="/eat food img.png" 
              alt="Food Image" 
              className="intro-image" 
              // 이미지가 public 폴더에 있다고 가정합니다.
            />
            <div>
              {/* 꾸며진 CSS가 적용될 h2 태그 */}
              <h2 className="intro-title">오늘 뭐 먹지?</h2> 
              <p>
                2025년 시작된 맛벤저스의 시작은 3명의 청년의 가벼운 고민인 
                <br />
                <strong>오늘 뭐 먹지?</strong> 였습니다.
              </p>
              <p>
                가짜 바이럴 맛집, 혼밥 고민에서 벗어날 수 있는 새로운 플랫폼
                <br />
                <strong>'진짜' 맛집 플랫폼</strong>을 소개합니다.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default MainPage;
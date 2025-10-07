import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Slider from './Slider';
import AssembleSection from './AssembleSection';
import client from '../api/client';

function MainPage({ isLoggedIn, loginUser, onLoginClick, onSignupClick, onLogout }) {
  const navigate = useNavigate();
  
  const [topRatedMaps, setTopRatedMaps] = useState([]);
  const [mostReviewedMaps, setMostReviewedMaps] = useState([]);
  const adminPicks = [
    { id: 0, name: '스윙스가 인정한 돈까스', averageRating: 5.0, reviewCount: 99, nickname: '밥벤저스' },
    { id: 1, name: '혼밥하기 좋은 국밥집', averageRating: 4.8, reviewCount: 102, nickname: '밥벤저스' },
  ];

  useEffect(() => {
    client.get('/map-collections?sortBy=averageRating')
      .then(response => setTopRatedMaps(response.data))
      .catch(error => console.error("별점 높은 지도 로딩 실패:", error));

    client.get('/map-collections?sortBy=reviewCount')
      .then(response => setMostReviewedMaps(response.data))
      .catch(error => console.error("리뷰 많은 지도 로딩 실패:", error));
  }, []);

  return (
    <>
      <Header
        onLoginClick={onLoginClick}
        onSignupClick={onSignupClick}
        nickname={loginUser}
        onHomeClick={() => navigate('/')}
        isLoggedIn={isLoggedIn}
        onLogout={onLogout}
      />
      <main>
        <Slider 
          topRatedMaps={topRatedMaps}
          mostReviewedMaps={mostReviewedMaps}
          adminPicks={adminPicks}
        />
        <AssembleSection onCreateMapClick={() => navigate('/my-map')} />
        <section className="intro">
          <div className="intro-content">
            <img src="/eat food img.png" alt="Food Image" className="intro-image" />
            <div>
              <h2>오늘 뭐 먹지?</h2>
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
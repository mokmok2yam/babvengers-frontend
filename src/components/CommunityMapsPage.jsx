import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from './Header';
import client from '../api/client';
import { StarRatingDisplay } from './StarRating'; // 👈 1. 별점 컴포넌트 임포트

function CommunityMapsPage({ isLoggedIn, loginUser, onLoginClick, onSignupClick, onLogout }) {
  const [allMaps, setAllMaps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAllMaps = async () => {
      setIsLoading(true);
      try {
        const response = await client.get(`/map-collections?keyword=${searchTerm}`);
        setAllMaps(response.data);
      } catch (error) {
        console.error("전체 지도 목록을 불러오는 데 실패했습니다:", error);
        alert("전체 지도 목록을 불러오는 데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllMaps();
  }, [searchTerm]);

  const handleSearch = () => {
    setSearchTerm(searchKeyword);
  };

  return (
    <>
      <Header
        isLoggedIn={isLoggedIn}
        nickname={loginUser?.nickname}
        onLoginClick={onLoginClick}
        onSignupClick={onSignupClick}
        onLogout={onLogout}
        onHomeClick={() => navigate('/')}
      />
      <div style={{ padding: '20px' }}>
        <h2>모든 맛집 지도 🌍</h2>

        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="지도 이름 또는 작성자 닉네임으로 검색"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            style={{ padding: '6px', width: '250px' }}
          />
          <button onClick={handleSearch} style={{ marginLeft: '10px' }}>검색</button>
        </div>

        {isLoading ? (
          <p>지도를 불러오는 중...</p>
        ) : allMaps.length > 0 ? (
          <ul>
            {allMaps.map((map) => (
              <li key={map.id} style={{ marginBottom: '10px', border: '1px solid #ddd', padding: '10px', borderRadius: '5px' }}>
                <Link to={`/map/${map.id}`} style={{ textDecoration: 'none', color: 'black' }}>
                  <strong>{map.name}</strong>
                  {/* 👇 2. 별점 표시 컴포넌트 추가 */}
                  <div style={{ marginTop: '5px' }}>
                    <StarRatingDisplay rating={map.averageRating} />
                  </div>
                  <p style={{ margin: '5px 0 0', color: '#555' }}>
                    작성자: {map.nickname} | {map.restaurants.length}개의 맛집 포함
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>'{searchTerm}'에 대한 검색 결과가 없습니다.</p>
        )}
      </div>
    </>
  );
}

export default CommunityMapsPage;
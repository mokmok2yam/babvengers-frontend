import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from './Header';
import client from '../api/client';
import { StarRatingDisplay } from './StarRating';

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
      {/* ✨ 메인 콘텐츠 영역: 흰색 배경의 카드 스타일 적용 */}
      <div style={{ 
        padding: '30px 40px', 
        maxWidth: '1200px', 
        margin: '20px auto', 
        backgroundColor: '#ffffff', 
        borderRadius: '10px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
      }}>
        <h2>모든 맛집 지도 🌍</h2>

        {/* 검색 섹션 스타일링 */}
        <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
          <input
            type="text"
            placeholder="지도 이름 또는 작성자 닉네임으로 검색"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            style={{ padding: '8px 12px', width: '250px', border: '1px solid #ccc', borderRadius: '5px' }}
          />
          <button 
            onClick={handleSearch} 
            style={{ marginLeft: '10px', padding: '8px 15px', background: '#FF9800', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            검색
          </button>
        </div>

        {isLoading ? (
          <p>지도를 불러오는 중...</p>
        ) : allMaps.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {allMaps.map((map) => (
              <li key={map.id} style={{ 
                marginBottom: '15px', 
                border: '1px solid #eee', 
                padding: '15px', 
                borderRadius: '8px',
                backgroundColor: '#fcfcfc', // 리스트 항목도 명확한 배경색
                transition: 'background-color 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                <Link to={`/map/${map.id}`} style={{ textDecoration: 'none', color: '#333', display: 'block' }}>
                  <h4 style={{ margin: '0 0 5px', fontSize: '18px', color: '#333' }}>{map.name}</h4>
                  <div style={{ marginTop: '5px' }}>
                    <StarRatingDisplay rating={map.averageRating} />
                  </div>
                  <p style={{ margin: '5px 0 0', color: '#555', fontSize: '14px' }}>
                    작성자: {map.nickname} | {map.restaurants.length}개의 맛집 포함
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ padding: '10px', border: '1px dashed #ccc', borderRadius: '5px', textAlign: 'center' }}>
            '{searchTerm}'에 대한 검색 결과가 없습니다.
          </p>
        )}
      </div>
    </>
  );
}

export default CommunityMapsPage;
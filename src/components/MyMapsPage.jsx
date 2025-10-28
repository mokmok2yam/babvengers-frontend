import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from './Header';
import client from '../api/client';
import { StarRatingDisplay } from './StarRating';

function MyMapsPage({ isLoggedIn, loginUser, onLoginClick, onSignupClick, onLogout }) {
  const [myMaps, setMyMaps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 기능입니다.");
      navigate('/');
      return;
    }
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.userId) return;

    const fetchMyMaps = async () => {
      setIsLoading(true);
      try {
        const response = await client.get(`/map-collections/user/${user.userId}`);
        setMyMaps(response.data);
      } catch (error) {
        console.error("내 지도 목록을 불러오는 데 실패했습니다:", error);
        alert("내 지도 목록을 불러오는 데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyMaps();
  }, [isLoggedIn, navigate]);

  const handleEdit = async (mapId, currentName) => {
    const newName = prompt("새로운 지도 제목을 입력하세요:", currentName);
    if (newName && newName.trim() !== "" && newName !== currentName) {
      try {
        await client.put(`/map-collections/${mapId}`, { name: newName });
        setMyMaps(myMaps.map(map => map.id === mapId ? { ...map, name: newName } : map));
        alert("지도 제목이 수정되었습니다.");
      } catch (error) {
        console.error("지도 수정 실패:", error);
        alert("지도 수정에 실패했습니다.");
      }
    }
  };

  const handleDelete = async (mapId) => {
    if (window.confirm("정말로 이 지도를 삭제하시겠습니까? 되돌릴 수 없습니다.")) {
      try {
        await client.delete(`/map-collections/${mapId}`);
        setMyMaps(myMaps.filter(map => map.id !== mapId));
        alert("지도가 삭제되었습니다.");
      } catch (error) {
        console.error("지도 삭제 실패:", error);
        alert("지도 삭제에 실패했습니다.");
      }
    }
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
      {/* 메인 콘텐츠 영역: 흰색 배경의 카드 스타일 적용 */}
      <div style={{ 
        padding: '30px 40px', 
        maxWidth: '1000px', 
        margin: '20px auto', 
        backgroundColor: '#ffffff', 
        borderRadius: '10px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
      }}>
        <h2>내 지도 관리 🗺️</h2>
        {isLoading ? (
          <p style={{ textAlign: 'center' }}>내 지도를 불러오는 중...</p>
        ) : myMaps.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {myMaps.map((map) => (
              <li key={map.id} style={{ 
                marginBottom: '15px', 
                padding: '15px', 
                borderRadius: '8px',
                backgroundColor: '#fcfcfc', // 각 지도 항목의 연한 배경색
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                border: '1px solid #eee'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  
                  {/* 지도 정보 영역 */}
                  <Link to={`/map/${map.id}`} style={{ textDecoration: 'none', color: '#333', flexGrow: 1, paddingRight: '20px' }}>
                    <h3 style={{ margin: '0 0 5px', fontSize: '20px', color: '#FF9800' }}>{map.name}</h3>
                    {/* 별점 표시 컴포넌트 */}
                    <div style={{ marginTop: '5px', marginBottom: '8px' }}>
                      <StarRatingDisplay rating={map.averageRating} />
                    </div>
                    {/* 👇 이 부분의 굵게 표시 마크다운을 제거했습니다. */}
                    <p style={{ margin: '0', color: '#555', fontSize: '14px' }}>
                      {map.restaurants.length}개의 맛집 포함
                    </p>
                  </Link>
                  
                  {/* 버튼 영역 */}
                  <div style={{ flexShrink: 0, marginTop: '5px' }}>
                    <button 
                      onClick={() => handleEdit(map.id, map.name)} 
                      style={{ 
                        background: '#FFCD00', 
                        color: '#333', 
                        border: 'none', 
                        padding: '5px 12px', 
                        borderRadius: '4px', 
                        cursor: 'pointer', 
                        marginRight: '8px', 
                        fontWeight: 'bold' 
                      }}
                    >
                      수정
                    </button>
                    <button 
                      onClick={() => handleDelete(map.id)} 
                      style={{ 
                        background: '#f44336', 
                        color: 'white', 
                        border: 'none', 
                        padding: '5px 12px', 
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ padding: '15px', border: '1px dashed #ccc', borderRadius: '8px', textAlign: 'center', backgroundColor: '#f9f9f9' }}>
            아직 저장한 지도가 없습니다. '나만의 지도 만들기'로 첫 지도를 만들어보세요!
          </p>
        )}
      </div>
    </>
  );
}

export default MyMapsPage;
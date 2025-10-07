import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from './Header';
import client from '../api/client';
import { StarRatingDisplay } from './StarRating'; // 👈 1. 별점 컴포넌트 임포트

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
      <div style={{ padding: '20px' }}>
        <h2>내 지도 관리 🗺️</h2>
        {isLoading ? (
          <p>내 지도를 불러오는 중...</p>
        ) : myMaps.length > 0 ? (
          <ul>
            {myMaps.map((map) => (
              <li key={map.id} style={{ marginBottom: '10px', border: '1px solid #ddd', padding: '10px', borderRadius: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link to={`/map/${map.id}`} style={{ textDecoration: 'none', color: 'black' }}>
                    <strong>{map.name}</strong>
                    {/* 👇 2. 별점 표시 컴포넌트 추가 */}
                    <div style={{ marginTop: '5px' }}>
                      <StarRatingDisplay rating={map.averageRating} />
                    </div>
                    <p style={{ margin: '5px 0 0', color: '#555' }}>{map.restaurants.length}개의 맛집 포함</p>
                  </Link>
                  <div>
                    <button onClick={() => handleEdit(map.id, map.name)} style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer', marginRight: '5px' }}>수정</button>
                    <button onClick={() => handleDelete(map.id)} style={{ background: '#f44336', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>삭제</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>아직 저장한 지도가 없습니다. '나만의 지도 만들기'로 첫 지도를 만들어보세요!</p>
        )}
      </div>
    </>
  );
}

export default MyMapsPage;
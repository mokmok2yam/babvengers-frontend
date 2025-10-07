import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import client from '../api/client'; // axios 클라이언트 임포트

function MyMapPage({ isLoggedIn, loginUser, onLoginClick, onSignupClick, onLogout }) {
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [mapTitle, setMapTitle] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // 카카오맵 스크립트가 로드되지 않았다면 함수 종료
    if (!window.kakao || !window.kakao.maps) return;

    // 카카오맵 API 로드
    window.kakao.maps.load(() => {
      const mapContainer = document.getElementById('my-map');
      const map = new window.kakao.maps.Map(mapContainer, {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780),
        level: 5,
      });

      // 검색 결과에 대한 마커들을 저장할 배열
      const markers = [];

      searchResults.forEach((place) => {
        const markerPosition = new window.kakao.maps.LatLng(place.y, place.x);
        const marker = new window.kakao.maps.Marker({
          map,
          position: markerPosition,
        });
        markers.push(marker);

        // 마커 클릭 시 보여줄 인포윈도우
        const infowindow = new window.kakao.maps.InfoWindow({
          content: `
            <div style="padding:5px;font-size:13px;">
              <b>${place.place_name}</b><br/>
              ${place.address_name}<br/>
              <button onclick="window.addPlace('${place.place_name}', '${place.address_name}', ${place.y}, ${place.x})">등록</button>
            </div>
          `,
          removable: true
        });

        window.kakao.maps.event.addListener(marker, 'click', () => {
          infowindow.open(map, marker);
        });
      });

      // 검색 결과가 있으면 첫번째 장소로 지도 중심 이동
      if (searchResults.length > 0) {
        const firstResult = searchResults[0];
        map.setCenter(new window.kakao.maps.LatLng(firstResult.y, firstResult.x));
      }

      // '등록' 버튼 클릭 시 호출될 전역 함수
      window.addPlace = (name, address, lat, lng) => {
        const alreadyExists = selectedPlaces.some(
          (p) => p.name === name && p.address === address
        );
        if (!alreadyExists) {
          setSelectedPlaces((prev) => [...prev, { name, address, lat: parseFloat(lat), lng: parseFloat(lng) }]);
          alert(`'${name}'이(가) 목록에 추가되었습니다.`);
        } else {
          alert('이미 추가된 장소입니다.');
        }
      };

      // 컴포넌트 언마운트 시 마커 정리
      return () => {
        markers.forEach((marker) => marker.setMap(null));
      };
    });
  }, [searchResults]); // searchResults가 변경될 때마다 지도 업데이트

  // 카카오 키워드 검색 API 호출 함수
  const handleSearch = async () => {
    if (!searchKeyword.trim()) return;
    
    // VITE_ 환경변수는 import.meta.env로 접근
    const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;

    const res = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(searchKeyword)}`,
      { headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` } }
    );
    const data = await res.json();
    setSearchResults(data.documents);
  };

  // '맛집 지도 등록하기' 버튼 클릭 시 실행될 함수
  const handleMapSave = async () => {
    if (!mapTitle.trim()) {
      alert("지도의 제목을 입력해주세요!");
      return;
    }
    if (selectedPlaces.length === 0) {
      alert("등록된 맛집이 없습니다!");
      return;
    }

    const savedUser = JSON.parse(localStorage.getItem('user'));
    if (!savedUser) {
      alert("로그인이 필요합니다!");
      navigate('/'); // 혹은 로그인 모달 열기
      return;
    }

    const restaurantInfos = selectedPlaces.map(place => ({
      name: place.name,
      address: place.address
    }));

    const requestData = {
      name: mapTitle,
      userId: savedUser.userId,
      restaurantInfos: restaurantInfos
    };

    try {
      await client.post('/map-collections', requestData);
      alert(`🗺️ "${mapTitle}" 지도가 성공적으로 저장되었습니다!`);
      navigate('/');
    } catch (error) {
      console.error("지도 저장 실패:", error);
      alert("지도 저장에 실패했습니다. 다시 시도해주세요.");
    }
  };

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
      <div style={{ padding: '20px' }}>
        <h2>나만의 맛집 지도 만들기</h2>

        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="맛집 키워드 검색 (예: 강남역 파스타)"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            style={{ padding: '6px', width: '250px' }}
          />
          <button onClick={handleSearch} style={{ marginLeft: '10px' }}>검색</button>
        </div>

        <div id="my-map" style={{ width: '100%', height: '400px', borderRadius: '10px', marginBottom: '20px' }}></div>

        <h3>내가 추가한 맛집 목록</h3>
        <ul>
          {selectedPlaces.map((place, idx) => (
            <li key={idx}>
              <strong>{place.name}</strong> ({place.address})
            </li>
          ))}
        </ul>

        <div style={{ marginTop: '30px' }}>
          <h3>📝 맛집 지도 제목</h3>
          <input
            type="text"
            placeholder="예: 내 최애 강남역 맛집 지도"
            value={mapTitle}
            onChange={(e) => setMapTitle(e.target.value)}
            style={{ padding: '8px', width: '300px', fontSize: '16px' }}
          />
          <button
            onClick={handleMapSave}
            style={{ marginLeft: '10px', background: '#FFCD00', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            맛집 지도 등록하기
          </button>
        </div>
      </div>
    </>
  );
}

export default MyMapPage;
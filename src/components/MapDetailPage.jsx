// 파일: src/components/MapDetailPage.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import client from '../api/client';
import { StarRatingInput, StarRatingDisplay } from './StarRating';

function MapDetailPage({ isLoggedIn, loginUser, onLoginClick, onSignupClick, onLogout }) {
  const [mapData, setMapData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [mapInstance, setMapInstance] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [infowindow, setInfowindow] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(0);
  const [newContent, setNewContent] = useState('');

  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [editingRating, setEditingRating] = useState(0);

  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [mapResponse, reviewsResponse] = await Promise.all([
          client.get(`/map-collections/${id}`),
          client.get(`/map-reviews/map/${id}`)
        ]);
        setMapData(mapResponse.data);
        setReviews(reviewsResponse.data);
      } catch (error) {
        console.error("데이터를 불러오는 데 실패했습니다:", error);
        alert("존재하지 않거나 삭제된 지도입니다.");
        navigate('/my-maps');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  useEffect(() => {
    if (!mapData || !window.kakao || !window.kakao.maps) return;
    window.kakao.maps.load(() => {
      const mapContainer = document.getElementById('detail-map');
      if (!mapContainer) return;
      const map = new window.kakao.maps.Map(mapContainer, { center: new window.kakao.maps.LatLng(37.5665, 126.9780), level: 5 });
      const iw = new window.kakao.maps.InfoWindow({ removable: true });
      const createdMarkers = [];
      const bounds = new window.kakao.maps.LatLngBounds();
      mapData.restaurants.forEach((resto, index) => {
        const position = new window.kakao.maps.LatLng(resto.latitude, resto.longitude);
        const marker = new window.kakao.maps.Marker({ position });
        marker.setMap(map);
        bounds.extend(position);
        createdMarkers.push(marker);
        window.kakao.maps.event.addListener(marker, 'click', function () {
          const content = `<div style="padding:5px; font-size:14px;"><b>${resto.name}</b><br/>${resto.address}</div>`;
          iw.setContent(content);
          iw.open(map, marker);
          setCurrentIndex(index);
        });
      });
      if (mapData.restaurants.length > 0) map.setBounds(bounds);
      setMapInstance(map);
      setMarkers(createdMarkers);
      setInfowindow(iw);
    });
  }, [mapData]);

  useEffect(() => {
    if (!mapInstance || markers.length === 0 || !infowindow || !mapData) return;
    if(currentIndex >= mapData.restaurants.length) return;
    const marker = markers[currentIndex];
    const restaurant = mapData.restaurants[currentIndex];
    mapInstance.panTo(marker.getPosition());
    const content = `<div style="padding:5px; font-size:14px;"><b>${restaurant.name}</b><br/>${restaurant.address}</div>`;
    infowindow.setContent(content);
    infowindow.open(mapInstance, marker);
  }, [currentIndex, mapInstance, markers, infowindow, mapData]);

  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + markers.length) % markers.length);
  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % markers.length);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (newRating === 0 || !newContent.trim()) {
      alert("별점과 리뷰 내용을 모두 입력해주세요.");
      return;
    }
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      alert("리뷰를 작성하려면 로그인이 필요합니다.");
      onLoginClick();
      return;
    }
    const reviewData = { userId: user.userId, mapCollectionId: Number(id), rating: newRating, content: newContent };
    try {
      await client.post('/map-reviews', reviewData);
      alert("리뷰가 등록되었습니다.");
      const response = await client.get(`/map-reviews/map/${id}`);
      setReviews(response.data);
      setNewRating(0);
      setNewContent('');
    } catch (error) {
      console.error("리뷰 등록 실패:", error);
      alert("리뷰 등록에 실패했습니다.");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("정말로 리뷰를 삭제하시겠습니까?")) {
      try {
        await client.delete(`/map-reviews/${reviewId}`);
        setReviews(reviews.filter(r => r.reviewId !== reviewId));
        alert("리뷰가 삭제되었습니다.");
      } catch (error) {
        console.error("리뷰 삭제 실패:", error);
        alert("리뷰 삭제에 실패했습니다.");
      }
    }
  };

  const handleStartEdit = (review) => {
    setEditingReviewId(review.reviewId);
    setEditingContent(review.content);
    setEditingRating(review.rating);
  };

  const handleSaveEdit = async (reviewId) => {
    const reviewData = { userId: currentUser.userId, mapCollectionId: Number(id), content: editingContent, rating: editingRating };
    try {
      await client.put(`/map-reviews/${reviewId}`, reviewData);
      const response = await client.get(`/map-reviews/map/${id}`);
      setReviews(response.data);
      setEditingReviewId(null);
      alert("리뷰가 수정되었습니다.");
    } catch (error) {
      console.error("리뷰 수정 실패:", error);
      alert("리뷰 수정에 실패했습니다.");
    }
  };

  if (isLoading) return <p>페이지를 불러오는 중...</p>;
  if (!mapData) return <p>지도 정보가 없습니다.</p>;

  return (
    <>
      <Header isLoggedIn={isLoggedIn} nickname={loginUser?.nickname} onLoginClick={onLoginClick} onSignupClick={onSignupClick} onLogout={onLogout} onHomeClick={() => navigate('/')} />
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h2>{mapData.name}</h2>
        </div>
        <p>작성자: {mapData.nickname}</p>

        <div id="detail-map" style={{ width: '100%', height: '400px', borderRadius: '10px', marginBottom: '20px' }}></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h3>맛집 목록</h3>
          {markers.length > 0 && (
            <div>
              <button onClick={handlePrev}>&lt; 이전</button>
              <button onClick={handleNext} style={{ marginLeft: '5px' }}>다음 &gt;</button>
            </div>
          )}
        </div>
        <ul>
          {mapData.restaurants.map((resto, index) => (
            <li key={index} style={{ fontWeight: index === currentIndex ? 'bold' : 'normal', cursor: 'pointer' }} onClick={() => setCurrentIndex(index)}>
              {index + 1}. {resto.name} ({resto.address})
            </li>
          ))}
        </ul>

        <hr style={{ margin: '40px 0' }} />

        <div>
          <h3>리뷰</h3>
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.reviewId} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
                {editingReviewId === review.reviewId ? (
                  <div>
                    <strong>{review.nickname || review.username}</strong>
                    <StarRatingInput rating={editingRating} setRating={setEditingRating} />
                    <textarea value={editingContent} onChange={(e) => setEditingContent(e.target.value)} style={{ width: '100%', minHeight: '60px', marginTop: '5px' }} />
                    <button onClick={() => handleSaveEdit(review.reviewId)}>저장</button>
                    <button onClick={() => setEditingReviewId(null)} style={{ marginLeft: '5px' }}>취소</button>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{review.nickname || review.username}</strong>
                      {currentUser?.userId === review.authorId && (
                        <div>
                          <button onClick={() => handleStartEdit(review)} style={{ marginRight: '5px' }}>수정</button>
                          <button onClick={() => handleDeleteReview(review.reviewId)}>삭제</button>
                        </div>
                      )}
                    </div>
                    <StarRatingDisplay rating={review.rating} />
                    <p>{review.content}</p>
                  </div>
                )}
              </div>
            ))
          ) : (<p>아직 작성된 리뷰가 없습니다. 첫 리뷰를 남겨주세요!</p>)}
        </div>

        {isLoggedIn && (
          <div style={{ marginTop: '20px' }}>
            <h4>리뷰 작성하기</h4>
            <form onSubmit={handleSubmitReview}>
              <StarRatingInput rating={newRating} setRating={setNewRating} />
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="지도에 대한 평가를 남겨주세요."
                style={{ width: '100%', minHeight: '80px', marginTop: '10px', padding: '5px' }}
                required
              />
              <button type="submit" style={{ marginTop: '10px' }}>리뷰 등록</button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}

export default MapDetailPage;
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from './Header';
import client from '../api/client';
import { StarRatingInput, StarRatingDisplay } from './StarRating';

function MyReviewsPage({ isLoggedIn, loginUser, onLoginClick, onSignupClick, onLogout }) {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));

  // 수정 관련 상태
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [editingRating, setEditingRating] = useState(0);

  // 내가 쓴 리뷰 목록을 불러오는 함수
  const fetchMyReviews = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const response = await client.get(`/map-reviews/user/${currentUser.userId}`);
      setReviews(response.data);
    } catch (error) {
      console.error("내 리뷰 목록을 불러오는 데 실패했습니다:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 기능입니다.");
      navigate('/');
    } else {
      fetchMyReviews();
    }
  }, [isLoggedIn, navigate]);

  // 리뷰 삭제 핸들러
  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("정말로 리뷰를 삭제하시겠습니까?")) {
      try {
        await client.delete(`/map-reviews/${reviewId}`);
        setReviews(reviews.filter(r => r.reviewId !== reviewId));
        alert("리뷰가 삭제되었습니다.");
      } catch (error) {
        alert("리뷰 삭제에 실패했습니다.");
      }
    }
  };
  
  // 리뷰 수정 시작 핸들러
  const handleStartEdit = (review) => {
    setEditingReviewId(review.reviewId);
    setEditingContent(review.content);
    setEditingRating(review.rating);
  };
  
  // 리뷰 수정 취소 핸들러
  const handleCancelEdit = () => {
    setEditingReviewId(null);
  };

  // 리뷰 수정 저장 핸들러
  const handleSaveEdit = async (reviewId) => {
    const reviewData = { userId: currentUser.userId, content: editingContent, rating: editingRating };
    try {
      await client.put(`/map-reviews/${reviewId}`, reviewData);
      await fetchMyReviews(); // 목록 새로고침
      setEditingReviewId(null);
      alert("리뷰가 수정되었습니다.");
    } catch (error) {
      alert("리뷰 수정에 실패했습니다.");
    }
  };

  return (
    <>
      <Header isLoggedIn={isLoggedIn} nickname={loginUser?.nickname} onLoginClick={onLoginClick} onSignupClick={onSignupClick} onLogout={onLogout} onHomeClick={() => navigate('/')} />
      <div style={{ padding: '20px' }}>
        <h2>내 리뷰 관리 📝</h2>
        {isLoading ? <p>리뷰를 불러오는 중...</p> : reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.reviewId} style={{ borderBottom: '1px solid #eee', padding: '15px 0' }}>
              <p style={{ color: '#555', fontSize: '14px' }}>
                📍 <Link to={`/map/${review.mapId}`}><strong>{review.mapName}</strong></Link> 지도에 작성한 리뷰
              </p>
              {editingReviewId === review.reviewId ? (
                // 수정 모드
                <div>
                  <StarRatingInput rating={editingRating} setRating={setEditingRating} />
                  <textarea value={editingContent} onChange={(e) => setEditingContent(e.target.value)} style={{ width: '100%', minHeight: '60px', marginTop: '5px' }} />
                  <button onClick={() => handleSaveEdit(review.reviewId)}>저장</button>
                  <button onClick={handleCancelEdit} style={{ marginLeft: '5px' }}>취소</button>
                </div>
              ) : (
                // 보기 모드
                <div>
                  <StarRatingDisplay rating={review.rating} />
                  <p>{review.content}</p>
                  <div>
                    <button onClick={() => handleStartEdit(review)} style={{ marginRight: '5px' }}>수정</button>
                    <button onClick={() => handleDeleteReview(review.reviewId)}>삭제</button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : <p>아직 작성한 리뷰가 없습니다.</p>}
      </div>
    </>
  );
}

export default MyReviewsPage;
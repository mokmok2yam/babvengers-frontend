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
      {/* ✨ 메인 콘텐츠 영역: 흰색 배경의 카드 스타일 적용 */}
      <div style={{ 
        padding: '30px 40px', 
        maxWidth: '800px', 
        margin: '20px auto', 
        backgroundColor: '#ffffff', 
        borderRadius: '10px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
      }}>
        <h2>내 리뷰 관리 📝</h2>
        
        {isLoading ? <p>리뷰를 불러오는 중...</p> : reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.reviewId} style={{ 
              marginBottom: '20px', 
              border: '1px solid #ddd', 
              padding: '15px', 
              borderRadius: '8px',
              backgroundColor: '#fcfcfc', // 각 리뷰 항목의 배경
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <p style={{ color: '#555', fontSize: '14px', borderBottom: '1px dashed #ddd', paddingBottom: '10px', marginBottom: '10px' }}>
                📍 <Link to={`/map/${review.mapId}`} style={{ color: '#007bff', fontWeight: 'bold' }}>{review.mapName}</Link> 지도에 작성한 리뷰
              </p>
              {editingReviewId === review.reviewId ? (
                // 수정 모드
                <div>
                  <StarRatingInput rating={editingRating} setRating={setEditingRating} />
                  <textarea 
                    value={editingContent} 
                    onChange={(e) => setEditingContent(e.target.value)} 
                    style={{ width: '100%', minHeight: '60px', marginTop: '10px', padding: '8px', border: '1px solid #FFCD00', borderRadius: '4px' }} 
                  />
                  <button onClick={() => handleSaveEdit(review.reviewId)} style={{ background: '#FFCD00', color: '#333', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}>저장</button>
                  <button onClick={handleCancelEdit} style={{ marginLeft: '5px', background: '#ccc', color: '#333', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}>취소</button>
                </div>
              ) : (
                // 보기 모드
                <div>
                  <StarRatingDisplay rating={review.rating} />
                  <p style={{ margin: '10px 0' }}>{review.content}</p>
                  <div>
                    <button onClick={() => handleStartEdit(review)} style={{ marginRight: '5px', background: '#FFCD00', color: '#333', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>수정</button>
                    <button onClick={() => handleDeleteReview(review.reviewId)} style={{ background: '#f44336', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>삭제</button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : <p style={{ padding: '15px', border: '1px dashed #ccc', borderRadius: '8px', textAlign: 'center', backgroundColor: '#f9f9f9' }}>아직 작성한 리뷰가 없습니다.</p>}
      </div>
    </>
  );
}

export default MyReviewsPage;
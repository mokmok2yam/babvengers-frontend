import React from 'react';

// 별점 입력을 위한 컴포넌트
function StarRatingInput({ rating, setRating }) {
  return (
    <div>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{ cursor: 'pointer', color: star <= rating ? '#FFD700' : '#ccc', fontSize: 24 }}
          onClick={() => setRating(star)}
          aria-label={`${star} stars`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

// 별점 표시를 위한 컴포넌트
function StarRatingDisplay({ rating }) {
  // 점수가 없거나 숫자가 아니면 회색 별 5개 표시
  if (typeof rating !== 'number' || !rating || rating === 0) {
    return <div style={{ color: '#ccc', display: 'flex', alignItems: 'center' }}>{'★'.repeat(5)} <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>-</span></div>;
  }

  const fullStars = Math.floor(rating);
  const emptyStars = 5 - fullStars;

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <span style={{ color: '#FFD700' }}>{'★'.repeat(fullStars)}</span>
      <span style={{ color: '#ccc' }}>{'★'.repeat(emptyStars)}</span>
      <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>{rating.toFixed(1)}</span>
    </div>
  );
}

export { StarRatingInput, StarRatingDisplay };
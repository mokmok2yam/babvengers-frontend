import { Link } from 'react-router-dom';
import { StarRatingDisplay } from './StarRating';
import { useState } from 'react';

function MapListSection({ title, maps }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  
  const validMaps = Array.isArray(maps) ? maps : [];
  const totalPages = Math.ceil(validMaps.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMaps = validMaps.slice(startIndex, endIndex);

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };
  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  if (!validMaps || validMaps.length === 0) {
    return null;
  }

  return (
    <div className="map-list-section">
      {/* 1. 제목은 헤더에 그대로 둡니다. */}
      <div className="slider-header">
        <h3>{title}</h3>
      </div>

      {/* 2. 버튼과 슬라이더를 감싸는 새 래퍼를 만듭니다. */}
      <div className="slider-wrapper">
        {/* 3. 이전 버튼 (왼쪽) */}
        <button 
          onClick={handlePrev} 
          disabled={currentPage === 1} 
          className="slider-nav-btn prev"
          // 지도가 4개 이하일 때는 버튼을 숨깁니다.
          style={{ visibility: validMaps.length > itemsPerPage ? 'visible' : 'hidden' }}
        >
          &lt;
        </button>

        {/* 4. 카드 목록 (기존 slider) */}
        <div className="slider">
          {currentMaps.map((map) => (
            <Link to={`/map/${map.id}`} key={map.id} className="slide">
              <h4>{map.name}</h4>
              <StarRatingDisplay rating={map.averageRating} />
              <p>리뷰 {map.reviewCount}개 | 작성자: {map.nickname}</p>
            </Link>
          ))}
        </div>

        {/* 5. 다음 버튼 (오른쪽) */}
        <button 
          onClick={handleNext} 
          disabled={currentPage === totalPages} 
          className="slider-nav-btn next"
          style={{ visibility: validMaps.length > itemsPerPage ? 'visible' : 'hidden' }}
        >
          &gt;
        </button>
      </div>
    </div>
  );
}

// 이 아래 Slider 컴포넌트는 수정할 필요가 없습니다.
function Slider({ topRatedMaps, mostReviewedMaps, adminPicks }) {
  return (
    <>
      <MapListSection title="⭐ 별점 높은 맛집 지도" maps={topRatedMaps} />
      <MapListSection title="💬 리뷰 많은 맛집 지도" maps={mostReviewedMaps} />
      <MapListSection title="👑 밥벤저스 선정 맛집 지도" maps={adminPicks} />
    </>
  );
}

export default Slider;
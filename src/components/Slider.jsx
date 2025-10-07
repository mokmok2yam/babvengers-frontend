import { Link } from 'react-router-dom';
import { StarRatingDisplay } from './StarRating';

function MapListSection({ title, maps }) {
  if (!maps || maps.length === 0) {
    return null; // 데이터가 없으면 섹션 자체를 숨김
  }
  return (
    <div className="map-list-section">
      <h3>{title}</h3>
      <div className="slider">
        {maps.slice(0, 5).map((map) => ( // 최대 5개만 보여주기
          <Link to={`/map/${map.id}`} key={map.id} className="slide">
            <h4>{map.name}</h4>
            <StarRatingDisplay rating={map.averageRating} />
            <p>리뷰 {map.reviewCount}개 | 작성자: {map.nickname}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

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
import { useState } from 'react';

const placeDetails = [
  {
    title: '서울 돈카츠 맛집',
    detail: '스윙스씨가 10년간 찾아다닌 서울 돈카츠 맛집 리스트입니다.\n1. 망원동 헤키\n2. 신사동 꿉당',
  },
  {
    title: '역시 점심은 제육이지~',
    detail: '김제육씨의 제육볶음 맛집 리스트입니다.\n1. (추가 예정)',
  },
  {
    title: '새로운 음식이 먹고싶다',
    detail: '이탈리아 사람 곤잘레스가 추천하는 외국음식 맛집 리스트입니다.\n1. (추가 예정)',
  },
];

function RecommendedPlaces() {
  const [openIdx, setOpenIdx] = useState(null);

  const handleOpen = (idx) => setOpenIdx(idx);
  const handleClose = () => setOpenIdx(null);

  return (
    <>
      <section className="recommended-places">
        <h2>오늘의 맛잘알 지도</h2>
        <div className="place-list">
          {placeDetails.map((place, idx) => (
            <div className="place-item" key={idx} onClick={() => handleOpen(idx)} style={{ cursor: 'pointer' }}>
              <h3>{place.title}</h3>
              <p>{place.detail.split('\n')[0]}</p>
              <button>자세히 보기</button>
            </div>
          ))}
        </div>
      </section>
      {openIdx !== null && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', borderRadius: 8, padding: 24, minWidth: 300, maxWidth: 400, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', position: 'relative'
          }}>
            <button onClick={handleClose} style={{
              position: 'absolute', top: 10, right: 10, fontSize: 18, background: 'none', border: 'none', cursor: 'pointer'
            }}>✕</button>
            <h2 style={{ marginTop: 0 }}>{placeDetails[openIdx].title}</h2>
            <p style={{ whiteSpace: 'pre-line' }}>{placeDetails[openIdx].detail}</p>
          </div>
        </div>
      )}
    </>
  );
}

export default RecommendedPlaces; 
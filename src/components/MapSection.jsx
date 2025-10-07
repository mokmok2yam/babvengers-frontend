import { useEffect } from 'react';

const places = [
  {
    name: '맛집1',
    lat: 37.5665,
    lng: 126.9780,
    desc: '서울의 대표 맛집1',
  },
  {
    name: '맛집2',
    lat: 37.5651,
    lng: 126.9895,
    desc: '서울의 대표 맛집2',
  },
  // 원하는 만큼 추가
];

function MapSection() {
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) return;
    const container = document.getElementById('map');
    const options = {
      center: new window.kakao.maps.LatLng(37.5665, 126.9780),
      level: 5,
    };
    const map = new window.kakao.maps.Map(container, options);
    places.forEach(place => {
      const marker = new window.kakao.maps.Marker({
        map,
        position: new window.kakao.maps.LatLng(place.lat, place.lng),
      });
      const infowindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:5px;font-size:14px;"><b>${place.name}</b><br/>${place.desc}</div>`,
      });
      window.kakao.maps.event.addListener(marker, 'click', function () {
        infowindow.open(map, marker);
      });
    });
  }, []);

  return (
    <div>
      <h2>맛집 지도</h2>
      <div id="map" style={{ width: '100%', height: '400px', borderRadius: '10px' }}></div>
    </div>
  );
}

export default MapSection; 
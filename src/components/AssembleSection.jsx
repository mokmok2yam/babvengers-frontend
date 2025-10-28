// 파일: src/components/AssembleSection.jsx

import React from 'react';
import './AssembleSection.css'; // 여기에 AssembleSection 전용 CSS를 추가할 수 있습니다.

function AssembleSection({ onCreateMapClick }) {
  return (
    <section className="assemble-section"> {/* 이 섹션에 말풍선 스타일을 적용합니다. */}
      {/* 위쪽 이미지들 (장식용) */}
      <div className="assemble-top-deco">
        {/* 이 부분은 이미지 1에 보이는 상단 아이콘들이라고 가정합니다.
            실제 프로젝트에 맞게 이 부분을 img 태그들로 채워주세요. */}
        <img src="/assets/food_icon_1.png" alt="food icon" className="food-icon top-left" />
        <img src="/assets/food_icon_2.png" alt="food icon" className="food-icon top-center" />
        <img src="/assets/food_icon_3.png" alt="food icon" className="food-icon top-right" />
      </div>

      <div className="assemble-content">
        <h2>나만의 지도를 만들어 공유해보세요!</h2>
        <p>
          자신만의 맛집 컬렉션을 만들고 친구들과 함께 새로운 맛의 세계를 탐험할 시간입니다.
        </p>
        <button onClick={onCreateMapClick} className="create-map-button">
          나만의 지도 만들기
        </button>
      </div>

      {/* 아래쪽 이미지들 (장식용) */}
      <div className="assemble-bottom-deco">
        {/* 이 부분은 이미지 1에 보이는 하단 아이콘들이라고 가정합니다.
            실제 프로젝트에 맞게 이 부분을 img 태그들로 채워주세요. */}
        <img src="/assets/food_icon_4.png" alt="food icon" className="food-icon bottom-left" />
        <img src="/assets/food_icon_5.png" alt="food icon" className="food-icon bottom-right" />
      </div>
    </section>
  );
}

export default AssembleSection;
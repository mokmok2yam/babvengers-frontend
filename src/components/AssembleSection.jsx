// 파일: src/components/AssembleSection.jsx

import React from 'react';
// import './AssembleSection.css'; // ❌ 삭제: 이 파일을 찾을 수 없어 발생한 오류를 해결합니다.

function AssembleSection({ onCreateMapClick }) {
  return (
    <section className="assemble-section"> {/* 이 섹션에 말풍선 스타일을 적용합니다. */}
      {/* 위쪽 이미지들 (장식용) - food icon 텍스트 문제 해결을 위해 내부 태그 제거 */}
      <div className="assemble-top-deco">
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

      {/* 아래쪽 이미지들 (장식용) - food icon 텍스트 문제 해결을 위해 내부 태그 제거 */}
      <div className="assemble-bottom-deco">
      </div>
    </section>
  );
}

export default AssembleSection;
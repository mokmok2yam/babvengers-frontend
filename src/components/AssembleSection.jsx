import React from 'react';

function AssembleSection({ onCreateMapClick }) {
  // 기존 더미 데이터를 삭제하고, '나만의 지도 만들기' 버튼을 강조하는 UI로 변경
  return (
    <div 
      className="assemble-section" 
      style={{ 
        textAlign: 'center', 
        padding: '50px 20px', 
        backgroundColor: '#fff' 
      }}
    >
      <h2 style={{ marginBottom: '15px' }}>나만의 지도를 만들어 공유해보세요!</h2>
      <p style={{ color: '#555', marginBottom: '30px' }}>
        자신만의 맛집 컬렉션을 만들고 친구들과 함께 새로운 맛의 세계를 탐험할 시간입니다.
      </p>
      <button 
        onClick={onCreateMapClick}
        style={{
          padding: '15px 35px',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: 'pointer',
          border: 'none',
          borderRadius: '8px',
          backgroundColor: '#FFCD00', // 기존 버튼과 통일감 있는 색상
          color: '#333',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
          transition: 'transform 0.2s ease',
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        나만의 지도 만들기
      </button>
    </div>
  );
}

export default AssembleSection;
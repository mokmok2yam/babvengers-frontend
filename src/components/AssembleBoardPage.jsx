import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from './Header';
import client from '../api/client';

// [New Component] AssembleBoardPage.jsx
function AssembleBoardPage({ isLoggedIn, loginUser, onLoginClick, onSignupClick, onLogout }) {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      // 새로운 게시판 API 호출
      const response = await client.get('/matching/board');
      setPosts(response.data);
    } catch (error) {
      console.error("어셈블 게시글 목록을 불러오는 데 실패했습니다:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleApply = async (postId, hostId) => {
    if (!isLoggedIn) {
      alert("신청하려면 로그인이 필요합니다.");
      onLoginClick();
      return;
    }
    
    if (window.confirm("정말로 이 모임에 신청하시겠습니까?")) {
      try {
        // 새로운 신청 API 호출
        await client.post(`/matching/${postId}/apply/${currentUser.userId}`);
        alert("신청 완료! '내 어셈블 관리' 페이지에서 호스트의 수락을 기다려주세요.");
      } catch (error) {
        console.error("신청 실패:", error);
        alert("신청에 실패했습니다. 이미 신청했는지 확인해주세요.");
      }
    }
  };

  return (
    <>
      <Header isLoggedIn={isLoggedIn} nickname={loginUser?.nickname} onLoginClick={onLoginClick} onSignupClick={onSignupClick} onLogout={onLogout} onHomeClick={() => navigate('/')} />
      <div style={{ padding: '30px 40px', maxWidth: '1000px', margin: '20px auto', backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>어셈블 게시판 🍽️</h2>
            <button 
                onClick={() => {
                    if (!isLoggedIn) {
                      alert("로그인이 필요합니다.");
                      onLoginClick();
                    } else {
                      setIsPostModalOpen(true);
                    }
                }}
                style={{ background: '#FF9800', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
            >
                모임 등록하기
            </button>
        </div>

        {isLoading ? (
          <p style={{ textAlign: 'center' }}>게시글을 불러오는 중...</p>
        ) : posts.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {posts.map((post) => (
              <li key={post.id} style={{ marginBottom: '15px', border: '1px solid #ddd', padding: '15px', borderRadius: '8px', backgroundColor: '#fcfcfc', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  
                  {/* 게시글 정보 영역: Link로 감싸서 클릭 시 상세 페이지로 이동 */}
                  <Link to={`/assemble/${post.id}`} style={{ textDecoration: 'none', color: '#333', flexGrow: 1, paddingRight: '20px', cursor: 'pointer' }}>
                    <h3 style={{ margin: '0 0 5px', fontSize: '20px', color: '#FF6B6B' }}>{post.title}</h3>
                    <p style={{ margin: '5px 0 0', color: '#333', fontSize: '16px' }}>
                        📍 <strong>{post.restaurantName}</strong> 
                    </p>
                    <p style={{ margin: '5px 0 0', color: '#555', fontSize: '14px' }}>
                        📅 모임 일시: {post.meetingTime} | 작성자: {post.senderName}
                    </p>
                  </Link>
                  
                  {/* 버튼 영역 */}
                  <div style={{ flexShrink: 0, marginTop: '5px' }}>
                    {post.status === '모집중' ? (
                        <button 
                            onClick={(e) => { e.preventDefault(); handleApply(post.id, post.restaurantId); }} // Link의 이동을 막고 신청 로직 실행
                            style={{ background: '#28a745', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                            disabled={!isLoggedIn}
                        >
                            어셈블 신청
                        </button>
                    ) : (
                         <span style={{ color: '#f44336', fontWeight: 'bold' }}>{post.status}</span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ padding: '15px', border: '1px dashed #ccc', borderRadius: '8px', textAlign: 'center', backgroundColor: '#f9f9f9' }}>
            현재 모집 중인 어셈블 모임이 없습니다. 첫 모임을 만들어보세요!
          </p>
        )}
      </div>
      
      {/* 모임 등록 모달 */}
      <AssemblePostModal 
        isOpen={isPostModalOpen} 
        onClose={() => setIsPostModalOpen(false)} 
        onPostSuccess={() => { setIsPostModalOpen(false); fetchPosts(); }}
        isLoggedIn={isLoggedIn}
        onLoginClick={onLoginClick}
        currentUser={currentUser}
      />
    </>
  );
}

// [New Component] AssemblePostModal.jsx (Inlined here for simplicity)
function AssemblePostModal({ isOpen, onClose, onPostSuccess, isLoggedIn, onLoginClick, currentUser }) {
    const [title, setTitle] = useState('');
    const [meetingTime, setMeetingTime] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [message, setMessage] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    if (!isOpen) return null;

    // 카카오 키워드 검색 API 호출 함수
    const handleSearch = async () => {
        if (!searchKeyword.trim()) return;
        setIsSearching(true);
        // .env 파일에 VITE_KAKAO_REST_API_KEY가 설정되어 있다고 가정합니다.
        const KAKAO_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY; 

        try {
            const res = await fetch(
              `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(searchKeyword)}`,
              { headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` } }
            );
            const data = await res.json();
            setSearchResults(data.documents);
            setMessage('');
        } catch (error) {
            console.error("검색 실패:", error);
            setMessage('맛집 검색에 실패했습니다.');
        } finally {
            setIsSearching(false);
        }
    };
    
    const handleSelectRestaurant = (place) => {
        setSelectedRestaurant({
            name: place.place_name,
            address: place.address_name,
        });
        setSearchResults([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (!isLoggedIn) {
            alert("로그인이 필요합니다.");
            onLoginClick();
            return;
        }

        if (!title.trim() || !meetingTime.trim() || !selectedRestaurant) {
            setMessage("제목, 모임 일시, 맛집을 모두 선택/입력해 주세요.");
            return;
        }

        const requestData = {
            senderId: currentUser.userId,
            title: title,
            meetingTime: meetingTime,
            name: selectedRestaurant.name, 
            address: selectedRestaurant.address
        };
        
        try {
            // POST /matching API 호출 (변경된 DTO 사용)
            const response = await client.post('/matching', requestData); 
            alert(`'${title}' 모임이 등록되었습니다. ${response.data}`);
            onPostSuccess();

        } catch (error) {
            console.error("모임 등록 실패:", error.response?.data || error);
            setMessage(error.response?.data || "모임 등록에 실패했습니다. (맛집 정보 확인 필요)");
        }
        
    };

    return (
        <div className="modal">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
                <span className="close" onClick={onClose}>✕</span>
                <h2>새 어셈블 모임 등록</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        제목
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </label>
                    <label>
                        모임 일시 (자유 형식)
                        <input type="text" value={meetingTime} onChange={(e) => setMeetingTime(e.target.value)} placeholder="예: 11월 1일 오후 7시" required />
                    </label>
                    
                    {/* 맛집 검색 및 선택 */}
                    <h4 style={{ margin: '15px 0 5px' }}>맛집 선택 ({selectedRestaurant ? '선택 완료' : '필수'})</h4>
                    <div style={{ display: 'flex', marginBottom: '10px' }}>
                        <input
                            type="text"
                            placeholder="맛집 이름 또는 주소 검색"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            style={{ flexGrow: 1, marginRight: '10px' }}
                        />
                        <button type="button" onClick={handleSearch} disabled={isSearching} style={{ width: '80px', background: '#FFCD00', color: 'black' }}>
                            {isSearching ? '검색 중' : '검색'}
                        </button>
                    </div>
                    
                    {/* 검색 결과 목록 */}
                    {searchResults.length > 0 && (
                        <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
                            {searchResults.map((place) => (
                                <div 
                                    key={place.id} 
                                    onClick={() => handleSelectRestaurant(place)}
                                    style={{ padding: '5px', borderBottom: '1px dotted #eee', cursor: 'pointer', backgroundColor: selectedRestaurant?.name === place.place_name ? '#ffe0b2' : 'white' }}
                                >
                                    <strong>{place.place_name}</strong> - {place.address_name} (선택)
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {selectedRestaurant && (
                        <p style={{ fontWeight: 'bold', color: '#28a745' }}>선택된 맛집: {selectedRestaurant.name} ({selectedRestaurant.address})</p>
                    )}

                    <button type="submit" style={{ background: '#FF9800', color: 'white', marginTop: '10px' }}>등록하기</button>
                    <button type="button" onClick={onClose} style={{ marginLeft: '10px', background: '#ccc', color: 'black' }}>취소</button>
                    {message && <div style={{ marginTop: '10px', color: 'red' }}>{message}</div>}
                </form>
            </div>
        </div>
    );
}

export default AssembleBoardPage;
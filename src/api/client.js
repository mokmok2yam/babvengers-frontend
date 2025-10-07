import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:8080'
});

// Axios 요청 인터셉터 설정
client.interceptors.request.use(
  (config) => {
    // localStorage에서 토큰을 가져옵니다.
    const token = localStorage.getItem('token');
    
    // 토큰이 존재하면, 모든 요청의 Authorization 헤더에 토큰을 추가합니다.
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // 요청 에러 처리
    return Promise.reject(error);
  }
);

export default client;
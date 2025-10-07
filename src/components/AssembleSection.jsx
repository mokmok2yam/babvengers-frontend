function AssembleSection({ onCreateMapClick }) {
       const posts = [
         '📌 오늘 서울 돈까스 투어하실분 3/4',
         '📌 맛잘알 오빠들이랑 데이트 2/4',
         '📌 마라탕탕탕 급구 1/4',
       ];

       return (
         <div className="assemble-section">
           <h3>밥벤저스 어셈블</h3>
           <ul>
             {posts.map((post, index) => (
               <li key={index}>{post}</li>
             ))}
           </ul>
           <button onClick={onCreateMapClick}>나만의 지도 만들기</button>
         </div>
       );
     }

     export default AssembleSection;
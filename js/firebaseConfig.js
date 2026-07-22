/**
 * Firebase 및 Cloudinary 기본 설정 파일
 * 
 * TODO: 관리자님! 실제 연동을 위해 아래의 'YOUR_...' 값들을
 * 콘솔에서 발급받은 실제 값으로 변경해 주세요.
 */

// 1. Firebase Config (Firebase 콘솔에서 발급)
export const firebaseConfig = {
  apiKey: "AIzaSyBvo44RFIPYi7AIvw-wMmZ9JXTd31ZZjsY",
  authDomain: "lim-coding-lab.firebaseapp.com",
  projectId: "lim-coding-lab",
  storageBucket: "lim-coding-lab.firebasestorage.app",
  messagingSenderId: "159095038942",
  appId: "1:159095038942:web:4985d820501682e281734f"
};

// 2. Cloudinary Config (Cloudinary 대시보드에서 발급)
export const cloudinaryConfig = {
  cloudName: "q3nw0ike", // 스크린샷에서 확인된 클라우드 이름
  uploadPreset: "mymymymy" // Unsigned 업로드용 preset 이름
};

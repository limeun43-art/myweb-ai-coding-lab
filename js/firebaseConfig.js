/**
 * Firebase 및 Cloudinary 기본 설정 파일
 * 
 * TODO: 관리자님! 실제 연동을 위해 아래의 'YOUR_...' 값들을
 * 콘솔에서 발급받은 실제 값으로 변경해 주세요.
 */

// 1. Firebase Config (Vite 환경 변수 사용)
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// 2. Cloudinary Config (Vite 환경 변수 사용)
export const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
};

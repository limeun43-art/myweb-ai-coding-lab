/**
 * Data Service Layer (dataService.js)
 * -----------------------------------
 * Firebase (Firestore & Auth) 및 Cloudinary API 연동
 * ES Module 방식으로 작성되었습니다.
 */

import { firebaseConfig, cloudinaryConfig } from './firebaseConfig.js';

// Firebase v10 SDK (CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/* ─── 기본(초기) 데이터 ─── */
const DEFAULT_DATA = {
  hero: {
    title: '학생들의 눈빛이 달라지는',
    titleHighlight: '실전 AI·코딩 교육',
    subtitle: '한국과학창의재단 출신 전문 강사 Lim Eun-hye와 함께 쉽고 즐겁게 완성하는 피지컬 컴퓨팅 & AI 융합 수업. 기관 담당자님의 행정 부담을 덜어주는 맞춤형 제안서와 완벽한 수업을 약속드립니다.',
    imageUrl: 'assets/images/hero.png',
    imagePublicId: ''
  },
  about: {
    name: 'Lim Eun-hye',
    bio: '안녕하세요! AI 및 피지컬 컴퓨팅 교육 연구자 Lim Eun-hye입니다. 한국과학창의재단에서 AI 교육 사업 기획 및 교재 개발 연구를 수행한 경험을 바탕으로, 단순 이론이 아닌 "학생들이 직접 만들고 작동시키는 체감형 AI 교육"을 전파하고 있습니다.',
    profileImageUrl: 'assets/images/profile.png',
    imagePublicId: ''
  },
  stats: [
    { id: 'stat-1', icon: 'fas fa-user-astronaut', color: '#2563EB', value: 3500, suffix: '명+', label: '누적 수강생 수' },
    { id: 'stat-2', icon: 'fas fa-chalkboard-teacher', color: '#F97316', value: 450, suffix: '회+', label: '진행한 출강 횟수' },
    { id: 'stat-3', icon: 'fas fa-book-open', color: '#10B981', value: 35, suffix: '개+', label: '독자 개발 커리큘럼' },
    { id: 'stat-4', icon: 'fas fa-smile', color: '#F59E0B', value: 99.4, suffix: '%', label: '수강생/기관 만족도' }
  ],
  programs: [
    {
      id: 'prog-1',
      category: 'elementary',
      tags: [{ text: '할로코드', style: 'tag-orange' }, { text: '초등 3~6학년', style: 'tag-blue' }],
      title: '스마트 LED & AI 할로코드 교실',
      desc: '원형 스마트 보드의 센서와 음성인식을 활용하여 나만의 스마트홈 및 AI 무드등을 제작합니다.',
      features: ['음성 인식 AI 모델 학습 및 제어', '모션 센서 기반 인터랙티브 게임', '팀별 스마트시티 아이디어 발표'],
      duration: '4~16차시 선택'
    },
    {
      id: 'prog-2',
      category: 'elementary',
      tags: [{ text: '큐브로이드', style: 'tag-purple' }, { text: '초등 1~4학년', style: 'tag-blue' }],
      title: '창의 큐브로이드 로봇 코딩',
      desc: '무선 블록 교구를 조립하고 앱 코딩으로 자율주행 로봇 및 인공지능 청소 로봇을 조종합니다.',
      features: ['무선 센서 블록 기반 창의 조립', '스크래치 연동 블록 코딩 기초', '장애물 회피 로봇 경주 미션'],
      duration: '2~8차시 선택'
    }
  ],
  gallery: [
    { id: 'gal-1', imageUrl: 'assets/images/hero.png', imagePublicId: '', tag: '수업 현장', title: '열정 넘치는 AI 피지컬 컴퓨팅 팀 프로젝트' },
    { id: 'gal-2', imageUrl: 'assets/images/halocode.png', imagePublicId: '', tag: '할로코드', title: '스마트 RGB LED 무드등 및 AI 센서 제작' },
    { id: 'gal-3', imageUrl: 'assets/images/cubroid.png', imagePublicId: '', tag: '큐브로이드', title: '무선 센서 블록 기반 자율주행 코딩 로봇' }
  ],
  contact: {
    phone: '010-8924-5512 (강사 직통)',
    email: 'eunhye.lim.ai@gmail.com',
    location: '서울, 경기, 인천 및 전국 주요 도시 출강 가능'
  }
};

/* ─── Cloudinary Upload Service ─── */
export const CloudinaryService = {
  /**
   * File 객체를 Cloudinary에 업로드하고 URL과 public_id를 반환합니다.
   * @param {File} file 
   */
  async uploadImage(file) {
    if (!cloudinaryConfig.cloudName || cloudinaryConfig.cloudName === "YOUR_CLOUD_NAME") {
      throw new Error("Cloudinary 설정이 완료되지 않았습니다.");
    }
    
    const url = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || '이미지 업로드 실패');
      }
      return {
        secure_url: data.secure_url,
        public_id: data.public_id
      };
    } catch (err) {
      console.error('Cloudinary 업로드 에러:', err);
      throw err;
    }
  }
};

/* ─── Firebase Data Service ─── */
export const DataService = {
  // 문서 레퍼런스 (전체 사이트 데이터는 단일 문서에 저장)
  siteDocRef: doc(db, "siteData", "content"),

  async getAll() {
    try {
      const docSnap = await getDoc(this.siteDocRef);
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        // 아직 문서가 없다면 기본값 반환
        return { ...DEFAULT_DATA };
      }
    } catch (error) {
      // API 키 미설정 등 에러 시 로컬 더미 반환 (개발 편의)
      console.warn("Firestore 로드 실패, 기본 데이터 사용:", error);
      return { ...DEFAULT_DATA };
    }
  },

  async updateSection(sectionKey, newData) {
    try {
      const currentData = await this.getAll();
      currentData[sectionKey] = newData;
      await setDoc(this.siteDocRef, currentData, { merge: true });
      return true;
    } catch (error) {
      console.error("Firestore 업데이트 실패:", error);
      throw error;
    }
  },

  async resetAll() {
    try {
      await setDoc(this.siteDocRef, { ...DEFAULT_DATA });
      return true;
    } catch (error) {
      console.error("Firestore 초기화 실패:", error);
      throw error;
    }
  },

  getDefaults() {
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  },
  
  /** 
   * 문의(강의 의뢰) 폼 데이터를 Firestore에 추가 
   */
  async submitInquiry(inquiryData) {
    try {
      const inquiriesRef = collection(db, "inquiries");
      await addDoc(inquiriesRef, {
        ...inquiryData,
        createdAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error("문의 저장 실패:", error);
      throw error;
    }
  }
};

/* ─── Auth Service (인증 서비스) ─── */
export const AuthService = {
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error("로그인 에러:", error);
      // Firebase 에러 코드에 따른 메시지 변환 (예시)
      let message = '로그인에 실패했습니다.';
      if (error.code === 'auth/invalid-credential') message = '아이디 또는 비밀번호가 올바르지 않습니다.';
      if (error.code === 'auth/invalid-email') message = '유효하지 않은 이메일 형식입니다.';
      if (error.code === 'auth/invalid-api-key') message = 'Firebase API Key 설정이 올바르지 않습니다.';
      return { success: false, message };
    }
  },

  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("로그아웃 에러:", error);
    }
  },

  /** 
   * 로그인 상태 관찰 콜백 등록 
   * @param {function} callback (user) => void
   */
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }
};

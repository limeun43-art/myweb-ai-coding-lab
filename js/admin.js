/**
 * Admin Dashboard Logic (admin.js)
 * ---------------------------------
 * ES Module 방식으로 변경됨.
 */
import { DataService, AuthService, CloudinaryService } from './dataService.js';

let siteData = null;
let editContext = null; // { type, index, field }
let isUploading = false; // 이미지 업로드 상태

document.addEventListener('DOMContentLoaded', () => {
  // 인증 상태 확인 (Firebase onAuthStateChanged)
  AuthService.onAuthStateChanged((user) => {
    if (!user) {
      // 비로그인 상태면 로그인 페이지로 리다이렉트
      window.location.href = 'admin-login.html';
    } else {
      // 로그인 상태 확인됨, 대시보드 렌더링
      initAdmin();
    }
  });
});

function initAdmin() {
  initSidebarNav();
  initMobileSidebar();
  initLogout();
  initModalControls();
  renderSection('dashboard');
}

/* ─── 상태 및 UI 유틸 ─── */
let currentSection = 'dashboard';

function initSidebarNav() {
  document.querySelectorAll('.sidebar-link[data-section]').forEach(link => {
    link.addEventListener('click', () => {
      const section = link.getAttribute('data-section');
      setActiveLink(section);
      renderSection(section);
      document.getElementById('admin-sidebar').classList.remove('open');
    });
  });
}

function setActiveLink(section) {
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  const active = document.querySelector(`.sidebar-link[data-section="${section}"]`);
  if (active) active.classList.add('active');
}

function initMobileSidebar() {
  const toggle = document.getElementById('admin-mobile-toggle');
  const sidebar = document.getElementById('admin-sidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  }
}

function initLogout() {
  document.getElementById('btn-logout')?.addEventListener('click', async () => {
    await AuthService.logout();
    // onAuthStateChanged 가 리다이렉트 처리함
  });
}

function initModalControls() {
  const modal = document.getElementById('edit-modal');
  document.getElementById('edit-modal-close')?.addEventListener('click', () => closeModal());
  document.getElementById('edit-modal-cancel')?.addEventListener('click', () => closeModal());
  document.getElementById('edit-modal-save')?.addEventListener('click', () => handleSave());
  modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
}

function openModal(title) {
  document.getElementById('edit-modal-title').textContent = title;
  document.getElementById('edit-modal').classList.add('active');
}

function closeModal() {
  document.getElementById('edit-modal').classList.remove('active');
  editContext = null;
}

function showAdminToast(message, isError = false) {
  const toast = document.getElementById('admin-toast');
  toast.innerHTML = `<i class="fas ${isError ? 'fa-exclamation-circle' : 'fa-check-circle'}" style="color: ${isError ? '#EF4444' : '#10B981'};font-size:1.1rem;"></i> ${message}`;
  if (isError) toast.style.borderLeftColor = '#EF4444';
  else toast.style.borderLeftColor = '#10B981';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

// 전역 스코프에 navigateTo, 모달 오픈 함수 등 노출 (인라인 onclick 사용을 위함)
window.navigateTo = (section) => {
  setActiveLink(section);
  renderSection(section);
};
window.renderSection = renderSection;
window.openStatEdit = openStatEdit;
window.openProgramEdit = openProgramEdit;
window.deleteProgram = deleteProgram;
window.openGalleryEdit = openGalleryEdit;
window.deleteGallery = deleteGallery;
window.saveHero = saveHero;
window.saveAbout = saveAbout;
window.saveContact = saveContact;
window.resetData = resetData;


/* ─── 섹션 렌더링 디스패처 ─── */
async function renderSection(section) {
  currentSection = section;
  
  // 데이터 로딩 인디케이터
  document.getElementById('admin-content').innerHTML = `<div style="padding:2rem;text-align:center;color:var(--text-muted);"><i class="fas fa-spinner fa-spin fa-2x"></i><p style="margin-top:1rem;">데이터를 불러오는 중...</p></div>`;
  
  siteData = await DataService.getAll();

  const titleMap = {
    'dashboard': '<i class="fas fa-gauge-high"></i> 대시보드',
    'hero': '<i class="fas fa-flag"></i> 히어로 섹션 편집',
    'about': '<i class="fas fa-user"></i> 강사 소개 편집',
    'stats': '<i class="fas fa-chart-bar"></i> 성과 통계 편집',
    'programs': '<i class="fas fa-cubes"></i> 커리큘럼 카드 관리',
    'gallery': '<i class="fas fa-images"></i> 갤러리 관리',
    'contact-info': '<i class="fas fa-address-card"></i> 연락처 정보 편집',
    'reset': '<i class="fas fa-rotate-left"></i> 데이터 초기화'
  };

  document.getElementById('topbar-title').innerHTML = titleMap[section] || '관리자';

  const container = document.getElementById('admin-content');
  switch (section) {
    case 'dashboard': container.innerHTML = renderDashboard(); break;
    case 'hero': container.innerHTML = renderHeroEditor(); break;
    case 'about': container.innerHTML = renderAboutEditor(); break;
    case 'stats': container.innerHTML = renderStatsEditor(); break;
    case 'programs': container.innerHTML = renderProgramsList(); break;
    case 'gallery': container.innerHTML = renderGalleryList(); break;
    case 'contact-info': container.innerHTML = renderContactEditor(); break;
    case 'reset': container.innerHTML = renderResetPanel(); break;
  }
}

/* ─── 대시보드 ─── */
function renderDashboard() {
  const stats = siteData.stats || [];
  const programs = siteData.programs || [];
  const gallery = siteData.gallery || [];

  return `
    <div class="admin-stats-row">
      <div class="admin-stat-card">
        <div class="admin-stat-icon" style="background:#DBEAFE;color:#2563EB;"><i class="fas fa-flag"></i></div>
        <div class="admin-stat-info"><h4>6</h4><p>관리 섹션</p></div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-icon" style="background:#FFEDD5;color:#F97316;"><i class="fas fa-cubes"></i></div>
        <div class="admin-stat-info"><h4>${programs.length}</h4><p>교육 프로그램</p></div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-icon" style="background:#DCFCE7;color:#10B981;"><i class="fas fa-images"></i></div>
        <div class="admin-stat-info"><h4>${gallery.length}</h4><p>갤러리 이미지</p></div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-icon" style="background:#F3E8FF;color:#6B21A8;"><i class="fas fa-database"></i></div>
        <div class="admin-stat-info"><h4>Firestore</h4><p>데이터베이스 연동</p></div>
      </div>
    </div>

    <div class="admin-panel">
      <div class="admin-panel-header">
        <div class="admin-panel-title"><i class="fas fa-bolt"></i> 빠른 관리</div>
      </div>
      <div class="admin-panel-body">
        <div class="admin-card-list">
          <div class="admin-card-item" style="cursor:pointer;" onclick="navigateTo('hero')">
            <div class="admin-card-thumb"><i class="fas fa-flag"></i></div>
            <div class="admin-card-info">
              <h4>히어로 섹션</h4>
              <p>메인 제목, 설명, 배경 이미지 수정</p>
            </div>
            <span class="badge badge-blue">텍스트+이미지</span>
          </div>
          <div class="admin-card-item" style="cursor:pointer;" onclick="navigateTo('about')">
            <div class="admin-card-thumb"><i class="fas fa-user"></i></div>
            <div class="admin-card-info">
              <h4>강사 소개</h4>
              <p>프로필, 소개 글, 프로필 사진 수정</p>
            </div>
            <span class="badge badge-green">텍스트+이미지</span>
          </div>
          <div class="admin-card-item" style="cursor:pointer;" onclick="navigateTo('programs')">
            <div class="admin-card-thumb"><i class="fas fa-cubes"></i></div>
            <div class="admin-card-info">
              <h4>커리큘럼 카드 (${programs.length}개)</h4>
              <p>교육 프로그램 추가, 수정, 삭제</p>
            </div>
            <span class="badge badge-orange">카드</span>
          </div>
          <div class="admin-card-item" style="cursor:pointer;" onclick="navigateTo('gallery')">
            <div class="admin-card-thumb"><i class="fas fa-images"></i></div>
            <div class="admin-card-info">
              <h4>갤러리 이미지 (${gallery.length}장)</h4>
              <p>수업 사진 및 작품 이미지 관리</p>
            </div>
            <span class="badge badge-purple">이미지</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ─── 히어로 섹션 편집 ─── */
function renderHeroEditor() {
  const h = siteData.hero;
  return `
    <div class="admin-panel">
      <div class="admin-panel-header">
        <div class="admin-panel-title"><i class="fas fa-heading"></i> 히어로 설정</div>
      </div>
      <div class="admin-panel-body">
        <div class="admin-form-row">
          <div class="admin-form-group">
            <label for="hero-title">메인 제목 (첫 줄)</label>
            <input type="text" id="hero-title" class="form-control" value="${esc(h.title)}">
          </div>
          <div class="admin-form-group">
            <label for="hero-highlight">강조 텍스트 (두 번째 줄)</label>
            <input type="text" id="hero-highlight" class="form-control" value="${esc(h.titleHighlight)}">
          </div>
        </div>
        <div class="admin-form-row full">
          <div class="admin-form-group">
            <label for="hero-subtitle">서브 카피 (설명문)</label>
            <textarea id="hero-subtitle" class="form-control" rows="3">${esc(h.subtitle)}</textarea>
          </div>
        </div>
        <div class="admin-form-row full">
          <div class="admin-form-group">
            <label>배경 이미지</label>
            <div style="display:flex;gap:1rem;align-items:center;">
              <img src="${esc(h.imageUrl)}" alt="현재 이미지" style="width:120px;height:70px;object-fit:cover;border-radius:4px;border:1px solid #ccc;">
              <input type="file" id="hero-img-file" class="form-control" accept="image/*">
            </div>
            <p style="font-size:0.8rem;color:var(--text-muted);margin-top:0.4rem;">(이미지를 변경하려면 새 파일을 선택하세요. 미선택 시 기존 이미지 유지)</p>
            <input type="hidden" id="hero-img-url" value="${esc(h.imageUrl)}">
            <input type="hidden" id="hero-img-pubid" value="${esc(h.imagePublicId || '')}">
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:0.75rem;margin-top:1rem;">
          <button class="btn btn-outline" onclick="renderSection('hero')"><i class="fas fa-rotate-left"></i> 되돌리기</button>
          <button class="btn btn-primary" onclick="saveHero()" id="btn-save-hero"><i class="fas fa-check"></i> 저장하기</button>
        </div>
      </div>
    </div>
  `;
}

/* ─── 강사 소개 편집 ─── */
function renderAboutEditor() {
  const a = siteData.about;
  return `
    <div class="admin-panel">
      <div class="admin-panel-header">
        <div class="admin-panel-title"><i class="fas fa-user-pen"></i> 강사 프로필</div>
      </div>
      <div class="admin-panel-body">
        <div class="admin-form-row full">
          <div class="admin-form-group">
            <label for="about-name">이름</label>
            <input type="text" id="about-name" class="form-control" value="${esc(a.name)}">
          </div>
        </div>
        <div class="admin-form-row full">
          <div class="admin-form-group">
            <label>프로필 사진</label>
            <div style="display:flex;gap:1rem;align-items:center;">
              <img src="${esc(a.profileImageUrl)}" alt="프로필" style="width:80px;height:80px;object-fit:cover;border-radius:50%;border:1px solid #ccc;">
              <input type="file" id="about-img-file" class="form-control" accept="image/*">
            </div>
            <input type="hidden" id="about-img-url" value="${esc(a.profileImageUrl)}">
            <input type="hidden" id="about-img-pubid" value="${esc(a.imagePublicId || '')}">
          </div>
        </div>
        <div class="admin-form-row full">
          <div class="admin-form-group">
            <label for="about-bio">소개 글</label>
            <textarea id="about-bio" class="form-control" rows="5">${esc(a.bio)}</textarea>
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:0.75rem;margin-top:1rem;">
          <button class="btn btn-outline" onclick="renderSection('about')"><i class="fas fa-rotate-left"></i> 되돌리기</button>
          <button class="btn btn-primary" onclick="saveAbout()" id="btn-save-about"><i class="fas fa-check"></i> 저장하기</button>
        </div>
      </div>
    </div>
  `;
}

/* ─── 성과 통계 편집 ─── */
function renderStatsEditor() {
  const stats = siteData.stats || [];
  let cardsHtml = stats.map((s, i) => `
    <div class="admin-card-item">
      <div class="admin-card-thumb" style="background:${s.color}15;"><i class="${s.icon}" style="color:${s.color};"></i></div>
      <div class="admin-card-info">
        <h4>${s.value}${s.suffix} — ${s.label}</h4>
        <p>아이콘: ${s.icon}</p>
      </div>
      <div class="admin-card-actions">
        <button class="btn btn-outline btn-sm" onclick="openStatEdit(${i})"><i class="fas fa-pen"></i> 수정</button>
      </div>
    </div>
  `).join('');

  return `
    <div class="admin-panel">
      <div class="admin-panel-header">
        <div class="admin-panel-title"><i class="fas fa-chart-bar"></i> 성과 카운터 목록</div>
      </div>
      <div class="admin-panel-body">
        <div class="admin-card-list">${cardsHtml}</div>
      </div>
    </div>
  `;
}

/* ─── 커리큘럼 목록 ─── */
function renderProgramsList() {
  const progs = siteData.programs || [];
  const categoryNames = { elementary: '초등', middle: '중등', teacher: '연수' };

  let cardsHtml = progs.map((p, i) => `
    <div class="admin-card-item">
      <div class="admin-card-thumb"><i class="fas fa-cubes"></i></div>
      <div class="admin-card-info">
        <h4>${esc(p.title)}</h4>
        <p>${esc(p.desc)}</p>
      </div>
      <span class="badge badge-blue">${categoryNames[p.category] || p.category}</span>
      <div class="admin-card-actions">
        <button class="btn btn-outline btn-sm" onclick="openProgramEdit(${i})"><i class="fas fa-pen"></i> 수정</button>
        <button class="btn btn-outline btn-sm" style="color:#EF4444;border-color:#FECACA;" onclick="deleteProgram(${i})"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');

  return `
    <div class="admin-panel">
      <div class="admin-panel-header">
        <div class="admin-panel-title"><i class="fas fa-cubes"></i> 프로그램 카드 (${progs.length}개)</div>
        <button class="btn btn-primary btn-sm" onclick="openProgramEdit(-1)"><i class="fas fa-plus"></i> 새 프로그램</button>
      </div>
      <div class="admin-panel-body">
        <div class="admin-card-list">${cardsHtml}</div>
      </div>
    </div>
  `;
}

/* ─── 갤러리 목록 ─── */
function renderGalleryList() {
  const items = siteData.gallery || [];
  let cardsHtml = items.map((g, i) => `
    <div class="admin-card-item">
      <div class="admin-card-thumb"><img src="${esc(g.imageUrl)}" alt="${esc(g.title)}"></div>
      <div class="admin-card-info">
        <h4>${esc(g.title)}</h4>
        <p>태그: ${esc(g.tag)}</p>
      </div>
      <div class="admin-card-actions">
        <button class="btn btn-outline btn-sm" onclick="openGalleryEdit(${i})"><i class="fas fa-pen"></i> 수정</button>
        <button class="btn btn-outline btn-sm" style="color:#EF4444;border-color:#FECACA;" onclick="deleteGallery(${i})"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');

  return `
    <div class="admin-panel">
      <div class="admin-panel-header">
        <div class="admin-panel-title"><i class="fas fa-images"></i> 갤러리 이미지 (${items.length}장)</div>
        <button class="btn btn-primary btn-sm" onclick="openGalleryEdit(-1)"><i class="fas fa-plus"></i> 새 이미지</button>
      </div>
      <div class="admin-panel-body">
        <div class="admin-card-list">${cardsHtml}</div>
      </div>
    </div>
  `;
}

/* ─── 연락처 정보 편집 ─── */
function renderContactEditor() {
  const c = siteData.contact;
  return `
    <div class="admin-panel">
      <div class="admin-panel-header">
        <div class="admin-panel-title"><i class="fas fa-address-card"></i> 연락처</div>
      </div>
      <div class="admin-panel-body">
        <div class="admin-form-row">
          <div class="admin-form-group">
            <label for="contact-phone">전화번호</label>
            <input type="text" id="contact-phone" class="form-control" value="${esc(c.phone)}">
          </div>
          <div class="admin-form-group">
            <label for="contact-email">이메일</label>
            <input type="text" id="contact-email" class="form-control" value="${esc(c.email)}">
          </div>
        </div>
        <div class="admin-form-row full">
          <div class="admin-form-group">
            <label for="contact-location">출강 가능 지역</label>
            <input type="text" id="contact-location" class="form-control" value="${esc(c.location)}">
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:0.75rem;margin-top:1rem;">
          <button class="btn btn-outline" onclick="renderSection('contact-info')"><i class="fas fa-rotate-left"></i> 되돌리기</button>
          <button class="btn btn-primary" onclick="saveContact()"><i class="fas fa-check"></i> 저장하기</button>
        </div>
      </div>
    </div>
  `;
}

/* ─── 데이터 초기화 ─── */
function renderResetPanel() {
  return `
    <div class="admin-panel">
      <div class="admin-panel-header">
        <div class="admin-panel-title" style="color:#EF4444;"><i class="fas fa-triangle-exclamation"></i> 데이터 초기화</div>
      </div>
      <div class="admin-panel-body">
        <p style="color:var(--text-muted);margin-bottom:1.5rem;">
          모든 콘텐츠를 원래 기본값으로 되돌립니다. Firestore에 덮어쓰기 되며 복구할 수 없습니다.
          <br><strong style="color:#EF4444;">⚠ 이 작업은 되돌릴 수 없습니다.</strong>
        </p>
        <button class="btn btn-accent" onclick="resetData()"><i class="fas fa-rotate-left"></i> 전체 초기화 실행</button>
      </div>
    </div>
  `;
}


/* ═══════════════════════════════════════════════════
   개별 섹션 저장 핸들러
   ═══════════════════════════════════════════════════ */

// 버튼 로딩 상태 전환 헬퍼
function setBtnLoading(btnId, isLoading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  if (isLoading) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 저장 중...';
  } else {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-check"></i> 저장하기';
  }
}

async function saveHero() {
  setBtnLoading('btn-save-hero', true);
  try {
    const fileInput = document.getElementById('hero-img-file');
    let imageUrl = document.getElementById('hero-img-url').value;
    let imagePublicId = document.getElementById('hero-img-pubid').value;

    if (fileInput.files.length > 0) {
      const res = await CloudinaryService.uploadImage(fileInput.files[0]);
      imageUrl = res.secure_url;
      imagePublicId = res.public_id;
    }

    siteData.hero = {
      title: document.getElementById('hero-title').value,
      titleHighlight: document.getElementById('hero-highlight').value,
      subtitle: document.getElementById('hero-subtitle').value,
      imageUrl,
      imagePublicId
    };
    
    await DataService.updateSection('hero', siteData.hero);
    showAdminToast('히어로 섹션이 저장되었습니다.');
  } catch (err) {
    showAdminToast(err.message, true);
  } finally {
    setBtnLoading('btn-save-hero', false);
    renderSection('hero');
  }
}

async function saveAbout() {
  setBtnLoading('btn-save-about', true);
  try {
    const fileInput = document.getElementById('about-img-file');
    let profileImageUrl = document.getElementById('about-img-url').value;
    let imagePublicId = document.getElementById('about-img-pubid').value;

    if (fileInput.files.length > 0) {
      const res = await CloudinaryService.uploadImage(fileInput.files[0]);
      profileImageUrl = res.secure_url;
      imagePublicId = res.public_id;
    }

    siteData.about = {
      name: document.getElementById('about-name').value,
      bio: document.getElementById('about-bio').value,
      profileImageUrl,
      imagePublicId
    };
    await DataService.updateSection('about', siteData.about);
    showAdminToast('강사 소개가 저장되었습니다.');
  } catch (err) {
    showAdminToast(err.message, true);
  } finally {
    setBtnLoading('btn-save-about', false);
    renderSection('about');
  }
}

async function saveContact() {
  try {
    siteData.contact = {
      phone: document.getElementById('contact-phone').value,
      email: document.getElementById('contact-email').value,
      location: document.getElementById('contact-location').value
    };
    await DataService.updateSection('contact', siteData.contact);
    showAdminToast('연락처 정보가 저장되었습니다.');
  } catch (err) {
    showAdminToast('연락처 저장 실패', true);
  }
}

async function resetData() {
  if (!confirm('정말로 모든 데이터를 기본값으로 초기화하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) return;
  try {
    await DataService.resetAll();
    siteData = await DataService.getAll();
    showAdminToast('모든 데이터가 기본값으로 초기화되었습니다.');
    renderSection('dashboard');
  } catch (err) {
    showAdminToast('초기화 실패', true);
  }
}

/* ═══════════════════════════════════════════════════
   모달 기반 편집 (Stats, Programs, Gallery)
   ═══════════════════════════════════════════════════ */

/* — Stats 수정 — */
function openStatEdit(index) {
  const s = siteData.stats[index];
  editContext = { type: 'stat', index };
  document.getElementById('edit-modal-body').innerHTML = `
    <div class="admin-form-row">
      <div class="admin-form-group">
        <label for="m-stat-value">수치 값</label>
        <input type="number" step="0.1" id="m-stat-value" class="form-control" value="${s.value}">
      </div>
      <div class="admin-form-group">
        <label for="m-stat-suffix">접미사 (명+, 회+ 등)</label>
        <input type="text" id="m-stat-suffix" class="form-control" value="${esc(s.suffix)}">
      </div>
    </div>
    <div class="admin-form-row">
      <div class="admin-form-group">
        <label for="m-stat-label">항목 이름</label>
        <input type="text" id="m-stat-label" class="form-control" value="${esc(s.label)}">
      </div>
      <div class="admin-form-group">
        <label for="m-stat-icon">아이콘 클래스 (FontAwesome)</label>
        <input type="text" id="m-stat-icon" class="form-control" value="${esc(s.icon)}">
      </div>
    </div>
    <div class="admin-form-row full">
      <div class="admin-form-group">
        <label for="m-stat-color">색상 코드</label>
        <input type="color" id="m-stat-color" class="form-control" value="${s.color}" style="height:48px;padding:4px;">
      </div>
    </div>
  `;
  openModal('성과 통계 수정');
}

/* — Program 수정 / 추가 — */
function openProgramEdit(index) {
  const isNew = index === -1;
  const p = isNew ? { category: 'elementary', tags: [{ text: '', style: 'tag-blue' }], title: '', desc: '', features: ['', '', ''], duration: '' } : siteData.programs[index];
  editContext = { type: 'program', index };

  document.getElementById('edit-modal-body').innerHTML = `
    <div class="admin-form-row full">
      <div class="admin-form-group">
        <label for="m-prog-title">프로그램 제목</label>
        <input type="text" id="m-prog-title" class="form-control" value="${esc(p.title)}">
      </div>
    </div>
    <div class="admin-form-row">
      <div class="admin-form-group">
        <label for="m-prog-category">카테고리</label>
        <select id="m-prog-category" class="form-control">
          <option value="elementary" ${p.category === 'elementary' ? 'selected' : ''}>초등 피지컬 컴퓨팅</option>
          <option value="middle" ${p.category === 'middle' ? 'selected' : ''}>중등 AI·데이터</option>
          <option value="teacher" ${p.category === 'teacher' ? 'selected' : ''}>교원/학부모 연수</option>
        </select>
      </div>
      <div class="admin-form-group">
        <label for="m-prog-duration">수업 시간</label>
        <input type="text" id="m-prog-duration" class="form-control" value="${esc(p.duration)}">
      </div>
    </div>
    <div class="admin-form-row full">
      <div class="admin-form-group">
        <label for="m-prog-desc">설명</label>
        <textarea id="m-prog-desc" class="form-control" rows="2">${esc(p.desc)}</textarea>
      </div>
    </div>
    <div class="admin-form-row full">
      <div class="admin-form-group">
        <label>특징/내용 (줄 구분)</label>
        <textarea id="m-prog-features" class="form-control" rows="3" placeholder="각 줄에 하나씩">${(p.features || []).join('\n')}</textarea>
      </div>
    </div>
    <div class="admin-form-row full">
      <div class="admin-form-group">
        <label>태그 (쉼표로 구분)</label>
        <input type="text" id="m-prog-tags" class="form-control" value="${(p.tags || []).map(t => t.text).join(', ')}" placeholder="할로코드, 초등 3~6학년">
      </div>
    </div>
  `;
  openModal(isNew ? '새 프로그램 추가' : '프로그램 수정');
}

/* — Gallery 수정 / 추가 — */
function openGalleryEdit(index) {
  const isNew = index === -1;
  const g = isNew ? { imageUrl: '', imagePublicId: '', tag: '', title: '' } : siteData.gallery[index];
  editContext = { type: 'gallery', index };

  document.getElementById('edit-modal-body').innerHTML = `
    <div class="admin-form-row full">
      <div class="admin-form-group">
        <label for="m-gal-title">이미지 제목</label>
        <input type="text" id="m-gal-title" class="form-control" value="${esc(g.title)}">
      </div>
    </div>
    <div class="admin-form-row full">
      <div class="admin-form-group">
        <label for="m-gal-tag">분류 태그 (예: 할로코드, 큐브로이드)</label>
        <input type="text" id="m-gal-tag" class="form-control" value="${esc(g.tag)}">
      </div>
    </div>
    <div class="admin-form-row full">
      <div class="admin-form-group">
        <label>이미지 파일 업로드</label>
        ${g.imageUrl ? `<img src="${esc(g.imageUrl)}" style="width:100px;margin-bottom:0.5rem;border-radius:4px;">` : ''}
        <input type="file" id="m-gal-file" class="form-control" accept="image/*">
        <p style="font-size:0.8rem;color:var(--text-muted);margin-top:0.4rem;">새 파일을 선택하면 기존 이미지가 교체됩니다.</p>
        <input type="hidden" id="m-gal-url" value="${esc(g.imageUrl)}">
        <input type="hidden" id="m-gal-pubid" value="${esc(g.imagePublicId || '')}">
      </div>
    </div>
  `;
  openModal(isNew ? '새 갤러리 이미지 추가' : '갤러리 이미지 수정');
}

/* ─── 삭제 헬퍼 ─── */
async function deleteProgram(index) {
  if (!confirm(`"${siteData.programs[index].title}" 프로그램을 삭제하시겠습니까?`)) return;
  siteData.programs.splice(index, 1);
  await DataService.updateSection('programs', siteData.programs);
  showAdminToast('프로그램이 삭제되었습니다.');
  renderSection('programs');
}

async function deleteGallery(index) {
  if (!confirm(`"${siteData.gallery[index].title}" 이미지를 삭제하시겠습니까?`)) return;
  siteData.gallery.splice(index, 1);
  await DataService.updateSection('gallery', siteData.gallery);
  showAdminToast('갤러리 이미지가 삭제되었습니다.');
  renderSection('gallery');
}

/* ═══════════════════════════════════════════════════
   통합 저장 핸들러 (모달 '저장하기' 버튼)
   ═══════════════════════════════════════════════════ */
async function handleSave() {
  if (!editContext) return;
  
  const saveBtn = document.getElementById('edit-modal-save');
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 저장 중...';

  try {
    const { type, index } = editContext;

    if (type === 'stat') {
      siteData.stats[index] = {
        ...siteData.stats[index],
        value: parseFloat(document.getElementById('m-stat-value').value),
        suffix: document.getElementById('m-stat-suffix').value,
        label: document.getElementById('m-stat-label').value,
        icon: document.getElementById('m-stat-icon').value,
        color: document.getElementById('m-stat-color').value
      };
      await DataService.updateSection('stats', siteData.stats);
      showAdminToast('통계 항목이 저장되었습니다.');
      renderSection('stats');
    }

    if (type === 'program') {
      const tagStyles = ['tag-blue', 'tag-orange', 'tag-purple', 'tag-green'];
      const tagTexts = document.getElementById('m-prog-tags').value.split(',').map(t => t.trim()).filter(Boolean);
      const tags = tagTexts.map((t, i) => ({ text: t, style: tagStyles[i % tagStyles.length] }));

      const prog = {
        id: index === -1 ? 'prog-' + Date.now() : siteData.programs[index].id,
        category: document.getElementById('m-prog-category').value,
        tags,
        title: document.getElementById('m-prog-title').value,
        desc: document.getElementById('m-prog-desc').value,
        features: document.getElementById('m-prog-features').value.split('\n').map(f => f.trim()).filter(Boolean),
        duration: document.getElementById('m-prog-duration').value
      };

      if (index === -1) siteData.programs.push(prog);
      else siteData.programs[index] = prog;

      await DataService.updateSection('programs', siteData.programs);
      showAdminToast(index === -1 ? '새 프로그램이 추가되었습니다.' : '프로그램이 수정되었습니다.');
      renderSection('programs');
    }

    if (type === 'gallery') {
      const fileInput = document.getElementById('m-gal-file');
      let imageUrl = document.getElementById('m-gal-url').value;
      let imagePublicId = document.getElementById('m-gal-pubid').value;

      if (fileInput.files.length > 0) {
        const res = await CloudinaryService.uploadImage(fileInput.files[0]);
        imageUrl = res.secure_url;
        imagePublicId = res.public_id;
      }

      if (!imageUrl && index === -1) {
        throw new Error("새 이미지를 등록하려면 파일을 선택해 주세요.");
      }

      const item = {
        id: index === -1 ? 'gal-' + Date.now() : siteData.gallery[index].id,
        imageUrl,
        imagePublicId,
        tag: document.getElementById('m-gal-tag').value,
        title: document.getElementById('m-gal-title').value
      };

      if (index === -1) siteData.gallery.push(item);
      else siteData.gallery[index] = item;

      await DataService.updateSection('gallery', siteData.gallery);
      showAdminToast(index === -1 ? '갤러리 이미지가 추가되었습니다.' : '갤러리 이미지가 수정되었습니다.');
      renderSection('gallery');
    }

    closeModal();
  } catch (err) {
    showAdminToast(err.message, true);
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i class="fas fa-check"></i> 저장하기';
  }
}

/* ─── HTML 이스케이프 유틸 ─── */
function esc(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

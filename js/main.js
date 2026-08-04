/**
 * Lim Eun-hye AI & Coding Education Lab
 * Interactive UI Scripts with Accessibility & Form Polish
 * (ES Module 방식 - Firestore 연동)
 */

import { DataService } from './dataService.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1. 데이터 로드 및 렌더링
  await hydrateSiteData();

  // 2. UI 인터랙션 초기화
  initHeaderScroll();
  initMobileMenu();
  initAnimatedCounters();
  initProgramTabs();
  initGalleryLightbox();
  initProposalModal();
  initContactForm();
  initGlobalKeyListeners();
});

/* =========================================================
   데이터 연동 (Hydration)
   ========================================================= */
async function hydrateSiteData() {
  try {
    const data = await DataService.getAll();
    if (!data) return;

    // 히어로 섹션
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroImg = document.querySelector('.hero-img');
    if (heroTitle && data.hero) {
      heroTitle.innerHTML = `${data.hero.title} <br><span class="text-highlight">${data.hero.titleHighlight}</span>`;
    }
    if (heroSubtitle && data.hero) {
      heroSubtitle.textContent = data.hero.subtitle;
    }
    if (heroImg && data.hero && data.hero.imageUrl) {
      heroImg.src = data.hero.imageUrl;
    }

    // 강사 소개 섹션
    const aboutName = document.querySelector('.about-text h3');
    const aboutBio = document.querySelector('.about-text p');
    const aboutImg = document.querySelector('.about-image img');
    if (aboutName && data.about) {
      aboutName.innerHTML = `${data.about.name} <span style="font-size: 1.1rem; color: var(--text-muted); font-weight: 500;">강사</span>`;
    }
    if (aboutBio && data.about) {
      aboutBio.textContent = data.about.bio;
    }
    if (aboutImg && data.about && data.about.profileImageUrl) {
      aboutImg.src = data.about.profileImageUrl;
    }

    // 커리큘럼 (Programs)
    const programsGrid = document.querySelector('.programs-grid');
    if (programsGrid && data.programs) {
      programsGrid.innerHTML = data.programs.map(p => `
        <div class="program-card" data-category="${p.category}">
          <div class="program-card-header">
            <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem; flex-wrap: wrap;">
              ${p.tags.map(t => `<span class="tag ${t.style}">${t.text}</span>`).join('')}
            </div>
            <h3 class="program-title">${p.title}</h3>
            <p class="program-desc">${p.desc}</p>
          </div>
          <div class="program-features">
            <ul>
              ${p.features.map(f => `<li><i class="fas fa-check" aria-hidden="true"></i> ${f}</li>`).join('')}
            </ul>
          </div>
          <div class="program-footer">
            <span style="font-size: 0.85rem; color: var(--text-muted);"><i class="far fa-clock" aria-hidden="true"></i> ${p.duration}</span>
            <button class="btn btn-outline btn-sm btn-open-proposal" aria-label="교육 제안서 미리보기">
              <i class="fas fa-file-pdf" aria-hidden="true"></i> 제안서 보기
            </button>
          </div>
        </div>
      `).join('');
    }

    // 갤러리 (Gallery)
    const galleryGrid = document.querySelector('.gallery-grid');
    if (galleryGrid && data.gallery) {
      galleryGrid.innerHTML = data.gallery.map(g => `
        <div class="gallery-card" tabindex="0" role="button" aria-label="수업 현장 크게 보기">
          <img src="${g.imageUrl}" alt="${g.title}" class="gallery-img" loading="lazy">
          <div class="gallery-overlay">
            <span class="gallery-tag">${g.tag}</span>
            <div class="gallery-title">${g.title}</div>
          </div>
        </div>
      `).join('');
    }

  } catch (err) {
    console.error("데이터 하이드레이션 오류:", err);
  }
}

/* =========================================================
   기존 UI 인터랙션 함수들
   ========================================================= */

/* 1. Header Scroll Effect & Active Section Highlight */
function initHeaderScroll() {
  const header = document.querySelector('.header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

/* 2. Mobile Drawer Menu Toggle */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-toggle-btn');
  const drawer = document.getElementById('mobile-drawer');
  const drawerLinks = document.querySelectorAll('.mobile-drawer .nav-link, .mobile-drawer .btn');

  if (!toggleBtn || !drawer) return;

  function toggleMenu(open) {
    const isOpen = open !== undefined ? open : !drawer.classList.contains('open');
    if (isOpen) {
      drawer.classList.add('open');
      toggleBtn.setAttribute('aria-expanded', 'true');
      const icon = toggleBtn.querySelector('i');
      if (icon) icon.className = 'fas fa-times';
    } else {
      drawer.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      const icon = toggleBtn.querySelector('i');
      if (icon) icon.className = 'fas fa-bars';
    }
  }

  toggleBtn.addEventListener('click', () => toggleMenu());
  drawerLinks.forEach(link => link.addEventListener('click', () => toggleMenu(false)));
}

/* 3. Number Counter Animation */
function initAnimatedCounters() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (!statNumbers.length) return;

  let animated = false;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        statNumbers.forEach(counter => {
          const target = parseFloat(counter.getAttribute('data-target'));
          const suffix = counter.getAttribute('data-suffix') || '';
          const isDecimal = target % 1 !== 0;
          const steps = 60;
          const stepTime = 2000 / steps;
          let current = 0;
          const increment = target / steps;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            counter.innerText = (isDecimal ? current.toFixed(1) : Math.floor(current)).toLocaleString() + suffix;
          }, stepTime);
        });
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.querySelector('.stats-grid');
  if (statsSection) observer.observe(statsSection);
}

/* 4. Programs Tab Filtering */
function initProgramTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const programCards = document.querySelectorAll('.program-card');

  if (!tabBtns.length || !programCards.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.getAttribute('data-filter');
      programCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* 5. Gallery Lightbox Modal */
function initGalleryLightbox() {
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  
  if (!lightboxModal) return;

  function openLightbox(card) {
    const img = card.querySelector('.gallery-img');
    const title = card.querySelector('.gallery-title')?.innerText || '';
    const tag = card.querySelector('.gallery-tag')?.innerText || '';

    if (img && lightboxImg) {
      lightboxImg.src = img.src;
      lightboxImg.alt = title;
      lightboxCaption.innerHTML = `<strong>[${tag}]</strong> ${title}`;
      lightboxModal.classList.add('active');
    }
  }

  // 동적으로 생성된 갤러리 카드에 이벤트 위임 처리
  const galleryGrid = document.querySelector('.gallery-grid');
  if (galleryGrid) {
    galleryGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.gallery-card');
      if (card) openLightbox(card);
    });
    galleryGrid.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const card = e.target.closest('.gallery-card');
        if (card) {
          e.preventDefault();
          openLightbox(card);
        }
      }
    });
  }

  const closeBtns = lightboxModal.querySelectorAll('.modal-close, .modal-backdrop-close');
  closeBtns.forEach(btn => btn.addEventListener('click', () => lightboxModal.classList.remove('active')));
  lightboxModal.addEventListener('click', (e) => {
    if (e.target === lightboxModal) lightboxModal.classList.remove('active');
  });
}

/* 6. Administrative Proposal Preview Modal */
function initProposalModal() {
  const modal = document.getElementById('proposal-modal');
  if (!modal) return;

  // 이벤트 위임 (동적 생성된 버튼 지원)
  document.body.addEventListener('click', (e) => {
    if (e.target.closest('.btn-open-proposal')) {
      e.preventDefault();
      modal.classList.add('active');
    }
  });

  const closeBtns = modal.querySelectorAll('.modal-close, .modal-backdrop-close');
  closeBtns.forEach(btn => btn.addEventListener('click', () => modal.classList.remove('active')));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  const downloadBtn = document.getElementById('btn-download-pdf');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      showToast('📄 표준 교육 제안서(PDF) 다운로드가 시작되었습니다.');
    });
  }
}

/* 7. Contact Form Handling (Firestore 연동) */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 전송 중...';
    submitBtn.disabled = true;

    try {
      const formData = {
        org: document.getElementById('org').value,
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        tool: document.getElementById('tool').value,
        date: document.getElementById('date').value,
        message: document.getElementById('message').value
      };

      await DataService.submitInquiry(formData);
      
      form.reset();
      showToast('✨ 강의 문의가 정상 접수되었습니다! 빠른 시간 내 연락드리겠습니다.');
    } catch (err) {
      showToast('❌ 문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.', true);
      console.error(err);
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
}

/* 8. Global Keyboard Accessibility */
function initGlobalKeyListeners() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.active').forEach(modal => {
        modal.classList.remove('active');
      });
      const drawer = document.getElementById('mobile-drawer');
      const toggleBtn = document.getElementById('mobile-toggle-btn');
      if (drawer && drawer.classList.contains('open')) {
        drawer.classList.remove('open');
        if (toggleBtn) {
          toggleBtn.setAttribute('aria-expanded', 'false');
          const icon = toggleBtn.querySelector('i');
          if (icon) icon.className = 'fas fa-bars';
        }
      }
    }
  });
}

/* Helper: Toast Notification */
function showToast(message, isError = false) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<i class="fas ${isError ? 'fa-exclamation-circle' : 'fa-check-circle'}" style="color: ${isError ? '#EF4444' : '#F97316'}; font-size: 1.2rem;"></i> <span>${message}</span>`;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

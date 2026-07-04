/**
 * 作品集 - 核心逻辑
 * 数据存储在 localStorage，媒体文件以 base64 / URL 存储
 */

// ─── 默认数据 ──────────────────────────────────────────
const DEFAULT_PROFILE = {
  name: '你的名字',
  title: '二维动销设计师',
  bio: '专注于品牌视觉、动态图形设计与创意内容制作',
  avatar: '',
  contacts: [
    { icon: 'email', label: 'your@email.com', href: 'mailto:your@email.com' },
    { icon: 'phone', label: '138 0000 0000', href: 'tel:13800000000' },
    { icon: 'wechat', label: 'WeChat: yourwechat', href: '' },
  ]
};

const DEFAULT_CATEGORIES = [
  { id: 'all', name: '全部', fixed: true },
  { id: 'brand', name: '品牌动画' },
  { id: 'social', name: '社交媒体' },
  { id: 'ad', name: '广告创意' },
  { id: 'personal', name: '个人创作' },
];

const ADMIN_PASSWORD = 'portfolio2024'; // 管理密码，可在此修改

// ─── 状态 ──────────────────────────────────────────────
let state = {
  profile: null,
  categories: [],
  works: [],
  activeCategory: 'all',
  lightboxWork: null,
};

// ─── 持久化 ────────────────────────────────────────────
function saveData() {
  localStorage.setItem('pf_profile', JSON.stringify(state.profile));
  localStorage.setItem('pf_categories', JSON.stringify(state.categories));
  localStorage.setItem('pf_works', JSON.stringify(state.works));
}

function loadData() {
  try {
    state.profile = JSON.parse(localStorage.getItem('pf_profile')) || DEFAULT_PROFILE;
    state.categories = JSON.parse(localStorage.getItem('pf_categories')) || DEFAULT_CATEGORIES;
    state.works = JSON.parse(localStorage.getItem('pf_works')) || [];
  } catch {
    state.profile = DEFAULT_PROFILE;
    state.categories = DEFAULT_CATEGORIES;
    state.works = [];
  }
}

// ─── 工具函数 ──────────────────────────────────────────
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function getTypeLabel(type) {
  const map = { image: '图片', video: '视频', webp: 'WebP', link: '网站链接' };
  return map[type] || type;
}

function getDomain(url) {
  try { return new URL(url).hostname; } catch { return url; }
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = e => resolve(e.target.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

// ─── 渲染 Profile ──────────────────────────────────────
function renderProfile() {
  const p = state.profile;
  const avatarEl = document.getElementById('profileAvatar');
  const nameEl = document.getElementById('profileName');
  const titleEl = document.getElementById('profileTitle');
  const bioEl = document.getElementById('profileBio');
  const contactsEl = document.getElementById('profileContacts');

  // 头像
  if (p.avatar) {
    avatarEl.innerHTML = `<img src="${p.avatar}" alt="avatar">`;
  } else {
    avatarEl.textContent = p.name ? p.name[0] : '?';
  }

  nameEl.textContent = p.name || '';
  titleEl.textContent = p.title || '';
  bioEl.textContent = p.bio || '';

  const iconMap = {
    email: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
    phone: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.61 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.52 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.15 6.15l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
    wechat: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    link: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
    location: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  };

  contactsEl.innerHTML = (p.contacts || []).map(c => {
    const icon = iconMap[c.icon] || iconMap.link;
    const inner = `${icon}<span>${c.label}</span>`;
    return c.href
      ? `<a class="contact-item" href="${c.href}" target="_blank" rel="noopener">${inner}</a>`
      : `<span class="contact-item">${inner}</span>`;
  }).join('');
}

// ─── 渲染分类筛选 ──────────────────────────────────────
function renderFilterBar() {
  const bar = document.getElementById('filterBar');
  const cats = [{ id: 'all', name: '全部', fixed: true }, ...state.categories.filter(c => !c.fixed)];

  bar.innerHTML = cats.map(cat => {
    const count = cat.id === 'all'
      ? state.works.length
      : state.works.filter(w => w.categoryId === cat.id).length;
    return `<button class="filter-tag${state.activeCategory === cat.id ? ' active' : ''}"
      data-cat="${cat.id}">
      ${cat.name}<span class="filter-count">${count}</span>
    </button>`;
  }).join('');

  bar.querySelectorAll('.filter-tag').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeCategory = btn.dataset.cat;
      renderFilterBar();
      renderWorks();
    });
  });
}

// ─── 渲染作品网格 ──────────────────────────────────────
function renderWorks() {
  const grid = document.getElementById('worksGrid');
  let works = state.activeCategory === 'all'
    ? state.works
    : state.works.filter(w => w.categoryId === state.activeCategory);

  if (works.length === 0) {
    grid.innerHTML = `<div class="empty-state">
      <div class="empty-icon">🖼️</div>
      <p>${state.works.length === 0 ? '还没有作品，点击右下角 + 开始添加' : '该分类暂无作品'}</p>
    </div>`;
    return;
  }

  grid.innerHTML = works.map(w => buildCardHTML(w)).join('');
  grid.querySelectorAll('.work-card').forEach(card => {
    card.addEventListener('click', () => openLightbox(card.dataset.id));
  });
}

function buildCardHTML(w) {
  let mediaHTML = '';
  if (w.type === 'image' || w.type === 'webp') {
    mediaHTML = `<img src="${w.src}" alt="${w.title}" loading="lazy">`;
  } else if (w.type === 'video') {
    mediaHTML = `<video src="${w.src}" muted preload="metadata" playsinline></video>
      <div class="play-icon"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>`;
  } else if (w.type === 'link') {
    mediaHTML = `<div class="link-preview">
      <div class="link-icon">🔗</div>
      <div class="link-domain">${getDomain(w.href)}</div>
    </div>`;
  }

  const catName = getCatName(w.categoryId);

  return `<div class="work-card" data-id="${w.id}">
    <div class="card-media">${mediaHTML}</div>
    <div class="card-body">
      <div class="card-header">
        <div class="card-title">${w.title}</div>
        <div class="card-type-badge">${getTypeLabel(w.type)}</div>
      </div>
      ${w.desc ? `<div class="card-desc">${w.desc}</div>` : ''}
      <div class="card-tags">
        ${catName ? `<span class="card-tag">${catName}</span>` : ''}
      </div>
    </div>
  </div>`;
}

function getCatName(catId) {
  const c = state.categories.find(c => c.id === catId);
  return c ? c.name : '';
}

// ─── Lightbox ──────────────────────────────────────────
function openLightbox(id) {
  const w = state.works.find(x => x.id === id);
  if (!w) return;
  state.lightboxWork = w;

  const box = document.getElementById('lightboxMedia');
  const title = document.getElementById('lightboxTitle');
  const badge = document.getElementById('lightboxBadge');
  const desc = document.getElementById('lightboxDesc');
  const tags = document.getElementById('lightboxTags');

  if (w.type === 'image' || w.type === 'webp') {
    box.innerHTML = `<img src="${w.src}" alt="${w.title}">`;
  } else if (w.type === 'video') {
    box.innerHTML = `<video src="${w.src}" controls autoplay muted style="max-width:100%;max-height:450px;"></video>`;
  } else if (w.type === 'link') {
    box.innerHTML = `<div class="modal-link-view">
      <div class="link-big-icon">🔗</div>
      <p style="margin-top:12px;font-size:13px;color:#999;">${w.href}</p>
      <a href="${w.href}" target="_blank" rel="noopener">访问链接 →</a>
    </div>`;
  }

  title.textContent = w.title;
  badge.textContent = getTypeLabel(w.type);
  desc.textContent = w.desc || '';
  const catName = getCatName(w.categoryId);
  tags.innerHTML = catName ? `<span class="modal-tag">${catName}</span>` : '';

  document.getElementById('lightboxOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const overlay = document.getElementById('lightboxOverlay');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
  // 停止视频播放
  const video = overlay.querySelector('video');
  if (video) video.pause();
}

// ─── Admin 密码门 ──────────────────────────────────────
let adminUnlocked = false;
function openAdminGate() {
  if (adminUnlocked) { openAdminModal(); return; }
  document.getElementById('pwGate').classList.add('active');
  document.getElementById('pwInput').value = '';
  document.getElementById('pwError').textContent = '';
  setTimeout(() => document.getElementById('pwInput').focus(), 100);
}

function checkPassword() {
  const v = document.getElementById('pwInput').value;
  if (v === ADMIN_PASSWORD) {
    adminUnlocked = true;
    document.getElementById('pwGate').classList.remove('active');
    openAdminModal();
  } else {
    document.getElementById('pwError').textContent = '密码错误，请重试';
    document.getElementById('pwInput').value = '';
    document.getElementById('pwInput').focus();
  }
}

// ─── Admin Modal ───────────────────────────────────────
let adminTab = 'add'; // 'add' | 'categories' | 'works' | 'profile'

function openAdminModal() {
  renderAdminCategories();
  renderAdminWorks();
  fillProfileForm();
  switchAdminTab(adminTab);
  document.getElementById('adminModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeAdminModal() {
  document.getElementById('adminModal').classList.remove('active');
  document.body.style.overflow = '';
  resetAddForm();
}

function switchAdminTab(tab) {
  adminTab = tab;
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('.admin-section').forEach(s => s.classList.toggle('active', s.dataset.section === tab));
}

// ─── 添加作品 ──────────────────────────────────────────
let pendingFile = null;
let pendingFileName = '';

function setupAddForm() {
  const typeSelect = document.getElementById('addType');
  const uploadArea = document.getElementById('uploadArea');
  const linkArea = document.getElementById('linkArea');
  const fileInput = document.getElementById('fileInput');
  const uploadZone = document.getElementById('uploadZone');
  const catSelect = document.getElementById('addCategory');

  typeSelect.addEventListener('change', () => {
    const t = typeSelect.value;
    uploadArea.style.display = t !== 'link' ? 'block' : 'none';
    linkArea.style.display = t === 'link' ? 'block' : 'none';
    // 更新文件接受类型
    if (t === 'video') fileInput.accept = 'video/*';
    else if (t === 'webp') fileInput.accept = 'image/webp,image/*';
    else fileInput.accept = 'image/*';
    pendingFile = null;
    document.getElementById('uploadPreviewText').textContent = '';
  });

  // 点击上传区
  uploadZone.addEventListener('click', () => fileInput.click());

  // 拖拽
  uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('dragover'); });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
  uploadZone.addEventListener('drop', e => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelected(f);
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) handleFileSelected(fileInput.files[0]);
  });
}

function handleFileSelected(file) {
  pendingFile = file;
  pendingFileName = file.name;
  document.getElementById('uploadPreviewText').textContent = `已选择：${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
  // 自动填充标题
  const titleInput = document.getElementById('addTitle');
  if (!titleInput.value) {
    titleInput.value = file.name.replace(/\.[^.]+$/, '');
  }
}

function refreshCategorySelect() {
  const sel = document.getElementById('addCategory');
  sel.innerHTML = state.categories.filter(c => !c.fixed).map(c =>
    `<option value="${c.id}">${c.name}</option>`
  ).join('');
}

async function submitAddWork() {
  const title = document.getElementById('addTitle').value.trim();
  const type = document.getElementById('addType').value;
  const desc = document.getElementById('addDesc').value.trim();
  const catId = document.getElementById('addCategory').value;

  if (!title) { showToast('请填写作品标题'); return; }

  const work = { id: genId(), title, type, desc, categoryId: catId, createdAt: Date.now() };

  if (type === 'link') {
    const href = document.getElementById('addLink').value.trim();
    if (!href) { showToast('请填写网站链接'); return; }
    work.href = href.startsWith('http') ? href : 'https://' + href;
    work.src = '';
  } else {
    if (!pendingFile) { showToast('请选择要上传的文件'); return; }
    const btn = document.getElementById('addSubmitBtn');
    btn.textContent = '上传中...';
    btn.disabled = true;
    try {
      work.src = await readFileAsDataURL(pendingFile);
      work.href = '';
    } catch {
      showToast('文件读取失败，请重试');
      btn.textContent = '添加作品';
      btn.disabled = false;
      return;
    }
    btn.textContent = '添加作品';
    btn.disabled = false;
  }

  state.works.unshift(work);
  saveData();
  renderWorks();
  renderFilterBar();
  renderAdminWorks();
  resetAddForm();
  showToast('作品添加成功！');
}

function resetAddForm() {
  document.getElementById('addTitle').value = '';
  document.getElementById('addDesc').value = '';
  document.getElementById('addLink').value = '';
  document.getElementById('uploadPreviewText').textContent = '';
  pendingFile = null;
  pendingFileName = '';
  document.getElementById('fileInput').value = '';
}

// ─── 分类管理 ──────────────────────────────────────────
function renderAdminCategories() {
  const list = document.getElementById('categoryList');
  const cats = state.categories.filter(c => !c.fixed);
  list.innerHTML = cats.length === 0
    ? '<p style="color:#999;font-size:12px;text-align:center;padding:12px;">暂无自定义分类</p>'
    : cats.map(c => {
        const cnt = state.works.filter(w => w.categoryId === c.id).length;
        return `<div class="category-item">
          <span class="cat-name">${c.name}</span>
          <span class="cat-count">${cnt} 件</span>
          <button class="btn btn-sm btn-danger" onclick="deleteCategory('${c.id}')">删除</button>
        </div>`;
      }).join('');
}

function addCategory() {
  const input = document.getElementById('newCatName');
  const name = input.value.trim();
  if (!name) { showToast('请输入分类名称'); return; }
  if (state.categories.find(c => c.name === name)) { showToast('分类名称已存在'); return; }
  state.categories.push({ id: genId(), name });
  saveData();
  renderAdminCategories();
  renderFilterBar();
  refreshCategorySelect();
  input.value = '';
  showToast(`分类"${name}"已添加`);
}

function deleteCategory(id) {
  const cat = state.categories.find(c => c.id === id);
  if (!cat) return;
  const cnt = state.works.filter(w => w.categoryId === id).length;
  if (cnt > 0 && !confirm(`分类"${cat.name}"下有 ${cnt} 件作品，删除后这些作品将变为无分类，确认删除？`)) return;
  state.categories = state.categories.filter(c => c.id !== id);
  saveData();
  renderAdminCategories();
  renderFilterBar();
  refreshCategorySelect();
  showToast(`分类"${cat.name}"已删除`);
}

// ─── 作品管理 ──────────────────────────────────────────
function renderAdminWorks() {
  const list = document.getElementById('worksAdminList');
  if (state.works.length === 0) {
    list.innerHTML = '<p style="color:#999;font-size:12px;text-align:center;padding:12px;">暂无作品</p>';
    return;
  }
  list.innerHTML = state.works.map(w => {
    let thumb = '';
    if (w.type === 'image' || w.type === 'webp') {
      thumb = `<img src="${w.src}" alt="">`;
    } else if (w.type === 'video') {
      thumb = `<video src="${w.src}" muted></video>`;
    } else {
      thumb = '🔗';
    }
    const catName = getCatName(w.categoryId);
    return `<div class="works-admin-item">
      <div class="work-thumb">${thumb}</div>
      <div class="work-name">${w.title}</div>
      <div class="work-cat">${catName}</div>
      <button class="btn btn-sm btn-danger" onclick="deleteWork('${w.id}')">删除</button>
    </div>`;
  }).join('');
}

function deleteWork(id) {
  const w = state.works.find(x => x.id === id);
  if (!w) return;
  if (!confirm(`确认删除作品"${w.title}"？此操作不可撤销。`)) return;
  state.works = state.works.filter(x => x.id !== id);
  saveData();
  renderWorks();
  renderFilterBar();
  renderAdminWorks();
  showToast('作品已删除');
}

// ─── 个人资料编辑 ──────────────────────────────────────
function fillProfileForm() {
  const p = state.profile;
  document.getElementById('editName').value = p.name || '';
  document.getElementById('editTitle').value = p.title || '';
  document.getElementById('editBio').value = p.bio || '';
  renderContactsEditor();
}

function renderContactsEditor() {
  const container = document.getElementById('contactsEditor');
  container.innerHTML = (state.profile.contacts || []).map((c, i) => `
    <div class="form-row" style="align-items:center;gap:8px;margin-bottom:8px;" data-idx="${i}">
      <select class="form-select" style="max-width:100px;" onchange="updateContact(${i},'icon',this.value)">
        ${['email','phone','wechat','link','location'].map(v =>
          `<option value="${v}"${c.icon === v ? ' selected' : ''}>${{email:'邮箱',phone:'电话',wechat:'微信',link:'链接',location:'地址'}[v]}</option>`
        ).join('')}
      </select>
      <input class="form-input" style="flex:1;" placeholder="显示文字" value="${c.label || ''}"
        oninput="updateContact(${i},'label',this.value)">
      <input class="form-input" style="flex:1;" placeholder="链接（可选）" value="${c.href || ''}"
        oninput="updateContact(${i},'href',this.value)">
      <button class="btn btn-sm btn-danger" onclick="removeContact(${i})">✕</button>
    </div>
  `).join('');
}

function updateContact(idx, field, val) {
  state.profile.contacts[idx][field] = val;
}
function removeContact(idx) {
  state.profile.contacts.splice(idx, 1);
  renderContactsEditor();
}
function addContact() {
  state.profile.contacts.push({ icon: 'link', label: '', href: '' });
  renderContactsEditor();
}

function saveProfile() {
  state.profile.name = document.getElementById('editName').value.trim();
  state.profile.title = document.getElementById('editTitle').value.trim();
  state.profile.bio = document.getElementById('editBio').value.trim();
  saveData();
  renderProfile();
  showToast('个人资料已保存');
}

// 头像上传
function setupAvatarUpload() {
  const input = document.getElementById('avatarInput');
  document.getElementById('avatarUploadBtn').addEventListener('click', () => input.click());
  input.addEventListener('change', async () => {
    if (!input.files[0]) return;
    state.profile.avatar = await readFileAsDataURL(input.files[0]);
    saveData();
    renderProfile();
    showToast('头像已更新');
  });
}

// ─── 初始化 ────────────────────────────────────────────
function init() {
  loadData();
  renderProfile();
  renderFilterBar();
  renderWorks();
  setupAddForm();
  setupAvatarUpload();
  refreshCategorySelect();

  // Lightbox 关闭
  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  document.getElementById('lightboxOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeLightbox();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeLightbox(); closeAdminModal(); } });

  // Admin FAB
  document.getElementById('adminFab').addEventListener('click', openAdminGate);

  // Admin Modal
  document.getElementById('adminClose').addEventListener('click', closeAdminModal);
  document.getElementById('adminModal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeAdminModal();
  });

  // Admin Tabs
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => switchAdminTab(tab.dataset.tab));
  });

  // Password gate
  document.getElementById('pwInput').addEventListener('keydown', e => { if (e.key === 'Enter') checkPassword(); });
  document.getElementById('pwConfirmBtn').addEventListener('click', checkPassword);
  document.getElementById('pwCancelBtn').addEventListener('click', () => {
    document.getElementById('pwGate').classList.remove('active');
  });

  // Add work form
  document.getElementById('addSubmitBtn').addEventListener('click', submitAddWork);

  // Categories
  document.getElementById('addCategoryBtn').addEventListener('click', addCategory);
  document.getElementById('newCatName').addEventListener('keydown', e => { if (e.key === 'Enter') addCategory(); });

  // Profile
  document.getElementById('saveProfileBtn').addEventListener('click', saveProfile);
  document.getElementById('addContactBtn').addEventListener('click', addContact);
}

document.addEventListener('DOMContentLoaded', init);

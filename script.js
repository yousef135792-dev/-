// script.js — handles storage, rendering, and navigation
const STORAGE_KEY = 'orphans_v1';
const SPONSOR_KEY = 'sponsors_v1';

function getSponsors(){
  try{ return JSON.parse(localStorage.getItem(SPONSOR_KEY) || '[]'); }catch(e){ return []; }
}

function saveSponsors(list){
  localStorage.setItem(SPONSOR_KEY, JSON.stringify(list));
}

function sponsorUid(){ return 's_' + Date.now().toString(36) + Math.random().toString(36).slice(2,6); }

function getOrphans(){
  try{
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  }catch(e){return []}
}

function saveOrphans(list){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function uid(){
  return 'o_' + Date.now().toString(36) + Math.random().toString(36).slice(2,8);
}

async function saveOrphanFromForm(){
  const name = document.getElementById('childName').value.trim();
  const birthday = document.getElementById('birthday').value;
  const phone = document.getElementById('childPhone').value.trim();
  const guardian = document.getElementById('guardianName').value.trim();
  const childId = document.getElementById('childId').value.trim();
  const location = document.getElementById('location').value.trim();
  const donor = document.getElementById('donorName').value.trim();
  const donorPhone = document.getElementById('donorPhone').value.trim();
  const donorAddress = document.getElementById('donorAddress').value.trim();
  // optional sponsor image
  const sponsorFileInput = document.getElementById('sponsorImage');
  let sponsorImageBase64 = '';
  if(sponsorFileInput && sponsorFileInput.files && sponsorFileInput.files[0]){
    try{ sponsorImageBase64 = await fileToBase64(sponsorFileInput.files[0]); }catch(e){ sponsorImageBase64 = ''; }
  }

  const fileInput = document.getElementById('childImage');
  const dataInput = document.getElementById('childImageData');
  let imageBase64 = '';
  if (dataInput && dataInput.value){
    imageBase64 = dataInput.value; // already-cropped data URL
  } else {
    if (fileInput && fileInput.files && fileInput.files[0]){
      imageBase64 = await fileToBase64(fileInput.files[0]);
    }
  }

  const list = getOrphans();
  const recordIdEl = document.getElementById('recordId');
  let record;
  if(recordIdEl && recordIdEl.value){
    // update existing
    const id = recordIdEl.value;
    const idx = list.findIndex(x=>x.id===id);
    if(idx !== -1){
      record = Object.assign({}, list[idx], { name, birthday, phone, guardian, childId, location, donor, donorPhone, donorAddress, image: imageBase64 || list[idx].image });
      list[idx] = record;
    } else {
      record = { id, name, birthday, phone, guardian, childId, location, donor, donorPhone, donorAddress, image: imageBase64, createdAt: new Date().toISOString() };
      list.unshift(record);
    }
  } else {
    record = { id: uid(), name, birthday, phone, guardian, childId, location, donor, donorPhone, donorAddress, image: imageBase64, createdAt: new Date().toISOString() };
    list.unshift(record);
  }
  saveOrphans(list);
  // ---- Sponsor association: attach this orphan to a sponsor (existing or new) ----
  try{
    const sponsors = getSponsors();
    const existingSel = document.getElementById('existingSponsor');
    let sponsorId = null;
    if(existingSel && existingSel.value && existingSel.value !== 'new'){
      sponsorId = existingSel.value;
    } else {
      // try to find by phone if donorPhone provided
      if(donorPhone){
        const found = sponsors.find(s=>s.phone && s.phone === donorPhone);
        if(found) sponsorId = found.id;
      }
    }

    if(sponsorId){
      let sp = sponsors.find(s=>s.id === sponsorId);
      if(!sp){
        sp = { id: sponsorId, name: donor || '', phone: donorPhone || '', address: donorAddress || '', image: sponsorImageBase64 || '', children: [record.id], createdAt: new Date().toISOString() };
        sponsors.unshift(sp);
      } else {
        sp.name = sp.name || donor;
        sp.phone = sp.phone || donorPhone;
        sp.address = sp.address || donorAddress;
        if(sponsorImageBase64) sp.image = sponsorImageBase64;
        sp.children = sp.children || [];
        if(!sp.children.includes(record.id)) sp.children.push(record.id);
      }
      saveSponsors(sponsors);
      // update orphan record with sponsorId
      record.sponsorId = sp.id;
      const idx2 = list.findIndex(x=>x.id===record.id);
      if(idx2 !== -1){ list[idx2] = record; saveOrphans(list); }
    } else if(donor){
      // create a new sponsor from donor fields
      const spId = sponsorUid();
      const sp = { id: spId, name: donor, phone: donorPhone || '', address: donorAddress || '', image: sponsorImageBase64 || '', children: [record.id], createdAt: new Date().toISOString() };
      sponsors.unshift(sp);
      saveSponsors(sponsors);
      record.sponsorId = sp.id;
      const idx2 = list.findIndex(x=>x.id===record.id);
      if(idx2 !== -1){ list[idx2] = record; saveOrphans(list); }
    }
  }catch(e){ console.warn('sponsor attach error', e); }

  return record;
}

function fileToBase64(file){
  return new Promise((res,rej)=>{
    const reader = new FileReader();
    reader.onload = ()=>res(reader.result);
    reader.onerror = ()=>rej(new Error('فشل قراءة الملف'));
    reader.readAsDataURL(file);
  });
}

function renderOrphansList(){
  const container = document.getElementById('orphansList');
  const emptyMsg = document.getElementById('emptyMsg');
  if(!container) return;
  const all = getOrphans();
  const q = (document.getElementById('filterInput') && document.getElementById('filterInput').value || '').trim().toLowerCase();
  const list = all.filter(o => {
    if(!q) return true;
    return (o.name||'').toLowerCase().includes(q) || (o.location||'').toLowerCase().includes(q) || (o.donor||'').toLowerCase().includes(q);
  });
  container.innerHTML = '';
  if(!list.length){
    emptyMsg.style.display = 'block';
    return;
  }
  emptyMsg.style.display = 'none';
  list.forEach(o => {
    const card = document.createElement('div');
    card.className = 'list-card';

    const img = document.createElement('img');
    img.className = 'thumb-small';
    img.alt = o.name || 'child';
    img.src = o.image || 'assets/default-profile.svg';

    const info = document.createElement('div');
    info.className = 'info';
    const nameLink = document.createElement('a');
    nameLink.className = 'name-link';
    nameLink.href = `details.html?id=${encodeURIComponent(o.id)}`;
    nameLink.textContent = o.name || 'بدون اسم';
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `${o.location || ''} • ${o.birthday || ''}` + (o.donor ? ` • متبرع: ${o.donor}` : '');
    info.appendChild(nameLink);
    info.appendChild(meta);

    const actions = document.createElement('div');
    actions.className = 'actions';
    const del = document.createElement('button');
    del.className = 'btn danger';
    del.textContent = 'حذف';
    del.dataset.id = o.id;
    del.addEventListener('click', (e)=>{ e.stopPropagation(); deleteOrphan(o.id); });
    actions.appendChild(del);

    // assemble
    card.appendChild(img);
    card.appendChild(info);
    card.appendChild(actions);
    container.appendChild(card);
  });
}

// Undo buffer for last deleted item
let lastDeleted = null; // {record, timeoutId}

function deleteOrphan(id){
  // remove immediately but keep record for undo
  const list = getOrphans();
  const idx = list.findIndex(x=>x.id===id);
  if(idx === -1) return;
  const [record] = list.splice(idx,1);
  saveOrphans(list);
  renderOrphansList();

  // show toast with undo
  lastDeleted = {record};
  const toast = document.getElementById('toast');
  const undoBtn = document.getElementById('undoBtn');
  if(toast){ toast.style.display = 'flex'; }
  if(undoBtn){
    undoBtn.onclick = ()=>{
      // restore
      const cur = getOrphans();
      cur.unshift(record);
      saveOrphans(cur);
      renderOrphansList();
      if(toast) toast.style.display = 'none';
      lastDeleted = null;
    };
  }

  // after 6 seconds hide toast and clear buffer
  if(lastDeleted && lastDeleted.timeoutId) clearTimeout(lastDeleted.timeoutId);
  lastDeleted.timeoutId = setTimeout(()=>{
    lastDeleted = null;
    if(toast) toast.style.display = 'none';
  }, 6000);
}

// wire filter input to re-render
document.addEventListener('input', (e)=>{
  if(e.target && e.target.id === 'filterInput'){
    renderOrphansList();
  }
});

// Navigation helpers for top icons
document.addEventListener('DOMContentLoaded', ()=>{
  // settings toggles
  const s = document.getElementById('settingsBtn');
  const p = document.getElementById('settingsPanel');
  if(s && p){ s.addEventListener('click', ()=> p.classList.toggle('show')); }
  const sAdd = document.getElementById('settingsBtnAdd');
  const pAdd = document.getElementById('settingsPanelAdd');
  if(sAdd && pAdd){ sAdd.addEventListener('click', ()=> pAdd.classList.toggle('show')); }
  const sDet = document.getElementById('settingsBtnDetails');
  const pDet = document.getElementById('settingsPanelDetails');
  if(sDet && pDet){ sDet.addEventListener('click', ()=> pDet.classList.toggle('show')); }

  // language toggles
  const langButtons = [
    document.getElementById('langToggle'),
    document.getElementById('langToggleAdd'),
    document.getElementById('langToggleDetails')
  ];
  langButtons.forEach(btn=>{ if(btn) btn.addEventListener('click', toggleLanguage); });

  // back icons
  const backIds = ['nav-back','nav-back-add','nav-back-details'];
  backIds.forEach(id=>{
    const el = document.getElementById(id);
    if(!el) return;
    el.addEventListener('click', ()=> history.back());
  });
  applyLanguage();
  // populate sponsors select when available
  if(typeof populateSponsorsSelect === 'function') populateSponsorsSelect();
});

// populate sponsors dropdown used on add.html
function populateSponsorsSelect(){
  const sel = document.getElementById('existingSponsor');
  if(!sel) return;
  const sponsors = getSponsors();
  // clear options except the 'new' default
  const curVal = sel.value || 'new';
  sel.innerHTML = '<option value="new">-- كفيل جديد --</option>';
  sponsors.forEach(s=>{
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = `${s.name || '(بدون اسم)'} ${s.phone? '• ' + s.phone: ''}`;
    sel.appendChild(opt);
  });
  // restore previous selection if exists
  try{ sel.value = curVal; }catch(e){}
}

// Simple i18n support: keys and translations
const I18N = {
  ar: {
    orgName: 'كفالة أطفال غزة',
    contactTitle: 'معلومات الاتصال',
    addChild: 'إضافة يتيم جديد',
    save: 'حفظ',
  },
  en: {
    orgName: 'Kafalat Children Gaza',
    contactTitle: 'Contact Information',
    addChild: 'Add New Orphan',
    save: 'Save',
  }
};

function currentLang(){ return localStorage.getItem('site_lang') || 'ar'; }

function toggleLanguage(){
  const next = currentLang() === 'ar' ? 'en' : 'ar';
  localStorage.setItem('site_lang', next);
  applyLanguage();
  // re-render navbar and set document direction
  if(typeof renderNavbar === 'function') renderNavbar();
  document.documentElement.setAttribute('dir', next === 'ar' ? 'rtl' : 'ltr');
}

function applyLanguage(){
  const lang = currentLang();
  // prefer TRANSLATIONS if available
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    // support nested keys like settings_sections.language
    const parts = key.split('.');
    let value = null;
    if(window.TRANSLATIONS && TRANSLATIONS[lang]){
      let cur = TRANSLATIONS[lang];
      for(const p of parts){ if(cur && (p in cur)){ cur = cur[p]; } else { cur = null; break; } }
      value = cur;
    }
    if(value == null){ // fallback to I18N
      if(I18N[lang] && I18N[lang][key]) value = I18N[lang][key];
    }
    if(value != null){
      // allow translations to include newlines which should render as <br>
      if(typeof value === 'string' && value.indexOf('\n') !== -1){
        el.innerHTML = value.replace(/\n/g, '<br>');
      } else {
        el.textContent = value;
      }
    }
  });

  // set placeholders from data-i18n-placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
    const key = el.getAttribute('data-i18n-placeholder');
    let value = null;
    if(window.TRANSLATIONS && TRANSLATIONS[lang] && (key in TRANSLATIONS[lang])) value = TRANSLATIONS[lang][key];
    if(value == null && I18N[lang] && (key in I18N[lang])) value = I18N[lang][key];
    if(value != null){ el.placeholder = value; }
  });

  // set title attributes from data-i18n-title
  document.querySelectorAll('[data-i18n-title]').forEach(el=>{
    const key = el.getAttribute('data-i18n-title');
    let value = null;
    if(window.TRANSLATIONS && TRANSLATIONS[lang] && (key in TRANSLATIONS[lang])) value = TRANSLATIONS[lang][key];
    if(value == null && I18N[lang] && (key in I18N[lang])) value = I18N[lang][key];
    if(value != null){ el.title = value; }
  });
  // buttons
  const addBtns = document.querySelectorAll('a.btn[href="add.html"]');
  addBtns.forEach(b=> b.textContent = I18N[lang].addChild || b.textContent);
  const saveBtns = document.querySelectorAll('button[type="submit"], button.btn.primary');
  saveBtns.forEach(b=>{ if(b.id !== 'undoBtn') b.textContent = I18N[lang].save || b.textContent; });
}

function deleteOrphan(id){
  if(!confirm('هل أنت متأكد أنك تريد حذف هذا السجل؟')) return;
  const list = getOrphans();
  const idx = list.findIndex(x=>x.id===id);
  if(idx === -1) return;
  list.splice(idx,1);
  saveOrphans(list);
  renderOrphansList();
}

// Save button feedback (does not navigate)
function initSaveButton(){
  const btn = document.getElementById('saveBtn');
  const msg = document.getElementById('saveMsg');
  if(!btn || !msg) return;
  btn.addEventListener('click', () => {
    msg.style.display = 'flex';
    msg.innerHTML = '<span class="check">✓</span> تم التسجيل';
    setTimeout(()=>{ msg.style.display = 'none'; }, 2500);
  });
}

// Initialize list and save button when on index page
document.addEventListener('DOMContentLoaded', ()=>{
  renderOrphansList();
  initSaveButton();
  initAddForm();
});

// helper: preview image for add form (if present)
document.addEventListener('change', (e)=>{
  if(e.target && e.target.id === 'childImage'){
    const input = e.target;
    const file = input.files && input.files[0];
    const preview = document.getElementById('previewImg');
    const photoWrap = document.getElementById('photoPreview');
    if(!file) {
      if(preview) preview.src = 'assets/default-profile.svg';
      return;
    }
    const reader = new FileReader();
    reader.onload = ()=>{
      if(preview){ preview.src = reader.result; preview.style.display = 'block'; }
      if(photoWrap && !preview.src) photoWrap.style.background = '#fff';
    };
    reader.readAsDataURL(file);
  }
});

// Initialize and validate add form (on add.html)
function initAddForm(){
  const form = document.getElementById('orphanForm');
  if(!form) return;
  const saveBtn = document.getElementById('saveBtn');
  const resetBtn = document.getElementById('resetBtn');
  const fileInput = document.getElementById('childImage');
  const msg = document.getElementById('formMsg');

  const fields = ['childName','guardianName','birthday','childId','childPhone','location','donorName','donorPhone','donorAddress'];
  const phoneFields = ['childPhone','donorPhone'];

  // wire sponsor select behavior: when selecting existing sponsor, autofill donor fields and make them readonly
  const sponsorSelect = document.getElementById('existingSponsor');
  function onSponsorChange(){
    const val = sponsorSelect && sponsorSelect.value ? sponsorSelect.value : 'new';
    const donorEl = document.getElementById('donorName');
    const phoneEl = document.getElementById('donorPhone');
    const addrEl = document.getElementById('donorAddress');
    if(val && val !== 'new'){
      const sp = getSponsors().find(s=>s.id===val);
      if(sp){ if(donorEl) { donorEl.value = sp.name || ''; donorEl.readOnly = true; } if(phoneEl){ phoneEl.value = sp.phone || ''; phoneEl.readOnly = true; } if(addrEl){ addrEl.value = sp.address || ''; addrEl.readOnly = true; } }
    } else {
      if(donorEl){ donorEl.readOnly = false; /* do not clear to allow editing */ }
      if(phoneEl){ phoneEl.readOnly = false; }
      if(addrEl){ addrEl.readOnly = false; }
    }
    validate();
  }
  if(sponsorSelect) sponsorSelect.addEventListener('change', onSponsorChange);

  function isFilled(id){
    const el = document.getElementById(id);
    if(!el) return false;
    if(el.tagName === 'TEXTAREA' || el.tagName === 'INPUT'){
      return el.value.trim() !== '';
    }
    return true;
  }

  function phonesValid(){
    for(const id of phoneFields){
      const el = document.getElementById(id);
      if(!el) return false;
      const v = el.value.trim();
      if(!/^[0-9]+$/.test(v)) return false;
      if(v.length < 5) return false;
    }
    return true;
  }

  function fileSelected(){
    if(!fileInput) return false;
    return fileInput.files && fileInput.files.length>0;
  }

  function validate(){
    // all fields filled
    for(const id of fields){
      // if sponsor selected (existing) we allow donor fields to be empty
      const sponsorSelect = document.getElementById('existingSponsor');
      if(sponsorSelect && sponsorSelect.value && sponsorSelect.value !== 'new' && (id === 'donorName' || id === 'donorPhone' || id === 'donorAddress')) continue;
      if(!isFilled(id)) return disableSave();
    }
    if(!phonesValid()) return disableSave();
    enableSave();
  }

  function enableSave(){
    if(!saveBtn) return;
    saveBtn.disabled = false;
    saveBtn.classList.add('enabled');
  }
  function disableSave(){
    if(!saveBtn) return;
    saveBtn.disabled = true;
    saveBtn.classList.remove('enabled');
  }

  // sanitize phone inputs to digits only
  for(const id of phoneFields){
    const el = document.getElementById(id);
    if(!el) continue;
    el.setAttribute('inputmode','numeric');
    el.addEventListener('input', (e)=>{ e.target.value = e.target.value.replace(/\D/g,''); validate(); });
  }

  // attach listeners to other fields
  for(const id of fields){
    const el = document.getElementById(id);
    if(!el) continue;
    if(!phoneFields.includes(id)) el.addEventListener('input', ()=>validate());
  }

  if(fileInput) fileInput.addEventListener('change', ()=>{ validate(); });

  if(resetBtn) resetBtn.addEventListener('click', ()=>{ setTimeout(()=>{ disableSave(); if(msg) msg.style.display='none'; },50); });

  // initial validation
  validate();

  // intercept submit to ensure validation
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    if(saveBtn && saveBtn.disabled) return;
    try{
      // show progress bar
      const progressWrap = document.getElementById('saveProgress');
      const progressBar = document.getElementById('saveProgressBar');
      if(progressWrap && progressBar){ progressWrap.style.display='block'; progressBar.style.width='0%'; }
      // simulate progress
      let p = 0;
      const interval = setInterval(()=>{ p = Math.min(95, p + Math.floor(Math.random()*15)+5); if(progressBar) progressBar.style.width = p + '%'; }, 180);

      const saved = await saveOrphanFromForm();
      clearInterval(interval);
      if(progressBar) progressBar.style.width = '100%';
      if(msg){ msg.style.display = 'flex'; msg.innerHTML = '<span class="check">✓</span> تم تسجيل اليتيم بنجاح'; }
      // short delay to allow user to see progress, then redirect to confirmation page
      setTimeout(()=>{
        form.reset(); disableSave(); if(progressWrap) progressWrap.style.display='none';
        // go to confirmation page
        location.href = `success.html?id=${encodeURIComponent(saved.id)}`;
      }, 600);
    }catch(err){
      if(msg){ msg.style.display='flex'; msg.innerHTML = '<span style="background:#e74c3c;color:#fff;border-radius:50%;display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;margin-inline-end:8px">!</span> حدث خطأ'; }
    }
  });
}

function renderDetails(id){
  const list = getOrphans();
  const o = list.find(x => x.id === id);
  if(!o) return;
  document.getElementById('certName').textContent = o.name || '';
  document.getElementById('certBirthday').textContent = o.birthday || '';
  document.getElementById('certPhone').textContent = o.phone || '';
  document.getElementById('certGuardian').textContent = o.guardian || '';
  document.getElementById('certId').textContent = o.childId || '';
  document.getElementById('certLocation').textContent = o.location || '';
  // show donor as link to sponsor page when possible
  const donorEl = document.getElementById('certDonor');
  if(donorEl){
    if(o.sponsorId){ donorEl.innerHTML = `<a href="sponsor.html?id=${encodeURIComponent(o.sponsorId)}">${o.donor || '(الكفيل)'}</a>`; }
    else {
      // try to find sponsor by phone
      const sp = (o.donorPhone) ? getSponsors().find(s=>s.phone === o.donorPhone) : null;
      if(sp){ donorEl.innerHTML = `<a href="sponsor.html?id=${encodeURIComponent(sp.id)}">${o.donor || sp.name || '(الكفيل)'}</a>`; }
      else donorEl.textContent = o.donor || '';
    }
  }
  document.getElementById('certDonorPhone').textContent = o.donorPhone || '';
  document.getElementById('certDonorAddress').textContent = o.donorAddress || '';
  const img = document.getElementById('certImage');
  img.src = o.image || 'assets/default-profile.svg';
}

/* ---------- Navbar rendering & language integration ---------- */
function getSiteLang(){ return localStorage.getItem('site_lang') || 'ar'; }
function setSiteLang(lang){ localStorage.setItem('site_lang', lang); applyLanguage(); renderNavbar(); document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr'); }

function renderNavbar(){
  const nav = document.getElementById('mainNavbar');
  if(!nav) return;
  const lang = getSiteLang();
  const t = (window.TRANSLATIONS && window.TRANSLATIONS[lang]) ? window.TRANSLATIONS[lang] : (window.TRANSLATIONS && window.TRANSLATIONS['ar']) || {};
  const org = (typeof I18N !== 'undefined' && I18N[lang] && I18N[lang].orgName) ? I18N[lang].orgName : '';
  nav.innerHTML = `
    <div class="brand"><img src="assets/logo.png" alt="logo"><span class="brand-title" data-i18n="orgName">${org}</span></div>
    <div class="nav-items">
      <a href="index.html" class="nav-link" data-key="home"><i class="fa fa-home"></i><span class="nav-text">${t.home||'Home'}</span></a>
      <a href="add.html" class="nav-link" data-key="register"><i class="fa fa-user-plus"></i><span class="nav-text">${t.register||'Register'}</span></a>
      <a href="index.html" class="nav-link" data-key="list"><i class="fa fa-list"></i><span class="nav-text">${t.list||'List'}</span></a>
      <a href="sponsors.html" class="nav-link" data-key="donors"><i class="fa fa-hand-holding-heart"></i><span class="nav-text">${t.donors||'Donors'}</span></a>
      <div class="nav-dropdown">
        <a href="#" class="drop-toggle nav-link" data-key="reports"><i class="fa fa-chart-bar"></i><span class="nav-text">${t.reports||'Reports'}</span> <i class="fa fa-caret-down"></i></a>
        <div class="dropdown-menu">
          <a href="#" data-sub="monthly">${t.reports_monthly||'Monthly Reports'}</a>
          <a href="#" data-sub="yearly">${t.reports_yearly||'Yearly Reports'}</a>
          <a href="#" data-sub="custom">${t.reports_custom||'Custom Reports'}</a>
        </div>
      </div>
      <!-- Settings moved beside Reports -->
      <a href="#" id="navSettings" class="nav-link" data-key="settings"><i class="fa fa-cog"></i><span class="nav-text">${t.settings||'Settings'}</span></a>
    </div>
    <div class="nav-end">
      <div class="lang-switch" role="group" aria-label="Language switch" style="display:flex;gap:6px;align-items:center">
        <button id="langAr" class="btn" title="العربية">AR</button>
        <button id="langEn" class="btn" title="English">EN</button>
      </div>
      <a href="#" id="exportBtn" class="nav-link" title="Export"><i class="fa fa-file-export"></i><span class="nav-text">${t.export||'Export'}</span></a>
      <a href="#" id="importBtn" class="nav-link" title="Import"><i class="fa fa-file-import"></i><span class="nav-text">${t.import||'Import'}</span></a>
      <input type="file" id="importFile" accept="application/json" style="display:none" />
      <a href="#" id="logoutBtn" class="nav-link"><i class="fa fa-sign-out-alt"></i><span class="nav-text">${t.logout||'Logout'}</span></a>
    </div>
  `;

  // bind dropdown toggles
  nav.querySelectorAll('.nav-dropdown .drop-toggle').forEach(el=>{
    el.addEventListener('click', (ev)=>{ ev.preventDefault(); el.parentElement.classList.toggle('show'); });
  });

  // settings open maps to existing settings panel if present
  // settings button (now placed beside reports) opens existing settings panels if present
  const ns = document.getElementById('navSettings');
  if(ns){ ns.addEventListener('click',(e)=>{ e.preventDefault(); const panels = document.querySelectorAll('.settings-panel'); if(panels.length) panels.forEach(p=>p.classList.toggle('show')); else { location.href='settings.html'; } }); }

  const logout = document.getElementById('logoutBtn');
  if(logout){ logout.addEventListener('click',(e)=>{ e.preventDefault(); const confirmMsg = (lang==='ar') ? 'هل تريد تسجيل الخروج؟' : 'Do you want to logout?'; if(confirm(confirmMsg)){ localStorage.removeItem('site_user'); location.href='index.html'; } }); }

  // ensure data-i18n keys in brand are applied
  applyLanguage();
}

/* ---------- Settings rendering helpers ---------- */
function renderSettingsSection(section){
  const body = document.getElementById('settingsBody');
  if(!body) return;
  const lang = currentLang();
  const t = window.TRANSLATIONS && TRANSLATIONS[lang] || {};
  body.innerHTML = '';
  if(section === 'language'){
    body.innerHTML = `
      <p>${t.welcomeMsg || ''}</p>
      <div style="display:flex;gap:8px;margin-top:12px">
        <button class="btn accent-btn" id="setAr">${t.lang_ar||'Arabic'}</button>
        <button class="btn" id="setEn">${t.lang_en||'English'}</button>
      </div>
    `;
    document.getElementById('setAr').addEventListener('click', ()=> setSiteLang('ar'));
    document.getElementById('setEn').addEventListener('click', ()=> setSiteLang('en'));
  } else if(section === 'account'){
    const user = JSON.parse(localStorage.getItem('site_user')||'{}');
    body.innerHTML = `
      <div class="settings-row">
        <div>
          <label>${t.profile_name||'Full Name'}<input id="s_name" type="text" value="${user.name||''}"></label>
          <label>${t.profile_email||'Email'}<input id="s_email" type="email" value="${user.email||''}"></label>
          <label>${t.profile_phone||'Phone'}<input id="s_phone" type="tel" value="${user.phone||''}"></label>
          <label>${t.profile_password||'Password'}<input id="s_password" type="password" value=""></label>
          <div class="settings-actions"><button class="btn accent-btn" id="saveProfile">${t.save_changes||'Save Changes'}</button></div>
        </div>
        <div>
          <p>${t.profile_name||''}</p>
        </div>
      </div>
    `;
    document.getElementById('saveProfile').addEventListener('click', ()=>{
      const newUser = { name: document.getElementById('s_name').value, email: document.getElementById('s_email').value, phone: document.getElementById('s_phone').value };
      localStorage.setItem('site_user', JSON.stringify(newUser));
      alert((currentLang()==='ar')? 'تم الحفظ' : 'Saved');
    });
  } else if(section === 'notifications'){
    const st = JSON.parse(localStorage.getItem('site_settings')||'{}');
    body.innerHTML = `
      <label><input type="checkbox" id="s_notif"> ${t.notifications_enable||'Enable Notifications'}</label>
      <div class="settings-actions"><button class="btn accent-btn" id="saveNotifs">${t.save_changes||'Save Changes'}</button></div>
    `;
    document.getElementById('s_notif').checked = !!st.notifications;
    document.getElementById('saveNotifs').addEventListener('click', ()=>{ const s = JSON.parse(localStorage.getItem('site_settings')||'{}'); s.notifications = document.getElementById('s_notif').checked; localStorage.setItem('site_settings', JSON.stringify(s)); alert((currentLang()==='ar')? 'تم الحفظ' : 'Saved'); });
  } else if(section === 'design'){
    const theme = localStorage.getItem('site_theme') || 'day';
    body.innerHTML = `
      <div style="display:flex;gap:8px">
        <button class="btn accent-btn" id="setDay">${t.theme_day||'Day Mode'}</button>
        <button class="btn accent-btn" id="setNight">${t.theme_night||'Night Mode'}</button>
      </div>
    `;
    document.getElementById('setDay').addEventListener('click', ()=> setTheme('day'));
    document.getElementById('setNight').addEventListener('click', ()=> setTheme('night'));
  } else if(section === 'advanced'){
    body.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:8px">
        <button class="btn accent-btn" onclick="alert('Manage donors - not implemented')">${t.advanced_manage_donors||'Manage Donors'}</button>
        <button class="btn accent-btn" onclick="exportData()">${t.advanced_export||'Export Reports'}</button>
      </div>
    `;
  }
}

function setTheme(mode){
  if(mode==='night'){ document.documentElement.classList.add('theme-night'); localStorage.setItem('site_theme','night'); }
  else { document.documentElement.classList.remove('theme-night'); localStorage.setItem('site_theme','day'); }
}


// ensure navbar renders on load and language changes
document.addEventListener('DOMContentLoaded', ()=>{
  // set document direction based on language
  const lang = getSiteLang();
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  renderNavbar();
  // bind lang buttons and import/export handlers
  const bAr = document.getElementById('langAr');
  const bEn = document.getElementById('langEn');
  if(bAr) bAr.addEventListener('click', ()=> setSiteLang('ar'));
  if(bEn) bEn.addEventListener('click', ()=> setSiteLang('en'));
  const ex = document.getElementById('exportBtn');
  if(ex) ex.addEventListener('click', (e)=>{ e.preventDefault(); exportData(); });
  const imbtn = document.getElementById('importBtn');
  const imfile = document.getElementById('importFile');
  if(imbtn && imfile){ imbtn.addEventListener('click',(e)=>{ e.preventDefault(); imfile.click(); }); imfile.addEventListener('change', (ev)=>{ const f = ev.target.files && ev.target.files[0]; if(f) importFileJSON(f); }); }
  
  // If we're on add.html and there's an id param, load the record for editing
  const form = document.getElementById('orphanForm');
  if(form){
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if(id){
      const rec = getOrphans().find(x=>x.id===id);
      if(rec){
        // populate fields
        try{ document.getElementById('recordId').value = rec.id; }catch(e){}
        if(document.getElementById('childName')) document.getElementById('childName').value = rec.name || '';
        if(document.getElementById('birthday')) document.getElementById('birthday').value = rec.birthday || '';
        if(document.getElementById('childPhone')) document.getElementById('childPhone').value = rec.phone || '';
        if(document.getElementById('guardianName')) document.getElementById('guardianName').value = rec.guardian || '';
        if(document.getElementById('childId')) document.getElementById('childId').value = rec.childId || '';
        if(document.getElementById('location')) document.getElementById('location').value = rec.location || '';
        if(document.getElementById('donorName')) document.getElementById('donorName').value = rec.donor || '';
        if(document.getElementById('donorPhone')) document.getElementById('donorPhone').value = rec.donorPhone || '';
        if(document.getElementById('donorAddress')) document.getElementById('donorAddress').value = rec.donorAddress || '';
        // preview image
        const preview = document.getElementById('previewImg');
        if(preview) preview.src = rec.image || 'assets/default-profile.svg';
        // show edit/delete buttons if present
        const editBtn = document.getElementById('editBtn');
        const deleteBtn = document.getElementById('deleteBtn');
        if(editBtn) editBtn.style.display = 'inline-block';
        if(deleteBtn) deleteBtn.style.display = 'inline-block';
        // enable save so user can submit changes
        const saveBtn = document.getElementById('saveBtn');
        if(saveBtn){ saveBtn.disabled = false; saveBtn.classList.add('enabled'); }
      }
      // support opening add.html?preSponsorId=<id> to pre-select an existing sponsor
      const preSponsor = params.get('preSponsorId');
      if(preSponsor){ const sel = document.getElementById('existingSponsor'); if(sel){ sel.value = preSponsor; sel.dispatchEvent(new Event('change')); } }
    }
  }
});

/* Export / Import helpers */
function exportData(){
  const all = getOrphans();
  const data = JSON.stringify(all, null, 2);
  const blob = new Blob([data], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'orphans_export_' + (new Date().toISOString().slice(0,10)) + '.json';
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

function importFileJSON(file){
  const reader = new FileReader();
  reader.onload = ()=>{
    try{
      const parsed = JSON.parse(reader.result);
      if(!Array.isArray(parsed)) throw new Error('Invalid format');
      const existing = getOrphans();
      // merge by id (avoid duplicates)
      const map = {};
      existing.forEach(x=>map[x.id]=x);
      parsed.forEach(x=>{ if(x && x.id) map[x.id]=x; else if(x){ x.id = uid(); map[x.id]=x; } });
      const merged = Object.values(map).sort((a,b)=> (b.createdAt||'') > (a.createdAt||'') ? 1 : -1);
      saveOrphans(merged);
      renderOrphansList();
      alert((getSiteLang()==='ar')? (window.TRANSLATIONS.ar.import_success) : (window.TRANSLATIONS.en.import_success));
    }catch(err){ alert((getSiteLang()==='ar')? window.TRANSLATIONS.ar.import_error : window.TRANSLATIONS.en.import_error); }
  };
  reader.onerror = ()=> alert((getSiteLang()==='ar')? window.TRANSLATIONS.ar.import_error : window.TRANSLATIONS.en.import_error);
  reader.readAsText(file);
}

/* Autosave draft for add form */
function initDraftAutosave(){
  const form = document.getElementById('orphanForm');
  if(!form) return;
  const DKEY = 'orphan_draft_v1';
  // load existing draft
  try{
    const raw = localStorage.getItem(DKEY);
    if(raw){ const draft = JSON.parse(raw); Object.keys(draft).forEach(k=>{ const el = document.getElementById(k); if(el) el.value = draft[k]; }); }
  }catch(e){}

  let timeout = null;
  function saveDraft(){
    const fields = ['childName','guardianName','birthday','childId','childPhone','location','donorName','donorPhone','donorAddress'];
    const data = {};
    fields.forEach(id=>{ const el = document.getElementById(id); if(el) data[id]=el.value; });
    localStorage.setItem(DKEY, JSON.stringify(data));
  }
  form.addEventListener('input', ()=>{ if(timeout) clearTimeout(timeout); timeout = setTimeout(saveDraft, 700); });
  // clear draft on successful save (hooked into submit flow already)
  form.addEventListener('reset', ()=> localStorage.removeItem(DKEY));
  // clear after saving redirect handled in submit, but also provide function
  window.clearOrphanDraft = ()=> localStorage.removeItem(DKEY);
}

// call autosave init when DOM loaded
document.addEventListener('DOMContentLoaded', ()=>{ initDraftAutosave(); });


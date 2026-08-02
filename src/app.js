const projectOrder = ['rfq', 'rag', 'fridge', 'agent', 'music'];
const approachOrder = ['evidence', 'human', 'boundaries', 'delivery'];
const supportedLanguages = ['es', 'en', 'de'];
const siteBase = new URL('./', import.meta.url);
const page = document.body.dataset.page || 'home';

const projectMeta = {
  rfq: {
    image: 'rfq.png', workflow: 'rfq-workflow.png', n8n: 'n8n-rfq.jpg', index: '01', short: 'RFQ',
    demo: 'https://hugomenz.github.io/rfq-intelligence-live/', repo: 'https://github.com/hugomenz/rfq-intelligence-live',
    platforms: ['custom', 'n8n', 'github'],
  },
  rag: {
    image: 'rag-security.png', workflow: 'rag-workflow.png', n8n: 'n8n-rag.jpg', index: '02', short: 'RAG',
    demo: 'https://hugomenz.github.io/second-brain/', repo: 'https://github.com/hugomenz/second-brain',
    platforms: ['custom', 'n8n', 'supabase', 'obsidian', 'github'],
  },
  fridge: {
    image: 'fridgeflow.png', workflow: 'fridge-workflow.png', n8n: 'n8n-fridge.jpg', index: '03', short: 'FRIDGE',
    demo: 'https://hugomenz.github.io/fridge-flow/', repo: 'https://github.com/hugomenz/fridge-flow',
    platforms: ['custom', 'n8n', 'telegram', 'supabase'],
  },
  agent: {
    image: 'agent-observatory.png', workflow: 'agent-workflow.png', n8n: 'n8n-agent.jpg', index: '04', short: 'AGENTS',
    demo: 'https://hugomenz.github.io/agent-chaos-lab/exp-app/', secondaryDemo: 'https://hugomenz.github.io/agent-chaos-lab/logger/',
    imageLink: 'https://hugomenz.github.io/agent-chaos-lab/logger/', repo: 'https://github.com/hugomenz/agent-chaos-lab',
    platforms: ['custom', 'n8n', 'supabase', 'github'],
  },
  music: {
    image: 'music-school.png', workflow: 'music-workflow.png', n8n: null, index: '05', short: 'MUSIC',
    demo: 'https://hugomenz.github.io/music-school-automation/', repo: 'https://github.com/hugomenz/music-school-automation',
    platforms: ['custom', 'n8n', 'telegram'], extensionPlatform: 'twilio',
  },
};

const platformMeta = {
  custom: { mark: 'HM', label: 'custom' },
  n8n: { icon: 'https://cdn.simpleicons.org/n8n/EA4B71', label: 'n8n' },
  telegram: { icon: 'https://cdn.simpleicons.org/telegram/26A5E4', label: 'telegram' },
  supabase: { icon: 'https://cdn.simpleicons.org/supabase/3FCF8E', label: 'supabase' },
  obsidian: { icon: 'https://cdn.simpleicons.org/obsidian/7C3AED', label: 'obsidian' },
  github: { icon: 'https://cdn.simpleicons.org/github/FFFFFF', label: 'github' },
  twilio: { icon: 'https://cdn.simpleicons.org/twilio/F22F46', label: 'twilio' },
};

let messages = null;
let currentSlide = 0;
let sectionObserver = null;
let sectionScrollHandler = null;
let isInitialRender = true;

function getPath(object, path) {
  return path.split('.').reduce((value, key) => value?.[key], object);
}

function assetUrl(file) {
  return new URL(`assets/${file}`, siteBase).href;
}

function routeUrl(route, language, hash = '') {
  const url = new URL(route === 'home' ? './' : `${route}/`, siteBase);
  url.searchParams.set('lang', language);
  if (hash) url.hash = hash;
  return url.href;
}

function languageFromUrl() {
  return new URL(window.location.href).searchParams.get('lang');
}

function syncLanguageUrl(language) {
  const url = new URL(window.location.href);
  url.searchParams.set('lang', language);
  window.history.replaceState({}, '', url);
}

function applyStaticTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const value = getPath(messages, element.dataset.i18n);
    if (typeof value === 'string') element.textContent = value;
  });
}

function updateRouteLinks(language) {
  document.querySelectorAll('[data-route]').forEach((link) => {
    link.href = routeUrl(link.dataset.route, language, link.dataset.hash || '');
  });
}

function renderPlatforms(keys) {
  return `<ul class="platform-list">${keys.map((key) => {
    const platform = platformMeta[key];
    const label = messages.platforms[platform.label];
    const visual = platform.icon
      ? `<img src="${platform.icon}" alt="" loading="lazy" />`
      : `<span class="platform-mark" aria-hidden="true">${platform.mark}</span>`;
    return `<li>${visual}<span>${label}</span></li>`;
  }).join('')}</ul>`;
}

function updateHeroSlide(position) {
  currentSlide = (position + projectOrder.length) % projectOrder.length;
  const key = projectOrder[currentSlide];
  const project = messages.projects[key];
  const meta = projectMeta[key];
  const frame = document.querySelector('#hero-frame');
  if (!frame) return;

  frame.href = meta.imageLink || meta.demo;
  frame.setAttribute('aria-label', `${messages.actions.openDemo}: ${project.name}`);
  document.querySelector('#hero-frame-index').textContent = `${messages.hero.frame} ${meta.index} · ${project.role}`;
  document.querySelector('#hero-image').src = assetUrl(meta.image);
  document.querySelector('#hero-image').alt = project.imageAlt;
  document.querySelector('#hero-project-name').textContent = project.name;

  const open = document.querySelector('#hero-open');
  open.href = meta.demo;
  open.textContent = `${messages.hero.openCase} ${project.name}`;
  const view = document.querySelector('#hero-view');
  view.href = `#project-${key}`;
  view.textContent = messages.hero.viewCase;

  document.querySelectorAll('[data-slide]').forEach((button, index) => {
    const selected = index === currentSlide;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-current', selected ? 'true' : 'false');
  });
}

function renderHero() {
  const dots = document.querySelector('#hero-dots');
  if (!dots) return;
  dots.innerHTML = projectOrder.map((key, index) => {
    const project = messages.projects[key];
    return `<button type="button" data-slide="${index}" aria-label="${project.name}">${projectMeta[key].index}</button>`;
  }).join('');
  dots.querySelectorAll('[data-slide]').forEach((button) => {
    button.addEventListener('click', () => updateHeroSlide(Number(button.dataset.slide)));
  });
  const previous = document.querySelector('#hero-prev');
  const next = document.querySelector('#hero-next');
  previous.setAttribute('aria-label', messages.hero.previous);
  next.setAttribute('aria-label', messages.hero.next);
  previous.onclick = () => updateHeroSlide(currentSlide - 1);
  next.onclick = () => updateHeroSlide(currentSlide + 1);
  updateHeroSlide(currentSlide);
}

function renderProjects() {
  const container = document.querySelector('#projects');
  const index = document.querySelector('#work');
  if (!container || !index) return;

  index.innerHTML = projectOrder.map((key) => {
    const meta = projectMeta[key];
    return `<a href="#project-${key}"><span>${meta.index}</span>${messages.projects[key].name}</a>`;
  }).join('');

  container.innerHTML = projectOrder.map((key) => {
    const project = messages.projects[key];
    const meta = projectMeta[key];
    return `<article id="project-${key}" class="project ${key === 'rfq' ? 'principal' : ''}" data-scroll-section data-nav-label="${project.name}">
      <header class="project-heading">
        <div class="project-number">${meta.index}</div>
        <div><p class="eyebrow">${project.role}</p><h2>${project.name}</h2><p class="summary">${project.summary}</p></div>
      </header>
      <div class="project-visuals">
        <a class="project-image" href="${meta.imageLink || meta.demo}" aria-label="${messages.actions.openDemo}: ${project.name}">
          <span>${messages.hero.frame} ${meta.index} · ${project.visualLabel}</span><img src="${assetUrl(meta.image)}" alt="${project.imageAlt}" loading="lazy" />
        </a>
        <button class="workflow-image workflow-zoom" type="button" data-open-dialog="${key}" data-dialog-kind="diagram" aria-label="${messages.workflow.zoom}: ${project.name}">
          <span>${messages.workflow.label} · ${messages.workflow.zoom}</span><img src="${assetUrl(meta.workflow)}" alt="${messages.workflow.diagramAlt}: ${project.name}" loading="lazy" />
        </button>
      </div>
      <div class="project-content-grid">
        <div class="project-copy">
          <dl>
            <div><dt>${messages.labels.problem}</dt><dd>${project.problem}</dd></div>
            <div><dt>${messages.labels.solution}</dt><dd>${project.solution}</dd></div>
            <div><dt>${messages.labels.how}</dt><dd>${project.how}</dd></div>
          </dl>
          <div class="demo-note"><p class="eyebrow">${messages.labels.try}</p><p>${project.try}</p></div>
        </div>
        <aside class="project-details">
          <div class="flow-card"><p class="eyebrow">${messages.labels.flow}</p><ol>${project.flow.map((item) => `<li>${item}</li>`).join('')}</ol></div>
          <div class="scope-note"><p class="eyebrow">${messages.labels.scope}</p><p>${project.scope}</p></div>
          <div class="platforms"><p class="eyebrow">${messages.labels.platforms}</p>${renderPlatforms(meta.platforms)}</div>
          ${project.extension ? `<div class="project-extension"><div>${renderPlatforms([meta.extensionPlatform])}</div><p><b>${messages.labels.extension}</b> ${project.extension}</p></div>` : ''}
          <div class="project-actions"><a class="primary" href="${meta.demo}">${messages.actions.openDemo}</a>${meta.secondaryDemo ? `<a href="${meta.secondaryDemo}">${messages.actions.openObservatory}</a>` : ''}<a href="${routeUrl('workflows', document.documentElement.lang, `workflow-${key}`)}">${messages.actions.viewWorkflow}</a><a href="${meta.repo}">${messages.actions.openRepo}</a></div>
        </aside>
      </div>
    </article>`;
  }).join('');
}

function renderWorkflowCases() {
  const container = document.querySelector('#workflow-cases');
  if (!container) return;
  container.innerHTML = projectOrder.map((key) => {
    const data = messages.workflowPage.cases[key];
    const project = messages.projects[key];
    const meta = projectMeta[key];
    const visual = meta.n8n || meta.workflow;
    const visualLabel = meta.n8n ? messages.workflowPage.labels.editor : messages.workflowPage.labels.diagram;
    return `<article id="workflow-${key}" class="workflow-case" data-scroll-section data-nav-label="${project.name}">
      <header class="workflow-case-head"><p class="eyebrow">${meta.index} · ${project.name}</p><h2>${data.title}</h2><p>${data.summary}</p></header>
      <button class="workflow-screenshot" type="button" data-open-dialog="${key}" data-dialog-kind="workflow" aria-label="${messages.workflow.zoom}: ${data.title}">
        <span>${visualLabel} · ${messages.workflow.zoom}</span><img src="${assetUrl(visual)}" alt="${data.imageAlt}" loading="lazy" />
      </button>
      <div class="workflow-explanation">
        <div>
          <dl>
            <div><dt>${messages.workflowPage.labels.why}</dt><dd>${data.why}</dd></div>
            <div><dt>${messages.workflowPage.labels.purpose}</dt><dd>${data.purpose}</dd></div>
            <div><dt>${messages.workflowPage.labels.how}</dt><dd>${data.how}</dd></div>
          </dl>
        </div>
        <aside class="workflow-details">
          <div class="workflow-set"><p class="eyebrow">${messages.workflowPage.labels.set}</p><ul>${data.set.map((item) => `<li>${item}</li>`).join('')}</ul></div>
          <p class="workflow-state"><b>${messages.workflowPage.labels.state}</b> ${data.state}</p>
          <div class="platforms"><p class="eyebrow">${messages.labels.platforms}</p>${renderPlatforms(meta.platforms)}</div>
          <div class="project-actions"><a class="primary" href="${meta.demo}">${messages.actions.openDemo}</a>${meta.secondaryDemo ? `<a href="${meta.secondaryDemo}">${messages.actions.openObservatory}</a>` : ''}<a href="${meta.repo}">${messages.actions.openRepo}</a></div>
        </aside>
      </div>
    </article>`;
  }).join('');
}

function renderApproach() {
  const container = document.querySelector('#approach-sections');
  if (!container) return;
  container.innerHTML = approachOrder.map((key, index) => {
    const section = messages.approachPage.sections[key];
    return `<article id="approach-${key}" class="approach-section" data-scroll-section data-nav-label="${section.title}">
      <div class="approach-number">0${index + 1}</div>
      <div><h2>${section.title}</h2><p class="summary">${section.copy}</p></div>
      <div class="approach-detail"><p>${section.detail}</p><strong>${section.result}</strong></div>
    </article>`;
  }).join('');
}

function openWorkflowDialog(key, kind) {
  const dialog = document.querySelector('#workflow-dialog');
  if (!dialog) return;
  const meta = projectMeta[key];
  const project = messages.projects[key];
  const isWorkflowPage = kind === 'workflow';
  const caseData = messages.workflowPage.cases[key];
  const image = isWorkflowPage ? (meta.n8n || meta.workflow) : meta.workflow;
  const title = isWorkflowPage ? caseData.title : project.name;
  const copy = isWorkflowPage ? caseData.summary : messages.workflow.dialogCopy;
  const link = document.querySelector('#workflow-dialog-link');

  document.querySelector('#workflow-dialog-title').textContent = title;
  document.querySelector('#workflow-dialog-image').src = assetUrl(image);
  document.querySelector('#workflow-dialog-image').alt = isWorkflowPage ? caseData.imageAlt : `${messages.workflow.diagramAlt}: ${project.name}`;
  document.querySelector('#workflow-dialog-copy').textContent = copy;
  link.href = isWorkflowPage ? meta.demo : routeUrl('workflows', document.documentElement.lang, `workflow-${key}`);
  link.textContent = isWorkflowPage ? messages.actions.openDemo : messages.workflow.viewPage;
  dialog.showModal();
  document.body.classList.add('dialog-open');
}

function closeWorkflowDialog() {
  const dialog = document.querySelector('#workflow-dialog');
  if (dialog?.open) dialog.close();
  document.body.classList.remove('dialog-open');
}

function renderSectionNavigation() {
  const host = document.querySelector('#section-navigation');
  if (!host) return;
  sectionObserver?.disconnect();
  if (sectionScrollHandler) window.removeEventListener('scroll', sectionScrollHandler);
  const sections = [...document.querySelectorAll('[data-scroll-section]')];
  if (sections.length < 2) return;

  host.innerHTML = `<nav class="section-index" aria-label="${messages.scrollNav.label}">
    ${sections.map((section, index) => `<a class="section-index-link" href="#${section.id}" data-section-link="${section.id}"><span class="section-index-line"></span><span class="section-index-number">${String(index + 1).padStart(2, '0')}</span><span class="section-index-label">${section.dataset.navLabel}</span></a>`).join('')}
  </nav>
  <label class="section-jump"><span>${messages.scrollNav.section}</span><select aria-label="${messages.scrollNav.jump}">${sections.map((section) => `<option value="#${section.id}">${section.dataset.navLabel}</option>`).join('')}</select></label>`;

  const sideNav = host.querySelector('.section-index');
  const jump = host.querySelector('.section-jump');
  const select = jump.querySelector('select');
  const setActive = (id) => {
    host.querySelectorAll('[data-section-link]').forEach((link) => {
      const active = link.dataset.sectionLink === id;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
    select.value = `#${id}`;
  };
  setActive(sections[0].id);

  sectionScrollHandler = () => {
    const visible = window.scrollY > 220;
    sideNav.classList.toggle('is-visible', visible);
    jump.classList.toggle('is-visible', visible);
  };
  sectionScrollHandler();
  window.addEventListener('scroll', sectionScrollHandler, { passive: true });

  select.addEventListener('change', () => {
    const target = document.querySelector(select.value);
    target?.scrollIntoView({ behavior: 'smooth' });
    window.history.replaceState({}, '', select.value);
  });

  if ('IntersectionObserver' in window) {
    sectionObserver = new IntersectionObserver((entries) => {
      const active = entries.filter((entry) => entry.isIntersecting).sort((left, right) => Math.abs(left.boundingClientRect.top) - Math.abs(right.boundingClientRect.top))[0];
      if (active) setActive(active.target.id);
    }, { rootMargin: '-18% 0px -68% 0px', threshold: [0, 0.25, 0.6] });
    sections.forEach((section) => sectionObserver.observe(section));
  }
}

function renderPage() {
  if (page === 'home') {
    renderHero();
    renderProjects();
  } else if (page === 'workflows') {
    renderWorkflowCases();
  } else if (page === 'approach') {
    renderApproach();
  }
  renderSectionNavigation();
  if (isInitialRender && window.location.hash) {
    requestAnimationFrame(() => document.querySelector(window.location.hash)?.scrollIntoView());
  }
  isInitialRender = false;
}

async function setLanguage(language, { syncUrl = true } = {}) {
  const response = await fetch(new URL(`i18n/${language}.json`, siteBase));
  if (!response.ok) throw new Error(`Translation failed: ${response.status}`);
  messages = await response.json();
  document.documentElement.lang = language;
  document.title = messages.meta.pages[page].title;
  document.querySelector('meta[name="description"]').content = messages.meta.pages[page].description;
  document.querySelector('#language-selector').value = language;
  localStorage.setItem('portfolio-language', language);
  if (syncUrl) syncLanguageUrl(language);
  applyStaticTranslations();
  updateRouteLinks(language);
  renderPage();
}

document.querySelector('#language-selector').addEventListener('change', (event) => setLanguage(event.target.value));
document.addEventListener('click', (event) => {
  const opener = event.target.closest('[data-open-dialog]');
  if (opener) openWorkflowDialog(opener.dataset.openDialog, opener.dataset.dialogKind);
  if (event.target.closest('[data-dialog-close]')) closeWorkflowDialog();
});
document.querySelector('#workflow-dialog')?.addEventListener('click', (event) => {
  if (event.target === event.currentTarget) closeWorkflowDialog();
});
document.querySelector('#workflow-dialog')?.addEventListener('close', () => document.body.classList.remove('dialog-open'));
window.addEventListener('popstate', () => {
  const language = languageFromUrl();
  if (supportedLanguages.includes(language) && language !== document.documentElement.lang) void setLanguage(language, { syncUrl: false });
});

const preferred = languageFromUrl() || localStorage.getItem('portfolio-language') || (navigator.language.startsWith('de') ? 'de' : navigator.language.startsWith('en') ? 'en' : 'es');
void setLanguage(supportedLanguages.includes(preferred) ? preferred : 'es');

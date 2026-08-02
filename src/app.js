const projectOrder = ['rfq', 'rag', 'fridge', 'agent', 'music'];
const projectMeta = {
  rfq: { image: 'rfq.png', demo: 'https://hugomenz.github.io/rfq-intelligence-live/', repo: 'https://github.com/hugomenz/rfq-intelligence-live', index: '01' },
  rag: { image: 'rag-security.png', demo: 'https://hugomenz.github.io/second-brain/', repo: 'https://github.com/hugomenz/second-brain', index: '02' },
  fridge: { image: 'fridgeflow.png', demo: 'https://hugomenz.github.io/fridge-flow/', repo: 'https://github.com/hugomenz/fridge-flow', index: '03' },
  agent: { image: 'agent-observatory.png', demo: 'https://hugomenz.github.io/agent-chaos-lab/logger/', repo: 'https://github.com/hugomenz/agent-chaos-lab', index: '04' },
  music: { image: 'music-school.png', demo: 'https://hugomenz.github.io/music-school-automation/', repo: 'https://github.com/hugomenz/music-school-automation', index: '05' },
};

let messages = null;

function getPath(object, path) { return path.split('.').reduce((value, key) => value?.[key], object); }

function applyStaticTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const value = getPath(messages, element.dataset.i18n);
    if (typeof value === 'string') element.textContent = value;
  });
}

function statusRow(label, value, type) {
  return `<div class="truth-row"><span><i class="${type}"></i>${label}</span><p>${value}</p></div>`;
}

function renderProjects() {
  document.querySelector('#projects').innerHTML = projectOrder.map((key, position) => {
    const project = messages.projects[key];
    const meta = projectMeta[key];
    return `<article class="project ${key === 'rfq' ? 'principal' : ''}">
      <a class="project-image" href="${meta.demo}" aria-label="${messages.actions.openDemo}: ${project.name}">
        <span>FRAME ${meta.index} · ${project.role}</span><img src="./assets/${meta.image}" alt="${project.imageAlt}" loading="eager" />
      </a>
      <div class="project-copy">
        <div class="project-number">${meta.index}</div><h2>${project.name}</h2><p class="summary">${project.summary}</p>
        <dl><div><dt>${messages.labels.problem}</dt><dd>${project.problem}</dd></div><div><dt>${messages.labels.solution}</dt><dd>${project.solution}</dd></div><div><dt>${messages.labels.how}</dt><dd>${project.how}</dd></div></dl>
        <div class="truth-table">
          ${statusRow(messages.status.working, project.working, 'working')}
          ${statusRow(messages.status.simulated, project.simulated, 'simulated')}
          ${statusRow(messages.status.experimental, project.experimental, 'experimental')}
        </div>
        <p class="tech"><b>${messages.labels.technology}</b> ${project.tech}</p>
        <div class="project-actions"><a class="primary" href="${meta.demo}">${messages.actions.openDemo}</a><a href="${meta.repo}">${messages.actions.openRepo}</a></div>
      </div>
    </article>`;
  }).join('');
}

async function setLanguage(language) {
  const response = await fetch(`./i18n/${language}.json`);
  if (!response.ok) throw new Error(`Translation failed: ${response.status}`);
  messages = await response.json();
  document.documentElement.lang = language;
  document.title = messages.meta.title;
  document.querySelector('meta[name="description"]').content = messages.meta.description;
  document.querySelector('#language-selector').value = language;
  localStorage.setItem('portfolio-language', language);
  applyStaticTranslations(); renderProjects();
}

document.querySelector('#language-selector').addEventListener('change', (event) => setLanguage(event.target.value));
const preferred = localStorage.getItem('portfolio-language') || (navigator.language.startsWith('de') ? 'de' : navigator.language.startsWith('en') ? 'en' : 'es');
setLanguage(['es', 'en', 'de'].includes(preferred) ? preferred : 'es');

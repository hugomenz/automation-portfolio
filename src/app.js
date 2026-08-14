import { polishedWorkflows, workflows } from './data/catalog.js';

function basePath() {
  return window.location.pathname.startsWith('/automation-portfolio') ? '/automation-portfolio' : '';
}

function workflowUrl(workflow) {
  return `${basePath()}/lab/${workflow.slug}/`;
}

const previewPath = (workflow) => `${basePath()}/assets/evidence/${workflow.controlTower.sourceAsset}`;

document.querySelector('#featured-list').innerHTML = polishedWorkflows.map((workflow, index) => `
  <article class="tower-card tower-${workflow.code.toLowerCase()}">
    <a href="${workflowUrl(workflow)}" class="tower-preview" aria-label="${workflow.title} öffnen">
      <img src="${previewPath(workflow)}" alt="Synthetischer Beleg für ${workflow.title}" loading="${index ? 'lazy' : 'eager'}" />
      <span class="tower-number">0${index + 1}</span>
      <span class="tower-state">${index === 1 ? 'Triage vorbereitet' : 'Prüfung erforderlich'}</span>
    </a>
    <div class="tower-content">
      <p>${workflow.eyebrow}</p>
      <h3>${workflow.controlTower.name}</h3>
      <span>${workflow.controlTower.proposition}</span>
      <div class="tower-tech"><b>Groq</b><b>Supabase</b><b>${workflow.controlTower.departments.length} Rollen</b><b>Human gate</b></div>
      <a class="tower-link" href="${workflowUrl(workflow)}">Interaktive Demo <span>→</span></a>
    </div>
  </article>
`).join('');

document.querySelector('#workflow-index').innerHTML = workflows.map((workflow) => `
  <a class="workflow-card ${workflow.polished ? 'flagship' : ''}" href="${workflowUrl(workflow)}">
    <span class="workflow-code">${workflow.number} / ${workflow.code}</span>
    <strong>${workflow.title}</strong>
    <small>${workflow.buyer}</small>
    <div><span>${workflow.polished ? 'Control Tower' : 'Prototype'}</span><b>→</b></div>
  </a>
`).join('');

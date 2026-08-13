import { polishedWorkflows, totalScore, workflows } from './data/catalog.js';

function basePath() {
  return window.location.pathname.startsWith('/automation-portfolio') ? '/automation-portfolio' : '';
}

function workflowUrl(workflow) {
  return `${basePath()}/lab/${workflow.slug}/`;
}

function scoreDots(score) {
  return `<span class="score-dots" aria-label="${score} von 5">${Array.from({ length: 5 }, (_, index) => `<i class="${index < score ? 'on' : ''}"></i>`).join('')}</span>`;
}

function renderFeatured() {
  document.querySelector('#featured-list').innerHTML = polishedWorkflows.map((workflow, index) => `
    <article class="featured-case">
      <div class="case-index"><span>0${index + 1}</span><i></i></div>
      <div class="case-main">
        <p class="case-eyebrow">${workflow.eyebrow}</p>
        <h3>${workflow.title}</h3>
        <p>${workflow.problem}</p>
      </div>
      <div class="case-outcome"><span>Verbesserung</span><p>${workflow.improvement}</p></div>
      <a class="case-link" href="${workflowUrl(workflow)}"><span>Demo öffnen</span><b aria-hidden="true">↗</b></a>
    </article>`).join('');
}

function renderIndex() {
  document.querySelector('#workflow-index').innerHTML = workflows.map((workflow) => `
    <a class="workflow-row" href="${workflowUrl(workflow)}">
      <span class="row-number">${workflow.number}</span>
      <span class="row-title"><strong>${workflow.title}</strong><small>${workflow.buyer}</small></span>
      <span class="row-improvement">${workflow.improvement}</span>
      <span class="row-status"><i class="${workflow.polished ? 'polished' : ''}"></i>${workflow.polished ? 'Interaktive Demo' : 'Funktionaler Prototyp'}</span>
      <span class="row-arrow" aria-hidden="true">↗</span>
    </a>`).join('');
}

function renderMatrix() {
  const ranked = [...workflows].sort((a, b) => totalScore(b) - totalScore(a));
  document.querySelector('#matrix-summary').innerHTML = ranked.slice(0, 3).map((workflow, index) => `<div><span>Rang ${index + 1}</span><strong>${workflow.englishTitle}</strong><p>${workflow.assessment}</p></div>`).join('');
  document.querySelector('#matrix-body').innerHTML = ranked.map((workflow) => `
    <tr>
      <th><a href="${workflowUrl(workflow)}">${workflow.title}</a></th>
      <td>${workflow.buyer}</td>
      <td>${scoreDots(workflow.scores.frequency)}</td>
      <td>${scoreDots(workflow.scores.impact)}</td>
      <td>${scoreDots(workflow.scores.data)}</td>
      <td>${scoreDots(workflow.scores.feasibility)}</td>
      <td>${scoreDots(workflow.scores.explain)}</td>
      <td>${scoreDots(workflow.scores.sell)}</td>
      <td><strong>${totalScore(workflow)} / 50</strong></td>
      <td><span class="zero-badge">0 Belege</span></td>
      <td><span class="zero-badge">Nein</span></td>
    </tr>`).join('');
}

renderFeatured();
renderIndex();
renderMatrix();

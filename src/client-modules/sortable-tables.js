/**
 * sortable-tables.js — Docusaurus client module
 * Rend chaque table Markdown triable par colonne et filtrable par texte.
 * Activé automatiquement sur toutes les pages après chaque navigation SPA.
 */

function parseNum(str) {
  // retire séparateurs de milliers et symboles, renvoie float ou NaN
  const cleaned = String(str).replace(/[,\s]/g, '').replace(/[^0-9.\-]/g, '');
  const n = parseFloat(cleaned);
  return cleaned === '' ? NaN : n;
}

function cellText(td) {
  // Inclut le texte alt des images pour la recherche
  let text = '';
  td.querySelectorAll('img').forEach((img) => {
    text += ' ' + (img.alt || '');
  });
  text += ' ' + (td.innerText || td.textContent || '');
  return text.trim().toLowerCase();
}

function sortTable(table, colIdx, ascending) {
  const tbody = table.tBodies[0];
  if (!tbody) return;
  const rows = Array.from(tbody.rows);

  rows.sort((a, b) => {
    const ta = (a.cells[colIdx]?.innerText || '').trim();
    const tb = (b.cells[colIdx]?.innerText || '').trim();
    // "—" toujours en dernier
    if (ta === '—' && tb !== '—') return 1;
    if (tb === '—' && ta !== '—') return -1;

    const na = parseNum(ta);
    const nb = parseNum(tb);
    let cmp;
    if (!isNaN(na) && !isNaN(nb)) {
      cmp = na - nb;
    } else {
      cmp = ta.localeCompare(tb, undefined, { numeric: true, sensitivity: 'base' });
    }
    return ascending ? cmp : -cmp;
  });

  rows.forEach((r) => tbody.appendChild(r));
}

function initTable(table) {
  if (table.dataset.sortable) return; // déjà initialisé
  table.dataset.sortable = '1';

  const thead = table.tHead;
  if (!thead) return;
  const headerRow = thead.rows[0];
  if (!headerRow) return;

  const tbody = table.tBodies[0];
  if (!tbody) return;

  // ── Wrap table pour le layout (scroll horizontal + search bar au dessus) ──
  const wrapper = document.createElement('div');
  wrapper.className = 'sortable-table-wrapper';
  table.parentNode.insertBefore(wrapper, table);

  // ── Barre de recherche ──
  const searchBar = document.createElement('div');
  searchBar.className = 'sortable-search-bar';

  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.placeholder = '🔍 Filter…';
  searchInput.className = 'sortable-search-input';
  searchInput.setAttribute('aria-label', 'Filter table');

  const counter = document.createElement('span');
  counter.className = 'sortable-counter';

  searchBar.appendChild(searchInput);
  searchBar.appendChild(counter);
  wrapper.appendChild(searchBar);

  const scrollDiv = document.createElement('div');
  scrollDiv.className = 'sortable-table-scroll';
  scrollDiv.appendChild(table);
  wrapper.appendChild(scrollDiv);

  const allRows = Array.from(tbody.rows);
  const updateCounter = () => {
    const visible = allRows.filter((r) => r.style.display !== 'none').length;
    counter.textContent = visible === allRows.length
      ? `${allRows.length} rows`
      : `${visible} / ${allRows.length}`;
  };
  updateCounter();

  // ── Filtre texte ──
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase().trim();
    allRows.forEach((row) => {
      if (!q) {
        row.style.display = '';
        return;
      }
      const match = Array.from(row.cells).some((td) => cellText(td).includes(q));
      row.style.display = match ? '' : 'none';
    });
    updateCounter();
  });

  // ── Tri par colonne ──
  let sortState = { col: -1, asc: true };

  Array.from(headerRow.cells).forEach((th, i) => {
    th.style.cursor = 'pointer';
    th.setAttribute('title', 'Click to sort');
    th.classList.add('sortable-th');

    // indicateur visuel
    const indicator = document.createElement('span');
    indicator.className = 'sort-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    th.appendChild(indicator);

    th.addEventListener('click', () => {
      const asc = sortState.col === i ? !sortState.asc : true;
      sortState = { col: i, asc };

      // Reset tous les indicateurs
      Array.from(headerRow.cells).forEach((h) => {
        h.querySelector('.sort-indicator').textContent = '';
        h.setAttribute('aria-sort', 'none');
      });

      indicator.textContent = asc ? ' ▲' : ' ▼';
      th.setAttribute('aria-sort', asc ? 'ascending' : 'descending');
      sortTable(table, i, asc);
    });
  });
}

function initAllTables() {
  document.querySelectorAll('article table, .markdown table').forEach(initTable);
}

// ── Point d'entrée Docusaurus ──────────────────────────────────────────────
export function onRouteDidUpdate() {
  // Petit délai pour laisser le DOM se stabiliser après le rendu React
  setTimeout(initAllTables, 50);
}

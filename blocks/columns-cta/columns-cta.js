const OPTION_CLASSES = [];

// a paragraph, or a bare inline wrapper (<strong>/<em>) left unwrapped in the cell,
// whose only text is its link(s)
function isActionParagraph(el) {
  if (!['P', 'STRONG', 'EM', 'B', 'I'].includes(el.tagName)) return false;
  const links = el.querySelectorAll('a[href]');
  return links.length > 0 && el.textContent.trim() === [...links].map((a) => a.textContent.trim()).join('');
}

export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  block.dataset.options = active.join(' ');

  // flatten every row/cell into one text column and one actions column, so the layout holds
  // whether the author used [H2 | CTA], a single cell, or extra rows
  const text = document.createElement('div');
  text.className = 'columns-cta-text';
  const actions = document.createElement('div');
  actions.className = 'columns-cta-actions';

  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      [...cell.childNodes].forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          if (!node.textContent.trim()) return;
          const p = document.createElement('p');
          p.textContent = node.textContent.trim();
          text.append(p);
          return;
        }
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        if (node.tagName === 'A') {
          const p = document.createElement('p');
          p.append(node);
          actions.append(p);
        } else if (isActionParagraph(node)) {
          if (node.tagName === 'P') {
            actions.append(node);
          } else {
            const p = document.createElement('p');
            p.append(node);
            actions.append(p);
          }
        } else if (node.textContent.trim() || node.querySelector('picture, img')) {
          text.append(node);
        }
      });
    });
  });

  block.replaceChildren(...[text, actions].filter((el) => el.children.length));
  if (!actions.children.length) block.classList.add('columns-cta-no-actions');
}

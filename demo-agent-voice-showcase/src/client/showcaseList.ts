// rol: pinta las preguntas sugeridas del showcase como tarjetas tocables.
export interface ShowcaseItem { q: string; a: string }

export function renderShowcase(
  items: ShowcaseItem[],
  list: HTMLElement,
  counter: HTMLElement | null,
  onPick: (question: string) => void,
) {
  if (counter) counter.textContent = '(' + items.length + ')';

  for (const item of items) {
    const li = document.createElement('li');
    li.tabIndex = 0;
    li.setAttribute('role', 'button');

    const q = document.createElement('div');
    q.className = 'showcase__q';
    const arrow = document.createElement('span');
    arrow.className = 'arrow';
    arrow.textContent = '\u203A';
    const qText = document.createElement('span');
    qText.textContent = item.q;
    q.append(arrow, qText);

    const a = document.createElement('div');
    a.className = 'showcase__a';
    a.textContent = '\u2192 ' + item.a;

    li.append(q, a);
    li.addEventListener('click', () => onPick(item.q));
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(item.q); }
    });

    list.appendChild(li);
  }
}

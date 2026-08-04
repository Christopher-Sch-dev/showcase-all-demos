// crud.ts — UI wiring del CRUD. Importa la lógica de pacientes.ts (1+1 real).
import {
  seedPacientes, STORAGE_KEY,
  load as libLoad, save as libSave, uuid, escapeHtml,
  filterPacientes as libFilter, stats as libStats,
  upsertPaciente, deletePaciente, buildPaciente
} from '../lib/pacientes';

export function initCrud(): void {
  const modal = document.getElementById('edit-modal') as HTMLDialogElement;
  const form = document.getElementById('edit-form') as HTMLFormElement;
  const tbody = document.getElementById('pacientes-body') as HTMLElement;
  const emptyMsg = document.getElementById('empty-msg') as HTMLElement;
  const search = document.getElementById('search') as HTMLInputElement;
  const filterEstado = document.getElementById('filter-estado') as HTMLSelectElement;
  const newBtn = document.getElementById('new-btn') as HTMLElement;
  const cancelBtn = document.getElementById('cancel-btn') as HTMLElement;
  const resetBtn = document.getElementById('reset-btn') as HTMLElement;
  const titleEl = document.getElementById('modal-title') as HTMLElement;

  const load = () => libLoad(localStorage);
  const save = (list: Parameters<typeof libSave>[1]) => libSave(localStorage, list);

  function render() {
    const all = load();
    const filtered = libFilter(all, search.value, filterEstado.value);
    const s = libStats(all);

    document.getElementById('stat-total')!.textContent = String(s.total);
    document.getElementById('stat-active')!.textContent = String(s.activo);
    document.getElementById('stat-inactive')!.textContent = String(s.inactivo);
    document.getElementById('stat-pending')!.textContent = String(s.pendiente);

    if (filtered.length === 0) {
      tbody.innerHTML = '';
      emptyMsg.hidden = false;
      return;
    }
    emptyMsg.hidden = true;
    tbody.innerHTML = filtered
      .map((p) => `
        <tr data-id="${escapeHtml(p.id)}">
          <td><strong>${escapeHtml(p.nombre)}</strong></td>
          <td><code>${escapeHtml(p.rut)}</code></td>
          <td><a href="mailto:${escapeHtml(p.email)}">${escapeHtml(p.email)}</a></td>
          <td><a href="tel:${escapeHtml(p.telefono)}">${escapeHtml(p.telefono)}</a></td>
          <td>${escapeHtml(p.ultimaVisita)}</td>
          <td>${escapeHtml(p.tratamiento)}</td>
          <td><span class="badge badge--${escapeHtml(p.estado)}">${escapeHtml(p.estado)}</span></td>
          <td class="crud__actions">
            <button data-action="edit" data-id="${escapeHtml(p.id)}" class="btn-icon" aria-label="Editar">✎</button>
            <button data-action="delete" data-id="${escapeHtml(p.id)}" class="btn-icon btn-icon--danger" aria-label="Eliminar">×</button>
          </td>
        </tr>`)
      .join('');
  }

  function openModal(p?: (typeof seedPacientes)[number] | null) {
    titleEl.textContent = p ? 'Editar paciente' : 'Nuevo paciente';
    form.reset();
    document.getElementById('f-id')!.value = p?.id ?? '';
    if (p) {
      for (const k of ['nombre','rut','email','telefono','tratamiento','estado']) {
        const el = document.getElementById('f-' + k) as HTMLInputElement | null;
        if (el && (p as Record<string, string>)[k] != null) el.value = (p as Record<string, string>)[k];
      }
    } else {
      const fUltima = document.getElementById('f-ultima') as HTMLInputElement | null;
      if (p && p.ultimaVisita) fUltima.value = p.ultimaVisita;
      else if (!p) fUltima.value = new Date().toISOString().slice(0, 10);
    }
    modal.showModal();
  }

  function closeModal() { modal.close(); }

  newBtn.addEventListener('click', () => openModal(null));
  cancelBtn.addEventListener('click', closeModal);
  search.addEventListener('input', render);
  filterEstado.addEventListener('change', render);
  resetBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('¿Restaurar los 3 pacientes de ejemplo? Tus cambios se perderán.')) {
      localStorage.removeItem(STORAGE_KEY);
      render();
    }
  });

  tbody.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('button[data-action]') as HTMLButtonElement | null;
    if (!btn) return;
    const id = btn.dataset.id!;
    const all = load();
    if (btn.dataset.action === 'edit') {
      const p = all.find((x) => x.id === id);
      if (p) openModal(p);
    }
    if (btn.dataset.action === 'delete') {
      const p = all.find((x) => x.id === id);
      if (p && confirm(`¿Eliminar a ${p.nombre}?`)) {
        save(deletePaciente(all, id));
        render();
      }
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const obj = Object.fromEntries(fd.entries());
    try {
      const rec = buildPaciente(obj);
      save(upsertPaciente(load(), rec));
      closeModal();
      render();
    } catch (err) {
      alert((err as Error).message);
    }
  });

  render();
}

document.addEventListener('DOMContentLoaded', () => initCrud());

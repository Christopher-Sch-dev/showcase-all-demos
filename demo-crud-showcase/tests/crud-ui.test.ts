// @vitest-environment happy-dom
// tests/crud-ui.test.ts — Test de la UI del CRUD (src/scripts/crud.ts)
// Cubre el flujo real: crear, editar, eliminar, buscar, filtrar, reset.
// Spec: Como usuario quiero usar el panel CRUD completo para gestionar pacientes.
import { describe, it, expect, beforeEach } from 'vitest'
import { initCrud } from '../src/scripts/crud'
import { STORAGE_KEY } from '../src/lib/pacientes'

// Monta el DOM mínimo que initCrud() espera.
function setupDom() {
  document.body.innerHTML = `
    <dialog id="edit-modal">
      <h2 id="modal-title"></h2>
      <form id="edit-form">
        <input id="f-id" name="id">
        <input id="f-nombre" name="nombre">
        <input id="f-rut" name="rut">
        <input id="f-email" name="email">
        <input id="f-telefono" name="telefono">
        <input id="f-tratamiento" name="tratamiento">
        <select id="f-estado" name="estado">
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
          <option value="pendiente">Pendiente</option>
        </select>
        <input id="f-ultima" name="ultimaVisita">
        <button type="submit">Guardar</button>
      </form>
      <button id="cancel-btn"></button>
    </dialog>
    <input id="search">
    <select id="filter-estado">
      <option value="">Todos</option>
      <option value="activo">Activo</option>
    </select>
    <button id="new-btn"></button>
    <button id="reset-btn"></button>
    <table><tbody id="pacientes-body"></tbody></table>
    <div id="empty-msg"></div>
    <span id="stat-total"></span>
    <span id="stat-active"></span>
    <span id="stat-inactive"></span>
    <span id="stat-pending"></span>
  `
}

// happy-dom: mockea showModal/close de <dialog>.
beforeEach(() => {
  localStorage.clear()
  setupDom()
  HTMLDialogElement.prototype.showModal = function () { this.open = true }
  HTMLDialogElement.prototype.close = function () { this.open = false }
})

describe('crud.ts — render inicial (seed)', () => {
  it('renderiza los 3 pacientes de ejemplo en la tabla', () => {
    initCrud()
    const rows = document.querySelectorAll('#pacientes-body tr')
    expect(rows.length).toBe(3)
    expect(rows[0].textContent).toContain('María')
  })

  it('actualiza los stats totales', () => {
    initCrud()
    expect(document.getElementById('stat-total')!.textContent).toBe('3')
  })

  it('oculta el mensaje de vacío si hay pacientes', () => {
    initCrud()
    expect((document.getElementById('empty-msg') as HTMLElement).hidden).toBe(true)
  })
})

describe('crud.ts — búsqueda y filtro', () => {
  it('filtra por nombre al escribir en search', () => {
    initCrud()
    const search = document.getElementById('search') as HTMLInputElement
    search.value = 'Pérez'
    search.dispatchEvent(new Event('input'))
    const rows = document.querySelectorAll('#pacientes-body tr')
    expect(rows.length).toBe(1)
    expect(rows[0].textContent).toContain('Pérez')
  })

  it('muestra vacío si la búsqueda no matchea', () => {
    initCrud()
    const search = document.getElementById('search') as HTMLInputElement
    search.value = 'zzznadie'
    search.dispatchEvent(new Event('input'))
    expect(document.querySelectorAll('#pacientes-body tr').length).toBe(0)
    expect((document.getElementById('empty-msg') as HTMLElement).hidden).toBe(false)
  })
})

describe('crud.ts — crear paciente', () => {
  it('abre el modal de nuevo paciente', () => {
    initCrud()
    ;(document.getElementById('new-btn') as HTMLElement).click()
    expect((document.getElementById('edit-modal') as HTMLDialogElement).open).toBe(true)
  })

  it('crea un paciente nuevo y lo agrega a la tabla', () => {
    initCrud()
    const form = document.getElementById('edit-form') as HTMLFormElement
    ;(document.getElementById('f-nombre') as HTMLInputElement).value = 'Nuevo Paciente'
    ;(document.getElementById('f-rut') as HTMLInputElement).value = '11.111.111-1'
    ;(document.getElementById('f-email') as HTMLInputElement).value = 'nuevo@test.cl'
    form.dispatchEvent(new Event('submit', { cancelable: true }))
    const rows = document.querySelectorAll('#pacientes-body tr')
    expect(rows.length).toBe(4)
    expect(rows[0].textContent).toContain('Nuevo Paciente')
  })
})

describe('crud.ts — editar paciente', () => {
  it('abre el modal con los datos del paciente al clickear editar', () => {
    initCrud()
    const editBtn = document.querySelector('button[data-action="edit"]') as HTMLElement
    editBtn.click()
    const modal = document.getElementById('edit-modal') as HTMLDialogElement
    expect(modal.open).toBe(true)
    expect((document.getElementById('modal-title') as HTMLElement).textContent).toContain('Editar')
    expect((document.getElementById('f-nombre') as HTMLInputElement).value).toContain('María')
  })

  it('guarda los cambios editados', () => {
    initCrud()
    const editBtn = document.querySelector('button[data-action="edit"]') as HTMLElement
    editBtn.click()
    ;(document.getElementById('f-nombre') as HTMLInputElement).value = 'María Actualizada'
    const form = document.getElementById('edit-form') as HTMLFormElement
    form.dispatchEvent(new Event('submit', { cancelable: true }))
    const rows = document.querySelectorAll('#pacientes-body tr')
    expect(rows.length).toBe(3)
    expect(rows[0].textContent).toContain('María Actualizada')
  })
})

describe('crud.ts — eliminar paciente', () => {
  it('elimina un paciente al confirmar', () => {
    // mockear confirm para que acepte
    const orig = window.confirm
    window.confirm = () => true
    initCrud()
    const delBtn = document.querySelector('button[data-action="delete"]') as HTMLElement
    delBtn.click()
    expect(document.querySelectorAll('#pacientes-body tr').length).toBe(2)
    window.confirm = orig
  })
})

describe('crud.ts — reset', () => {
  it('restaura los 3 pacientes de ejemplo', () => {
    const orig = window.confirm
    window.confirm = () => true
    initCrud()
    // agregar uno
    ;(document.getElementById('new-btn') as HTMLElement).click()
    const form = document.getElementById('edit-form') as HTMLFormElement
    ;(document.getElementById('f-nombre') as HTMLInputElement).value = 'Temporal'
    form.dispatchEvent(new Event('submit', { cancelable: true }))
    expect(document.querySelectorAll('#pacientes-body tr').length).toBe(4)
    // reset
    ;(document.getElementById('reset-btn') as HTMLElement).click()
    expect(document.querySelectorAll('#pacientes-body tr').length).toBe(3)
    window.confirm = orig
  })
})

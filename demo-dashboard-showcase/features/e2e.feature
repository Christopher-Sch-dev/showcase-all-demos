# E2E — Producción real + adversarial (Playwright, contra build estático servido, NUNCA mock)
# Spec Gherkin de la fase E2E. Verificación EXTERNA: npx playwright test.

Feature: Landing (producción real)
 Scenario: Hero de venta visible en EN
 Given el build estático está servido en http://localhost:8080
 When el usuario abre "/"
 Then ve el headline "Your schedule is leaking revenue"
 And ve el badge "MODO DEMO"
 And el CTA principal apunta a https://calendly.com/csch1305 (NUNCA mailto)
 And ve los pain-points con métricas y source

 Scenario: Landing ES carga en español
 Given el build estático está servido
 When el usuario abre "/es/"
 Then ve el headline en español "Tu agenda está perdiendo ingresos"
 And ve el badge "MODO DEMO"

 Scenario: Sin overflow horizontal en mobile 375
 Given el viewport es 375x812
 When el usuario abre "/"
 Then no hay scroll horizontal (scrollWidth <= clientWidth)

Feature: Dashboard (flujo Gherkin completo)
 Scenario: KPIs derivados visibles
 Given el dashboard se renderiza
 Then muestra los 6 KPIs (activos, no-show rate, revenue, revenue/patient, programadas, completadas)
 And los KPIs derivados muestran la nota "Estimated based on industry averages"

 Scenario: Charts por mes y por tratamiento
 Given hay citas con valor y fecha
 When el dashboard se renderiza
 Then muestra "Revenue by month" y "Revenue by treatment"

 Scenario: Tabla paginada con filtros
 Given hay 9 pacientes seed
 When el usuario pagina la tabla
 Then muestra 8 filas por página con contador "1 of 2"
 And el usuario puede filtrar por estado y por tratamiento

 Scenario: CRUD crear paciente → aparece en tabla
 Given el usuario abre el form de nuevo paciente
 When ingresa datos válidos y guarda
 Then el paciente aparece en la tabla
 And los KPIs se recalculan

 Scenario: CRUD editar paciente
 Given hay un paciente en la tabla
 When el usuario edita su nombre
 Then el nombre actualizado aparece en la tabla

 Scenario: CRUD eliminar paciente
 Given hay un paciente en la tabla
 When el usuario lo elimina (confirma)
 Then el paciente ya no aparece en la tabla

 Scenario: Persistencia localStorage
 Given el usuario crea un paciente
 When recarga la página
 Then el paciente sigue en la tabla

Feature: Adversarial
 Scenario: Doble-click en botones no crashea
 Given el dashboard está cargado
 When el usuario hace doble-click en botones de acción
 Then la app sigue funcional sin errores de consola

 Scenario: Acciones inválidas no crashean
 Given el form de paciente está abierto
 When el usuario envía datos inválidos (email/phone/RUT mal)
 Then muestra errores inline sin enviar el form

 Scenario: Reload a mitad de flujo persiste estado
 Given el usuario creó un paciente
 When recarga la página a mitad de flujo
 Then el estado persiste en localStorage

 Scenario: Reset restaura el seed
 Given el usuario modificó datos
 When hace click en Reset y confirma
 Then la tabla vuelve a los 9 pacientes seed

 Scenario: Mobile 375 sin overflow + touch ≥44px
 Given el viewport es 375x812
 When el usuario navega el dashboard
 Then no hay overflow horizontal
 And todos los targets touch miden ≥44px

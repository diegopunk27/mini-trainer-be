# Ejemplo de Task de Correccion de Bug

Basado en Bug 86509 / US 86203 (Alejando Alazraqui Planner).

## Paso 0

Usuario no aporto contexto adicional: se siguio el relevamiento estandar.

## Brief de contexto (Paso 1)

**Bug:** `86509` — QAF - Segunda Ronda - Jugadores por ronda - Popup: Filas editables post kickoff

**US padre:** `86203` — QAF - Segunda Ronda - Sistema de jugadores por ronda (BE+FE)

**Defecto:** Filas con partido post-kickoff siguen editables; backend responde 409 sin feedback claro en UI.

**Tasks hijas relevantes:** `86378` (FE popup jugadores), `86376` (BE endpoint PUT con lock).

**US relacionadas:** ninguna relevante.

---

## Analisis de causa raiz (Paso 2)

**Hipotesis:** El componente FE del popup no aplica estado readonly/disabled cuando `kickoffAt` del partido ya paso.

**Categoria principal:** Fallo en la ejecucion o revision de codigo

**Categoria secundaria:** Falta de tests (no hay test FE que valide bloqueo post-kickoff)

**Certeza:** Alta — CA #10 de la US es explicito; el plan de task FE menciona popup pero no evidencia implementacion del lock visual.

**Como se verifico:** se abrio el popup con una fila de partido post-kickoff en DEMO; el input de posicion/partido/nombre quedo editable (deberia estar disabled). Confirma que la hipotesis (falta el estado readonly) es la causa real, no una suposicion.

**Rastreo git:**
- Archivo: `KnockoutPlayersPopup.tsx`
- Conclusion: **Divergencia especificacion/implementacion** (subtipo: nunca implementado)
- `git log -S "readonly"` y `git blame` no muestran logica de bloqueo post-kickoff en ningun commit del archivo
- Commit de creacion del popup (def4567): implementa filas editables sin condicion por `kickoffAt`
- PR asociado: #18239
- Certeza del rastreo: Alta

**Evaluacion de rules:** No modificar rules. Agregar tests en la correccion segun testing-strategy del repo.

---

## Exposicion al desarrollador (Paso 3)

El popup FE no deshabilita filas bloqueadas. El BE rechaza correctamente con 409. Falta implementar readonly en UI + test de regresion. Confirmar antes de generar Task.

---

## Task propuesta (Paso 4)

**Titulo:** `Fix: Jugadores por ronda - Popup bloquea filas post kickoff (Bug 86509)`

**Activity:** `Dev FE`

**Plan (resumen):**

### 0. Referencia al Bug
Bug 86509. CA US #10 violado. Ambiente DEMO.

### 1. Analisis de causa raiz
- Principal: Fallo en ejecucion/revision de codigo
- Secundaria: Falta de tests
- Certeza: Alta
- Como se verifico: fila post-kickoff en DEMO quedo editable (deberia estar disabled)
- Tasks implicadas: 86378 (plan no verifico lock visual)
- Rules: No modificar

### 2. Archivos clave
- `KnockoutPlayersPopup.tsx` (componente popup)
- Tests del popup

### 3. Reglas aplicables
- Regla de rol FE del repo

### 4. Cambios a realizar
1. Detectar `kickoffAt <= now` por fila y setear readonly/disabled en posicion, partido y nombre.
2. Ocultar o deshabilitar accion guardar para filas bloqueadas.
3. Mostrar mensaje claro si el usuario intenta editar fila bloqueada.
4. Agregar test: fila con partido pasado renderiza disabled.

### 5. Como verificar la solucion
- Reproduccion: abrir popup 16avos con fila de partido post-kickoff (mismo escenario del Bug 86509).
- Resultado que confirma el fix: los campos posicion/partido/nombre de esa fila quedan disabled (antes quedaban editables).
- Regresion: fila pre-kickoff sigue editable; guardado parcial de filas no bloqueadas funciona igual.

### 6. Estimacion
- Arquetipo: Bug-clean (causa identificada con certeza Alta, poco debug de verificacion) -> base 0.5h
- Riesgo infra: No aplica
- **Estimacion final: 0.5h**

---

## Vinculos ADO (Paso 5)

- Parent: US 86203
- Related: Bug 86509

---

## Resolucion (Paso 6)

Preguntar al desarrollador si ejecutar plan con `dev-plan-execution` sobre la Task creada.

# Bug Fix Plan Format

Estructura del plan de desarrollo para Tasks de correccion de bugs. El agente debe cargar este archivo antes del Paso 4 de `SKILL.md`.

## Titulo de la Task

```
Fix: [modulo/funcionalidad] - [descripcion corta del defecto]
```

Opcional: incluir referencia al Bug en el titulo sin usar `#` (ej: `Fix: Jugadores por ronda - Filas editables post kickoff (Bug 86509)`).

## Activity

- `Dev BE`: correccion solo backend.
- `Dev FE`: correccion solo frontend.
- `Dev`: ambas capas o no especifica.

## Estructura del Plan (Description en HTML)

La Description de la Task sigue esta estructura en HTML (`<h3>`, `<ul>`, `<li>`, `<strong>`, `<p>`):

### 0. Referencia al Bug

- ID y titulo del Bug.
- CA de la US violado (referencia).
- Ambiente donde se reprodujo.

### 1. Analisis de causa raiz

Documentar en la Task (obligatorio):

- **Categoria principal**: Falta de tests / Fallo en la US / Fallo en plan de desarrollo / Fallo en ejecucion o revision de codigo.
- **Categoria secundaria**: si aplica, o "Ninguna".
- **Certeza**: Alta / Media / Baja.
- **Evidencia**: bullets concretos (archivos, tasks, CA, tests, commits).
- **Como se verifico el diagnostico**: pasos de reproduccion (trasladados de la Sintesis del Paso 2) que confirman que esa causa, y no otra, produce el defecto.
- **Rastreo git**: conclusion (regresion / omision / indeterminado), commit introducctor, diff resumido, PR asociado, certeza del rastreo.
- **Tasks originales implicadas**: IDs y que les falto.
- **Evaluacion de rules**: Si / No / Evaluar con el equipo + motivo.

### 2. Archivos clave a analizar

Igual que tasks normales: archivos relevantes con razon. Incluir tests existentes si la causa es falta de tests.

### 3. Reglas de arquitectura aplicables

Listar reglas del proyecto que el ejecutor debe cargar. Las reglas base siempre aplican; no hace falta listarlas.

### 4. Cambios a realizar (paso a paso)

Dos modos posibles segun el estado del diagnostico:

**Modo A — Causa identificada (certeza Alta)**

Instrucciones imperativas para la correccion:

- Fix del defecto: archivo, funcion y cambio concreto.
- Tests nuevos o ajustados si la causa es falta de tests o si el fix requiere regresion.
- No incluir validacion manual ni smoke test aqui.

**Modo B — Causa aun no identificada**

Plan de debug para descubrirla antes de corregir:

- Punto de entrada del flujo del bug (endpoint, accion de UI, evento).
- Logs o breakpoints a agregar en los archivos core para observar el estado en ejecucion.
- Escenario a reproducir (ReproSteps del Bug).
- Que registrar: estado observado vs esperado, stacktrace si aplica, valores de variables clave en el punto de falla.
- Criterio de salida: que evidencia debe obtenerse para pasar a Modo A y definir el fix.

Indicar en el encabezado del bloque cual modo esta activo (`Modo A` o `Modo B`).

### 5. Como verificar la solucion

Verificacion obligatoria, no un smoke test generico: hay que reproducir el escenario exacto del bug y confirmar el resultado puntual que prueba que la causa raiz diagnosticada quedo resuelta.

- **Reproduccion del defecto original**: pasos exactos (basados en `ReproSteps` del Bug) para llegar al punto donde antes fallaba.
- **Resultado que confirma el fix**: el valor/estado/comportamiento puntual ligado a la causa raiz que debe observarse ahora (ej: si la causa era un null pointer, mostrar que el campo ya no es null en ese escenario exacto). No alcanza con "ya no tira error".
- **Regresion de consumidores directos**: smoke test breve de los flujos que comparten el mismo codigo. Checklist 2-4 items.

Si el plan quedo en **Modo B** (causa aun no identificada), esta seccion no aplica todavia: la verificacion en ese caso es el criterio de salida del plan de debug (punto 4 de "Cambios a realizar").

### 6. Estimacion

Desglose completo segun `../dev-estimation/SKILL.md`. Forma parte de la Description.

## Checklist antes de crear en ADO

- [ ] Titulo con prefijo `Fix:`
- [ ] Bloque de causa raiz completo (incluye rastreo git y como se verifico el diagnostico)
- [ ] Evaluacion de rules documentada
- [ ] Plan de cambios alineado al diagnostico validado en Paso 3
- [ ] Seccion 5 con reproduccion del defecto y resultado puntual que confirma el fix (si esta en Modo A)
- [ ] Estimacion con arquetipo y riesgo infra
- [ ] Activity correcta
- [ ] RemainingWork y OriginalEstimate con mismo valor

## Vinculos ADO

- **Parent**: US origen del Bug.
- **Related**: Bug que se corrige.

## Estimacion

Usar `../dev-estimation/SKILL.md`. Para fixes, matchear el arquetipo de "Correccion de bugs" del catalogo (capa-agnostico, suelen ser tareas mas chicas que features nuevas). Si el fix incluye tests significativos, contarlos en el arquetipo o sumar riesgo segun el catalogo.

Ajuste manual: si el usuario corrige la estimacion, registrar original, corregida y motivo (`Regresion` / `Codificacion agentica` / `Otro`).

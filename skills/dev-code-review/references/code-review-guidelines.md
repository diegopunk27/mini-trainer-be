# Code Review - Ejes y formato

Referencia de ejes de evaluacion y formato del informe para `dev-code-review/SKILL.md`.

Orden de prioridad: el eje 1 (reglas) es el mas importante; mancha la estructura del codigo. Los ejes 2 y 3 verifican impacto y cumplimiento del requerimiento (funciona lo pedido, no rompe lo que no se toco). Los ejes 4 a 6 miden calidad tecnica del codigo (simplicidad, uso del stack, deuda futura).

## Alcance: que resuelve este review y que se delega a otra herramienta

Este review es un guardrail semantico: entiende comportamiento, arquitectura del proyecto y riesgo de negocio. No duplica lo que una herramienta deterministica ya resuelve mejor y mas barato. Si el repo no tiene alguna de las herramientas de la derecha configurada, **no expandir el review para cubrir el hueco** (no reinventar un linter con el LLM): mencionarlo una sola vez como gap de tooling, no como hallazgo recurrente en cada PR.

| Se resuelve aca (LLM) | Se delega a otra herramienta |
|---|---|
| Bugs de logica introducidos por el diff (nulls, estados, errores silenciados, concurrencia) | Errores de tipo/sintaxis -> compilador / build |
| CA/test cases cubiertos por el diff (comportamiento, no lineas) | % cobertura de lineas/branches -> reporte de coverage |
| Cumplimiento de arquitectura y convenciones **especificas del proyecto** | Estilo, formato, orden de imports, naming generico -> linter/formatter |
| Decisiones de diseno, simplicidad, uso idiomatico del stack | Vulnerabilidades de patron conocido, duplicacion %, complejidad ciclomatica -> SAST/Sonar si esta configurado |
| Riesgo de regresion funcional en consumidores directos | Tests pasando / build exitoso -> CI (Validaciones por iteracion / Testing de cierre del rol) |

## Ejes de evaluacion

### 1. Cumplimiento de reglas [Ambos modos] - PRIORIDAD MAXIMA

Verificar el diff contra el rol/stack del repo y las reglas de la carpeta architecture cargadas en preparacion.

- Solo las reglas cargadas en el paso de preparacion (rol/stack + architecture; en Task mode tambien las referenciadas en el plan).
- Por cada violacion: regla incumplida, archivo y linea, que incumple, como corregir.
- Foco en lo que rompe la estructura: capas mal ubicadas, dependencias prohibidas, convenciones de naming/organizacion, contratos de la arquitectura.

No inventar reglas que no esten en el contexto cargado. Si una practica deseable no esta cubierta por ninguna regla, reportarla en el eje que corresponda (4, 5 o 6), no aqui.

### 2. Huecos en el desarrollo [Task: completo | Diff: parcial]

Verificar completitud respecto a lo acordado: que no falten casos cubiertos en la spec, que el plan se haya respetado, y que el comportamiento relevante este efectivamente testeado segun `dev-testing-strategy`. En Task mode, spec y tests van atados: un caso de la spec cumplido pero sin test (y fuera de omit-list) es un hueco.

Fuente de criterio de cobertura: `../dev-testing-strategy` (`SKILL.md` + `references/`, en especial `decision-matrix.md`). No buscar overlay `testing-strategy.mdc`. **No** aplicar checklist ORM/entity↔migracion en este eje (eso es review BE dedicado, fuera del review general).

- **Cobertura funcional** [Solo Task mode]: usar como spec los **test cases de la US impactados por el diff** (titulo y descripcion). Si no existen test cases, usar los CA impactados como fallback. Por cada caso de la spec: verificar dos cosas:
  1. Esta implementado (comportamiento presente en el diff).
  2. Esta cubierto por al menos un test automatizado, **salvo** que la omit-list (stack + `decision-matrix.md`) diga que no corresponde test de runtime.
  Por cada caso: estado (implementado + testeado / implementado sin test / omitido por omit-list / faltante) y archivo. Marcar como hallazgo todo caso importante que falte o que deba tener test y no lo tenga. Severidad acorde a la criticidad del caso.
- **Respeto del plan** [Solo Task mode]: los pasos del plan de desarrollo se implementaron. Marcar pasos faltantes o parciales (con archivo).
- **Alcance** [Solo Task mode]: el diff se mantiene dentro de la tarea. Marcar:
  - Funcionalidad de mas no solicitada ni consensuada con el usuario.
  - Cambios no relacionados con la tarea.
  - Faltantes respecto al alcance acordado.
- **Cobertura de tests** [Ambos modos]: alinear con la estrategia de testing (capa minima, omit-list, anti-espejo).
  - Spec de comportamiento = test cases impactados (Task mode, si existen) o CA impactados (fallback) o comportamiento observable del diff (Diff mode); no exigir tests del "como" del plan.
  - Comportamiento relevante sin test y **fuera** de omit-list -> hueco.
  - **Anti-hallazgos (omit-list)**: no reportar falta de test por asserts de shape/firmas/tipos que el compilador ya impone (TS strict, C#, etc.), ni por cobertura campo-a-campo de validacion declarativa si la matriz lo omite. Si esta en omit-list, no es hueco.
  - **Casos borde** relevantes al CA/comportamiento del diff: entradas vacias/nulas, limites, errores de negocio del CA — no combinatoria exhaustiva "por si acaso".
  - No exigir tests de lo trivial; foco en huecos reales de comportamiento.

En Diff mode no hay CA ni plan: este eje se limita a cobertura del comportamiento del diff (respetando omit-list) y casos borde. El impacto y los riesgos tecnicos se evaluan en el Eje 3, disponible en ambos modos.

### 3. Impacto y riesgos [Ambos modos]

Verificar dos cosas distintas de la calidad tecnica del codigo (ejes 1, 4, 5, 6): que el cambio no rompa algo que no fue contemplado, y que no introduzca defectos propios.

- **Analisis de impacto**: identificar funcionalidades o **consumidores directos** del componente modificado (mismo criterio que usa `dev-tasks`: un nivel de profundidad; excepcion en estructuras genericas compartidas donde el impacto es estructural y obvio).
  - Verificar si el diff actualizo lo que dependia del comportamiento/contrato modificado, o si queda una funcionalidad afectada sin contemplar (ni en el plan/CA ni en el diff).
  - Marcar como hallazgo todo impacto no contemplado, con archivo/consumidor concreto. Severidad segun si rompe algo existente (`Bloqueante`/`Mayor`) o genera una inconsistencia menor.
  - No es lo mismo que "Alcance" (eje 2): alcance mira si el diff se paso de scope; esto mira si el diff se quedo corto en propagar un cambio a lo que depende de el.
- **Riesgos y bugs potenciales**: deteccion sistematica de defectos que el diff puede estar introduciendo en su propia logica (no necesariamente ligados a un CA). Usar como guia, no como lista exhaustiva obligatoria; reportar solo lo que aplica al diff con evidencia concreta:
  - Manejo de nulos/undefined/vacios no contemplado en el flujo nuevo.
  - Excepciones capturadas y silenciadas sin log ni reaccion (o no capturadas donde el flujo lo requiere).
  - Condiciones de carrera / estado compartido mutado sin sincronizacion (si el diff toca codigo concurrente o async compartido).
  - Recursos no liberados (conexiones, streams, listeners, timers) abiertos por el cambio.
  - Autorizacion/autenticacion ausente o debil en un flujo que la requiere segun el CA o el patron del proyecto.
  - Estados inconsistentes: transicion parcial si falla un paso intermedio (falta rollback/transaccion cuando el CA lo exige).
  - Manejo de errores externos (timeouts, respuestas inesperadas de servicios/DB) no contemplado si el cambio los introduce.

### 4. Optimalidad y simplicidad [Ambos modos]

Verificar que la solucion elegida sea la mas simple y adecuada. Los agentes tienden a sobrecomplicar; hacer foco activo en simplificar.

- **Complejidad innecesaria**: codigo que resuelve mas de lo pedido, indirecciones sin valor, abstracciones prematuras para el scope de la tarea.
- **Simplificacion**: proponer la version mas directa cuando exista (menos pasos, menos estado, menos ramas).
- **Performance**: operaciones costosas evitables (loops anidados, N+1, llamadas repetidas, copias innecesarias) cuando el contexto lo justifique.
- **Patrones de diseno**: sugerir un patron solo cuando aporta claridad o reduce complejidad real. No proponer patrones por completitud.

Por hallazgo: que se hizo, por que es mas complejo de lo necesario, cual es la alternativa mas simple.

### 5. Decisiones segun el stack [Ambos modos]

Evaluar las decisiones tecnicas contra el stack del repo.

- **Librerias/herramientas**: si una libreria ya disponible en el stack resuelve mejor algo que se implemento a mano, o si se eligio una opcion menos adecuada que la convencional del stack.
- **Convenciones del stack**: respeto de idioms, APIs idiomaticas, manejo de errores, tipado y estilo propios del lenguaje/framework.
- **Uso correcto del framework**: aprovechar lo que el framework ya ofrece en vez de reimplementarlo.

Por hallazgo: decision actual -> alternativa del stack, con archivo.

### 6. Oportunidades de refactor [Ambos modos]

Identificar deuda y oportunidades de mejora, presentes y futuras. Puede mirar mas alla del diff, pero se marca como sugerencia (no bloquea).

- **Duplicacion**: logica repetida en el diff o respecto a codigo existente que conviene centralizar.
- **Potencial de reutilizacion**: funciones/utilidades con potencial de volverse compartidas o globales.
- **Extracciones futuras**: bloques que convendria separar (SRP), nombres que convendria mejorar, acoplamientos a desarmar.

Criterio: solo refactors que aporten valor real y reutilizable. Vara alta; evitar micro-sugerencias triviales. Maximo 3-5 propuestas con evidencia concreta.

---

## Formato del informe

### Task mode (informe completo)

```markdown
# Code Review - [Nombre breve]

**US**: [Titulo] | **Task**: [Titulo]

---

## Cumplimiento de reglas
- [severidad] [Violacion concreta -> archivo:linea, como corregir, o "Sin violaciones."]

## Huecos en el desarrollo
- **Cobertura funcional**: [por test case (o CA si no hay TCs): implementado + testeado / implementado sin test / omitido por omit-list / faltante -> archivo] [severidad]
- **Respeto del plan**: [pasos cumplidos / paso faltante o parcial -> archivo] [severidad]
- **Alcance**: [Dentro del scope / [cambio fuera de scope o faltante] -> archivo] [severidad]
- **Cobertura de tests**: [comportamiento relevante o caso borde sin test (fuera de omit-list) -> sugerencia, o "Comportamiento relevante cubierto."] [severidad]

## Impacto y riesgos
- **Analisis de impacto**: [severidad] [consumidor/funcionalidad afectada no contemplada -> archivo, o "Sin impacto no contemplado."]
- **Riesgos y bugs potenciales**: [severidad] [defecto concreto -> archivo, o "Sin riesgos detectados."]

## Optimalidad y simplicidad
- [severidad] [Complejidad evitable -> alternativa mas simple, archivo, o "Sin observaciones."]

## Decisiones segun el stack
- [severidad] [Decision -> alternativa del stack, archivo, o "Sin observaciones."]

## Oportunidades de refactor
- [Duplicacion / reutilizacion / extraccion -> archivo, o "Sin propuestas relevantes."]

---

| Eje                  | Estado               |
| -------------------- | -------------------- |
| Reglas               | OK / Con violaciones |
| Huecos (CA/tests)    | OK / Con huecos      |
| Impacto y riesgos    | OK / Con hallazgos   |
| Optimalidad          | OK / Con obs.        |
| Stack                | OK / Con obs.        |
| Refactor             | 0 / N propuestas     |

**Recomendacion**: Aprobar / Cambios menores / Solicitar cambios / Bloquear
```

### Diff mode (informe reducido)

```markdown
# Code Review - Diff

---

## Cumplimiento de reglas
- [severidad] [Violacion concreta -> archivo:linea, como corregir, o "Sin violaciones."]

## Huecos (cobertura y casos borde)
- **Cobertura de tests**: [comportamiento relevante o caso borde sin test -> sugerencia, o "Comportamiento relevante cubierto."] [severidad]

## Impacto y riesgos
- **Analisis de impacto**: [severidad] [consumidor/funcionalidad afectada no contemplada -> archivo, o "Sin impacto no contemplado."]
- **Riesgos y bugs potenciales**: [severidad] [defecto concreto -> archivo, o "Sin riesgos detectados."]

## Optimalidad y simplicidad
- [severidad] [Complejidad evitable -> alternativa mas simple, archivo, o "Sin observaciones."]

## Decisiones segun el stack
- [severidad] [Decision -> alternativa del stack, archivo, o "Sin observaciones."]

## Oportunidades de refactor
- [Duplicacion / reutilizacion / extraccion -> archivo, o "Sin propuestas relevantes."]

---

| Eje          | Estado               |
| ------------ | -------------------- |
| Reglas       | OK / Con violaciones |
| Huecos       | OK / Con obs.        |
| Impacto y riesgos | OK / Con hallazgos |
| Optimalidad  | OK / Con obs.        |
| Stack        | OK / Con obs.        |
| Refactor     | 0 / N propuestas     |

**Recomendacion**: Aprobar / Cambios menores / Solicitar cambios / Bloquear
```

---

**Principio de salida**: el informe debe ser breve y escaneable. Una linea por observacion con su severidad, sin redundancias. El desarrollador lo lee rapido y sabe que hacer.

**Sin relleno**: no generar un hallazgo por eje solo para completar la seccion o parecer exhaustivo. Un eje sin problemas reales se reporta "Sin observaciones", no se fuerza un Nit. Preferir pocos hallazgos de alto impacto a muchos triviales.

# Lineamientos de division de tareas

Criterios para los Pasos 1 y 2 de la skill `dev-tasks`.

## Analisis de impacto (obligatorio si afecta comportamiento existente)

- Si el cambio afecta comportamiento existente (no una feature nueva), analizar el impacto buscando los **consumidores directos** del componente modificado (un nivel de profundidad: quien usa directamente la funcion, clase o comportamiento que cambia).
- El usuario puede no tener visibilidad completa del impacto: NO asumir que lo identificado por el usuario es todo el alcance.
- Criterio de corte: no seguir la cadena de dependencias mas alla del consumidor directo. Excepcion: clases o estructuras genericas compartidas (repositorios base, clases abstractas, utilities globales) donde el impacto es estructural y obvio; documentar directamente el impacto conocido.
- Clasificar el impacto detectado:
  1. **Requiere cambio de codigo** -> crear tarea adicional para ese flujo.
  2. **Requiere validacion manual** -> agregar a "Flujos a validar por el desarrollador".
- El analisis se realiza en este paso, no se difiere. Las tareas "analizar y, si hay impacto, cambiar" son antipatron: imposibles de estimar y con cierre ambiguo. Solo crear tareas para cambios confirmados. Excepcion: si el impacto solo puede determinarse en runtime, puede justificarse una tarea de investigacion explicita y acotada.

## Refactor preparatorio (opcional)

Principio: "make the change easy, then make the easy change". El unico refactor que se evalua aca es el que **desbloquea el cambio de ESTA tarea**, mirando los archivos que la tarea va a modificar. **No es un escaneo de deuda tecnica del repo.**

Criterio (vara alta):

- Proponer un refactor preparatorio SOLO si la estructura **actual del codigo que hay que tocar** hace este cambio materialmente mas dificil, riesgoso o fragil de testear. La friccion debe ser concreta y estar en el camino del cambio.
- NO salir a buscar smells, duplicacion o complejidad fuera del cambio, ni proponer mejoras cosmeticas, de estilo o no relacionadas. Detectar deuda tecnica general es responsabilidad del analisis estatico (Sonar / linters) y del criterio del desarrollador, no de este paso. Deuda no relacionada: a lo sumo mencionarla, no crear tarea.
- El refactor **preserva comportamiento** y va como tarea (y commit/PR) **separada** del cambio funcional.
- Ante la duda de si vale la pena, no proponerlo.

Si un candidato supera la vara, construir su plan segun la regla de refactor del repo (ej: `refactor-rules`): archivo afectado, que cambiar, tecnica (Extract Function, Inline, Rename, etc.), precondicion de tests de caracterizacion si no existen, pasos pequenos verificables y justificacion breve (como desbloquea la implementacion de la US). El plan se arma aqui; la ejecucion la hace `dev-plan-execution`.

## Division en tareas (alto nivel)

- Dividir en tareas BE-XXX y FE-XXX cubriendo todos los criterios de aceptacion.
- Si el analisis de impacto revelo flujos que requieren cambio de codigo, incluir tareas adicionales separadas (no dentro de la principal). Ej: "BE-XXX: Adaptar flujo de listado para incluir nuevo campo".
- Nivel alto: solo nombre y objetivo de cada tarea, sin implementacion ni plan tecnico.
- Cada tarea debe poder implementarse en un branch independiente y dejar el proyecto en **estado consistente e integrable** al finalizar.
- Tamano de tarea: una tarea deberia representar una unidad de trabajo acotada y revisable. Si al estimar (Paso 3) supera ~4h o mezcla responsabilidades distintas, evaluar dividirla, siempre que cada parte deje el sistema en estado valido.
- Si se detectaron refactors preparatorios aprobados por el usuario, crearlos como tareas separadas con su propio plan, ordenadas antes de las tareas que dependen de ellos.
- Para criterios especificos por stack, ver `references/fe-task-guidelines.md` y `references/be-task-guidelines.md`.

## Dependencias entre tareas

- Al ordenar las tareas por secuencia de implementacion, identificar la **dependencia inmediata anterior** de cada una (la tarea que debe estar terminada para poder empezar esta). `Ninguna` si es independiente.
- Registrar solo la dependencia inmediata, no toda la cadena de precedentes. El grafo se reconstruye encadenando dependencias inmediatas.
- Secuencias FE y BE se numeran por separado; una tarea FE puede depender de una BE si necesita el contrato ya implementado.
- Para que sirven: le dan a la ejecucion del plan el contexto de las tareas previas. Su materializacion en ADO (links `predecessor`/`successor`) la maneja el Paso 4 de la skill.

## Estado valido del sistema

Cada tarea debe dejar el sistema en estado valido y ser mergeable independientemente.

- **Valido**: GET basico (sin filtros) + otra tarea para agregar filtros.
- **Invalido**: crear DTO + otra tarea para crear el handler (endpoint roto entre tareas).

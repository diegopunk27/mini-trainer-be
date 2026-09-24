# Catalogo de arquetipos (estimacion por semejanza) — nestjs_cqrs_base

Catalogo derivado del historico real del proyecto `<COMPLETAR_ADO_PROJECT_NAME>` (stack NestJS +
CQRS + TypeORM, compartido por este template). Estimar matcheando la tarea al arquetipo mas
parecido. Detalle del muestreo en `calibration-log.md`.

> **Punto de partida compartido con este proyecto.** Este catalogo arranca desde el muestreo BE del proyecto
> ADO (mismo stack). Calibrar bases agenticas con sprints reales de **portal-BE** via
> `dev-sprint-review`. Las tareas FE se estiman en el repo `react-template-base` (no aqui).
> Arquetipos tipicos de este proyecto (ej. `BE-ep-file`) pueden no aplicar; preferir arquetipos genericos
> del portal si el match es dudoso.

## Como leer las dos columnas (IMPORTANTE)

- **Base agentica**: la que se USA para estimar (agente codifica, dev supervisa). Es **provisional y
  conservadora** (piso 0.5h) porque todavia NO hay sprints hechos con agente en este proyecto. Se calibra
  con datos agenticos reales via `../dev-sprint-review`.
- **Ref. humana (mediana)**: tiempo real MEDIANO que tomo el arquetipo en desarrollo **humano**
  (no agentico). Sirve como **techo y referencia** para medir el speedup humano->agentico, NO como base
  de estimacion. El ratio real/estimado humano historico fue ~1.0 (ver `calibration-log.md`).

Reglas de uso de la base agentica:

- **Base por defecto = 0.5h** para arquetipos atomicos (una capa CQRS, un cambio acotado).
- **+0.5h** si la tarea es de **scope grande** (atraviesa varias capas, feature completa) o combina arquetipos.
- **Riesgo infra/config**: sumable aparte (ver seccion al final).
- Redondeo final hacia arriba a 0.5h, minimo 0.5h. Sin buffer porcentual.

## Backend (NestJS / CQRS)

| Arquetipo | Descripcion | Base agentica | Ref. humana (mediana) | N | Confianza |
|---|---|---|---|---|---|
| BE-scaffold | Setup de modulo + modelo de datos / entidades / interfaces | 0.5h | 3h | 8 | media |
| BE-repository | Repositorio (hereda BaseRepository) | 0.5h | 3h | 3 | baja |
| BE-command | Command + CommandHandler (escritura con logica) | 1.0h (scope) | 5h | 3 | baja |
| BE-query | Query + QueryHandler (lectura con mapper) | 0.5h | 5h | 3 | baja |
| BE-controller | Controller / endpoint + DTOs + Swagger | 0.5h | 2.75h | 14 | media |
| BE-service | Servicio / logica de negocio | 0.5h | 3.5h | 5 | baja |
| BE-write | Feature de escritura (crear/editar/eliminar) end-to-end | 0.5h | 3h | 18 | media |
| BE-read | Feature de lectura (listar/obtener/reporte/export) | 0.5h | 3.5h | 10 | media |
| BE-tests | Tests unit / e2e de un flujo | 0.5h | 3h | 14 | media |
| BE-migration | Migracion TypeORM / seed / backfill | 0.5h | 2h | 8 | media |
| BE-notif | Notificacion / email / plantilla (tabla notification) | 0.5h | 3h | 13 | media |
| BE-ep-file | EP / upload / procesamiento de archivos (Excel/CSV) — especifico del dominio | 1.0h (scope) | 4h | 19 | media |
| BE-integr | Integracion AWS (Lambda, S3) / servicio externo | 0.5h | 3.25h | 10 | media |
| BE-filtros | Agregar/ajustar filtros a una consulta existente | 0.5h | 2h | 1 | muy baja |
| BE-config | Config / env var / permiso / guard / auth / swagger | 0.5h | 3h | 7 | baja |
| BE-fix | Ajuste / correccion de bug / hotfix | 0.5h | 2h | 23 | media |
| BE-refactor | Refactor / mapper / tipado (preserva comportamiento) | 0.5h | 2h | 2 | muy baja |
| BE-feature-flow | Flujo de negocio completo que atraviesa varias capas (ej: "solicitar/aprobar/rechazar") | 1.0h (scope) | 2.5-4h | ~ | media |

> Nota: las medianas humanas con N<=5 (command, query, repository, service, refactor, filtros) tienen
> baja confianza; reforzar con mas muestreo en la calibracion por sprint.

## Arquetipos nuevos sin datos reales (N = "-")

Convencion para agregar un arquetipo al catalogo cuando todavia no hay ninguna tarea agentica real que lo
respalde (ej: recien incorporado desde una skill nueva): usar **N = "-"** en vez de omitir el arquetipo o
inventar un N. Marca explicitamente "sin datos reales" sin bloquear su uso (la Base sigue siendo una
hipotesis razonable, igual que el resto del catalogo antes del primer sprint agentico).

- `N = "-"` -> ninguna tarea real todavia. La primera tarea de ese arquetipo que se cierre y pase por
  `../dev-sprint-review` reemplaza el `-` por un numero (aunque sea `1`).
- `N` numerico -> tareas reales acumuladas. Sigue sin alcanzar el minimo (`N < 3`) hasta juntar al menos 3;
  recien ahi la calibracion puede mover la Base.
- Nunca volver a poner `-` una vez que hay al menos una tarea real contada.

## Correccion de bugs (capa-agnostica)

Arquetipos para la Task de correccion generada por `../dev-bug-fix-tasks/SKILL.md` (Paso 4). El
criterio es el **estado del diagnostico** al momento de estimar, no si el fix es BE o FE: aplican por
igual a ambas capas (a diferencia del resto del catalogo, que es BE en este template). Reemplazan a
`BE-fix` cuando el bug se planifico con esa skill, porque su diagnostico ya distingue certeza y esfuerzo
de verificacion; para fixes puntuales fuera de ese flujo (sin diagnostico formal), `BE-fix` sigue siendo
el arquetipo de referencia.

| Arquetipo | Descripcion | Base agentica | Ref. humana (mediana) | N | Confianza |
|---|---|---|---|---|---|
| Bug-clean | Causa raiz identificada con certeza Alta, plan de fix claro (Modo A), poco debug necesario para verificarlo | 0.5h | N/A (capa-agnostica) | - | sin datos |
| Bug-verify | Causa raiz identificada, plan claro (Modo A), pero requiere bastante verificacion/validacion antes o despues del fix | 1.0h | N/A (capa-agnostica) | - | sin datos |
| Bug-explore | Causa raiz no identificada de antemano: la Task incluye un plan de debug exploratorio (Modo B de `bug-fix-plan-format.md`) | 2.0h | N/A (capa-agnostica) | - | sin datos |

Sin banda de riesgo infra adicional salvo que el propio debug exploratorio la dispare (ver seccion
siguiente); no doble contar con la Base de `Bug-explore`, que ya asume mas incertidumbre.

## Revision de codigo (por US)

Estima el **tiempo del revisor** leyendo y comentando los PR de una US (uso tipico: antes de cerrar la
US, o al invocar `../dev-code-review/SKILL.md` en Task mode sobre varias Tasks de una misma US). Es
**distinta** de "Correccion de PRs" (abajo): esa es el rework del autor tras los comentarios, esta es el
trabajo del revisor. Una tarea de revision por US.

Se estima por **semejanza de tamano, no por formula**: extraer de los planes de desarrollo de las Tasks
de la US dos senales contables y matchear el bucket. Nunca inventar el numero.

Senales (sumando las tareas de la US, desde sus planes de desarrollo):

- **N archivos a tocar**: cantidad de archivos listados en los planes ("Archivos clave").
- **Ediciones vs nuevos**: archivos que **editan** logica existente vs archivos **nuevos**. Editar es mas
  dificil de revisar que crear; si predominan las ediciones, subir un bucket (tope Alto).

| Bucket | Cuando (inicial, ajustar con datos) | Base agentica | Ref. humana | N | Confianza |
|---|---|---|---|---|---|
| Chico | ~1-3 archivos, mayormente nuevos / cambios simples | 0.25h | N/A (por tamano) | - | sin datos |
| Medio | ~4-7 archivos, o mezcla con ediciones de logica existente | 0.5h | N/A (por tamano) | - | sin datos |
| Alto | ~8+ archivos, o predominan ediciones sobre logica existente / varias capas | 1.0h | N/A (por tamano) | - | sin datos |

Estos valores **no** estan sujetos al piso de 0.5h de las tareas de desarrollo (tienen su propia escala
de 0.25h) ni a la banda de riesgo infra/config de abajo. Los umbrales de N archivos son un punto de
partida: calibrar con los tiempos reales de revision de cada sprint.

## Riesgo infra/config (sumable)

Solo si la tarea introduce incertidumbre real de debugging en infraestructura/configuracion. Historicamente
es el unico driver de blowup. Banda **provisional** (heredada, reforzar con datos del proyecto):

| Nivel | Suma | Cuando aplica | Ejemplo |
|---|---|---|---|
| Config/cableado | +0.5h | Cablear authorizer, policy IAM nueva, ruta protegida nueva, dependencia de un servicio recien desplegado, CORS / URL base | Integracion con bug de API Gateway |
| Servicio/deploy nuevo | +1.0h | Primer authorizer, deploy de servicio AWS nuevo, debugging cross-stack | Login + Lambda authorizer + template |

No aplica si la tarea reutiliza un patron ya existente en el repo.

## Correccion de PRs

Cuando la suma de horas de **todas las tareas BE de una US** supera 4h: agregar tarea de correccion con
`horas_correccion = floor(total_horas_dev / 4)`. Aplica a nivel de US.

## Tareas de impacto

Estimar como tarea independiente con los mismos criterios. Contar en la suma para correccion de PRs.

## Anti-patrones

1. **Confundir la Ref. humana con la base agentica**: la humana es el techo del modelo viejo (~5-8x mas
   lenta). Estimar con la base agentica, no con la humana.
2. **Estimar por calculo en vez de por semejanza**: el numero sale de matchear contra arquetipos, no de sumar.
3. **Aplicar riesgo infra "por las dudas"**: solo si hay incertidumbre real y patron inexistente en el repo.
4. **Usar `BE-fix` para bugs planificados con `dev-bug-fix-tasks`**: esos ya tienen diagnostico
   (certeza + esfuerzo de verificacion); matchear contra "Correccion de bugs", no contra `BE-fix`.

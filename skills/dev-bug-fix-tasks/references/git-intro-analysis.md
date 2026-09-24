# Git Intro Analysis

Lineamientos para rastrear en que commit se introdujo un defecto o si el comportamiento nunca se implemento. Cargar este archivo durante el Paso 2 de `SKILL.md`, despues de identificar archivos candidatos.

## Objetivo

Determinar una de dos conclusiones:

| Conclusion | Significado |
|---|---|
| **Regresion por commit** | El comportamiento existio o se implemento parcialmente y un commit posterior lo rompio o lo elimino. |
| **Divergencia especificacion/implementacion** | El codigo no refleja lo que la especificacion actual requiere. Puede ser: nunca se implemento, la US cambio despues de la implementacion y el codigo no se actualizo, o las Tasks nunca capturaron ese comportamiento. |

Ambas conclusiones alimentan la causa raiz y deben documentarse en la Task.

## Fuentes de partida

El Bug no tiene commits ni PRs propios (aun no fue resuelto). El punto de entrada es el PR de la feature de la US.

Buscar el PR en este orden:

1. **PR de la US** directamente: revisar relations de la US en ADO (`ArtifactLink: Pull Request`). Es el caso mas comun.
2. Si la US no tiene PR propio: revisar PRs de las **Tasks hijas** relacionadas al flujo del bug (`ArtifactLink: Pull Request` en cada Task).

Con el PR identificado, obtener los archivos realmente modificados por la feature:

```bash
git show <merge-commit> --stat
```

Ese listado, intersectado con los archivos candidatos del Paso 1, define los **archivos core** a rastrear.

Tambien reunir: simbolos o condiciones esperadas del CA violado (ej: `kickoffAt`, `readonly`, `disabled`, `409`).

El rastreo es: inspeccionar el historial de esos archivos core antes y despues del merge.

## Seleccion de archivos core (no rastrear todo)

Antes de elegir archivos, razonar sobre la naturaleza del bug: **que CA se viola y que tipo de logica lo implementa**. Eso determina donde buscar, no una lista generica.

Ejemplos de mapeo bug → tipo de archivo:

| Tipo de violacion | Donde suele vivir |
|---|---|
| Parametro opcional que debia ser requerido | Validacion de contrato de entrada (schema, DTO, guard) |
| Estado UI incorrecto (boton, campo, visibilidad) | Componente de estado o selector que lo controla |
| Respuesta incorrecta de un endpoint | Handler / controller + logica de negocio |
| Calculo o regla de negocio erronea | Servicio o dominio |
| Dato persistido mal | Repositorio o mapper |
| Test que no detecta la regresion | Archivo de test del escenario |

Con ese razonamiento, seleccionar **1–3 archivos** del listado del `git show --stat` del PR que correspondan al tipo de logica violada. Si el bug cruza FE+BE, un core por capa.

Descartar: presentational puro, estilos, barrel exports, configs genericas, archivos generados.

Ampliar solo si el rastreo de los core seleccionados no alcanza para determinar la causa.

## Procedimiento por archivo core

Ejecutar en el repositorio indicado en el config (`Base branch` como referencia).

### 1. Anclar el merge commit de la feature

El ancla es el merge commit del PR de la US (o de la Task hija si la US no tiene PR propio), obtenido en "Fuentes de partida". Ese commit separa "implementacion original" de "cambios posteriores".

```bash
git log --oneline --follow -- <ruta-archivo>
```

Marcar en el historial: commits **del PR de la feature** vs commits **posteriores** al merge (otros fixes, refactors, otras features).

Caso frecuente: la Task se implemento bien y un commit posterior modifico la misma zona y rompio el CA.

### 2. Buscar introduccion o cambio del comportamiento

Si se conoce un termino clave del fix esperado:

```bash
git log -S "<termino-clave>" --oneline -- <ruta-archivo>
```

Alternativa por contenido:

```bash
git log -G "<patron-regex>" --oneline -- <ruta-archivo>
```

Priorizar hits **posteriores al ancla** de la feature: ahi suele estar la regresion.

### 3. Autoria de las lineas sospechosas (partes core)

Acotar `blame` a la condicion/bloque que falla, no al archivo entero:

```bash
git blame -L <linea-inicio>,<linea-fin> -- <ruta-archivo>
```

Anotar commit, autor y fecha. Si el blame cae en un commit **despues** del ancla → hipotesis fuerte de regresion por cambio futuro.

### 4. Diff del commit candidato

```bash
git show <commit-hash> -- <ruta-archivo>
```

Analizar que cambio: condicion eliminada, validacion omitida, estado UI incorrecto, etc. Confirmar si el commit anterior al sospechoso aun tenia el comportamiento correcto:

```bash
git show <commit-anterior>:<ruta-archivo>
```

### 5. Comparar con el plan de la Task

Cruzar el diff con el plan de desarrollo de la Task hija implicada:

- Si el plan pedia el comportamiento y el commit de la feature nunca lo incluyo → **Divergencia especificacion/implementacion** (subtipo: nunca implementado).
- Si la US fue modificada despues del merge y el codigo no se actualizo → **Divergencia especificacion/implementacion** (subtipo: US cambio post-implementacion).
- Si el commit de la feature lo implemento bien y un commit **posterior** (otro fix/feature/refactor) lo removio o altero → **Regresion por commit** → refuerza **Fallo en ejecucion/revision** o **Falta de tests**.

## Criterios de clasificacion

### Regresion por commit

Incluye el caso: implementacion original correcta + codigo futuro lo rompio.

Indicadores:
- En el ancla de la feature el comportamiento estaba correcto (`git show` del merge o commit de la Task).
- `git blame` / `git log -S` apunta a un commit **posterior** (otro fix, refactor, feature).
- `git show` del commit posterior muestra que se elimino/modifico la condicion, validacion o renderizado correcto.

Documentar:
- Hash corto del commit introducctor de la regresion (`abc1234`).
- Autor y fecha.
- Resumen del cambio en 1-2 oraciones (incluir si fue "fix/refactor posterior").
- PR asociado, si existe.
- Ancla de la feature (hash o PR) donde el comportamiento aun era correcto.

### Divergencia especificacion/implementacion

Tres subtipos posibles; documentar cual aplica:

**a) Nunca implementado**
- El codigo no contiene la logica requerida (condicion, prop, validacion, test ausentes).
- `git log -S` no encuentra el termino clave en el historial del archivo.
- El PR de la feature no incluyo el comportamiento aunque el plan lo pedia.

**b) US cambio post-implementacion**
- El codigo implementa lo que la US decia originalmente, pero la US fue modificada despues del merge.
- Los CA actuales de la US no coinciden con lo que se comiteo; el codigo refleja una version anterior.
- Indicador: fecha de la ultima edicion de la US en ADO es posterior al merge commit del PR.

**c) Tasks no capturaron el requerimiento**
- La US era clara pero las Tasks hijas no incluyeron ese comportamiento en sus planes.
- El codigo sigue lo que las Tasks pedian, no lo que la US pide.

Documentar:
- Subtipo: nunca implementado / US cambio post-implementacion / Tasks no capturaron requerimiento.
- Archivo y funcion/componente afectado.
- Que debia existir segun la US actual y que falta o difiere en el codigo.
- Task original implicada (si aplica).

## Output esperado (por archivo o por bug)

```markdown
### Rastreo git
- **Archivos core**: src/.../Component.tsx (logica readonly); descartados: styles, index
- **Ancla feature**: def5678 / PR #1200 — comportamiento correcto en ese punto
- **Conclusion**: Regresion por commit / Divergencia especificacion/implementacion (subtipo) / Indeterminado
- **Commit introducctor** (si aplica): abc1234 — autor, fecha — "mensaje" (fix/refactor posterior)
- **Cambio detectado**: se elimino condicion readonly cuando kickoffAt paso
- **PR asociado**: #1234 (si aplica)
- **Evidencia**: git blame lineas 45-52; git show abc1234; comparado con ancla
- **Certeza del rastreo**: Alta / Media / Baja
```

Si no se puede rastrear (repo no clonado, archivo renombrado sin `--follow`, historial shallow):

- Indicar **Indeterminado** y que falta para resolverlo.
- No inventar commits.

## Integracion con causa raiz

| Rastreo git | Causa raiz tipica |
|---|---|
| Regresion por commit | Causa: Fallo en ejecucion — Capa: tests ausentes si no habia regresion test |
| Divergencia: nunca implementado + plan claro | Causa: Fallo en ejecucion |
| Divergencia: nunca implementado + plan incompleto | Causa: Fallo en el plan |
| Divergencia: US cambio post-implementacion | Causa: Fallo en la US |
| Divergencia: Tasks no capturaron requerimiento | Causa: Fallo en el plan |
| Codigo cumple US literal pero QA espera mas | Causa: Fallo en la US |

El rastreo git **no reemplaza** el analisis de US/plan; lo complementa con evidencia temporal.

## Que NO decide el rastreo git

- La **cantidad** de commits de un archivo ("archivo caliente") **no** decide si hace falta un test de regresion ni clasifica la causa raiz por si sola.
- Si importa: **que** cambio el historial en las **partes core** (sobre todo commits posteriores al ancla de la feature).
- El rastreo aporta **origen temporal** (regresion vs divergencia especificacion/implementacion). La decision de test queda para el plan de correccion y la politica de `../../dev-testing-strategy/references/regression-bugs.md`; este Paso 2 no obliga aun el formato de regresion.

## Limitaciones

- Requiere el repo clonado localmente con historial suficiente (`git fetch` si hace falta).
- En monorepos, ejecutar comandos desde la raiz del repo correcto del config.
- No expandir el rastreo a todo el diff del PR: solo archivos core (1–3) y bloques de logica del CA.

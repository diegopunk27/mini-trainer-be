# Regresion de bugs → test obligatorio

Usado por `../../dev-bug-fix-tasks` (y por `../../dev-plan-execution` cuando la Task es un fix).
Complementa `decision-matrix.md`: aca el spec puede ser el **resultado esperado del bug** + CA de la US violado, no un CA nuevo de feature.

## Regla

Todo fix de bug debe dejar un test automatizado que:

1. **Falla** (o habria fallado) reproduciendo el defecto **antes** del fix.
2. **Pasa** despues del fix.

Flujo mental: fail → fix → verde.

## Donde vive el test

Elegir capa con la misma matrix + defaults BE/FE:

- Preferir la capa minima que detecte la regresion con confianza.
- No exigir E2E si un unit o integration basta.

## N/A documentado (unica excepcion)

Solo si el defecto es **infra / config / ambiente** sin comportamiento de producto testeable de forma estable (ej. mal cableado de variable en un entorno, permiso IAM puntual, dato corrupto solo en UAT).

En ese caso el plan de fix debe decir **N/A** con motivo explicito. No usar N/A por comodidad.

## Que NO decide si hay test

- Frecuencia de commits o "archivo caliente" en git.
- Que el bug sea "chico".
- Que el code review "ya lo miró".

El rastreo git (`../../dev-bug-fix-tasks/references/git-intro-analysis.md`) aporta causa raiz; **no** sustituye el test de regresion.

## Output en el diseno (plan-execution / bug-fix)

Incluir en la tabla o en el plan:

- Caso de regresion: entrada que reproducia el bug → esperado correcto.
- Archivo de test estimado.
- O `N/A` + motivo (solo excepcion de arriba).

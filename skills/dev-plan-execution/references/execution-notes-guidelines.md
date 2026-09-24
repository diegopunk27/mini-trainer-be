# Lineamientos de comentarios sobre la tarea

Que vale la pena registrar en la seccion `Notas de ejecucion` (changelog) de la Description durante la Fase 6 Parte C. Cargar este archivo antes de la Parte C.

No es una checklist cerrada: son **ejemplos de tipos de comentario** que suelen aportar valor. Usar criterio para cualquier otro comentario que no encaje en estas categorias pero sea igual de util.

## Tipos de comentario (ejemplos, no exhaustivo)

- **Bloqueantes o dudas resueltas con el usuario**: algo freno la ejecucion, se consulto y se resolvio, aunque la resolucion no haya cambiado el plan.
- **Discrepancias por informacion faltante**: la US/CA no cubria el caso concreto y hubo que definir el comportamiento sobre la marcha.
- **Decisiones tomadas sobre la marcha**: se elegio un enfoque no obvio (por que X y no Y) que conviene que quede explicado para quien lea la tarea despues.
- **Deuda tecnica identificada pero no resuelta**: algo que se noto durante la implementacion y queda pendiente como candidato a tarea futura (no se resuelve en esta).
- **Riesgos u observaciones que no bloquearon**: algo a tener presente (performance, dependencia externa inestable, comportamiento verificado solo parcialmente).
- **Contexto util para code review o re-ejecucion**: por que se hizo asi, que se probo y no funciono, aunque no cambie el plan final.

## Criterio para agregar un comentario

- Aporta valor real para quien lea la tarea despues (code review, re-ejecucion, retro de sprint) o para detectar patrones a nivel equipo.
- No es un diario de desarrollo: evitar comentarios triviales, redundantes con el plan, o que no aportarian nada si se borraran.
- Ante la duda de si algo califica, preferir preguntarle al usuario en la Parte C en vez de omitirlo o forzarlo.

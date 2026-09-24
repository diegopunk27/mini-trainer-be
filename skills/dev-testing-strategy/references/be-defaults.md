# Defaults Backend (Dev BE)

Aplicar cuando Activity es `Dev BE` o el cambio es de backend.
Complementa `decision-matrix.md` (capa minima, omit-list, anti-espejo).

## Donde va cada cosa

| Tipo de comportamiento (desde el CA) | Capa default | Notas |
|--------------------------------------|--------------|-------|
| Regla de negocio / dominio | **Unitario** del Command/Query Handler o servicio de aplicacion (CQRS) | Entrada → resultado o error de dominio. Happy path + bordes + excepciones; sin combinatoria (ver `decision-matrix.md`) |
| Validacion de reglas de negocio (no solo formato DTO) | **Unitario** de la regla / validador de dominio | Si el CA exige el comportamiento |
| Controller delgado (extiende `CqrsController`, delega a `CommandBus`/`QueryBus`) | **No** unit del controller | Se cubre al pegarle al endpoint en integracion |
| Endpoint activo (status, body, errores principales del CA) | **Integracion** | Happy path + 1-2 excepciones principales + shape de salida estable. Ver seccion Integracion abajo |
| Persistencia del agregado / efecto en DB exigido por el CA | **Integracion** (mismo test del endpoint si aplica) | Ver seccion Persistencia abajo |
| Mapper 1:1 sin logica | **Omitir** | |

## Integracion (endpoints activos)

Un test de integracion BE le pega al **endpoint activo** (framework real) y verifica:

1. **Happy path.**
2. **1-2 excepciones principales** del CA (ej: no encontrado, conflicto). No barrer todos los codigos HTTP ni todos los campos invalidos.
3. **Shape de la respuesta estable**: assert de la forma/status de la salida, para detectar cambios de contrato no intencionales.

### Validacion de entrada — como delegarla

Si el stack usa una libreria de validacion declarativa (class-validator, Zod en el boundary, FluentValidation, etc.):

- La libreria garantiza el formato de cada campo. **No** testear en integracion cada campo invalido, uno por uno.
- Alcanza con **un** test de integracion que confirme que la validacion esta conectada al endpoint (ej: un payload invalido devuelve 400), no una matriz de campos.
- Las reglas de negocio que la libreria no puede expresar (ej: "no se puede X si Y", cruces entre campos con logica) van a **unit** del dominio, no a integracion.

## Persistencia (ORM / DB)

Politica de **diseno de tests** para BE. El drift entity↔migracion (nombres, nullability a ojo) es **code review BE**, no un test por columna — no disenar tests para eso aca.

### Que SI

- Si el CA exige un efecto observable en persistencia (se guarda, se rechaza duplicado, se actualiza estado, se borra): cubrirlo en el **mismo test de integracion** del endpoint (arrange datos minimos → act sobre el endpoint → assert respuesta + estado persistido).
- Reusar el runner/DB de test del proyecto (rol / manifiestos). Preferir DB real de test o contenedor del stack; no inventar un ORM in-memory si el equipo no lo usa.

### Que NO

- Un test por columna, por indice o por constraint de migracion.
- Tests que solo verifican que "la entity tiene el campo X" o que "el decorator TypeORM existe".
- Confundir validacion de entrada (class-validator / Zod / FluentValidation) con schema de DB: son capas distintas; el CA dice cual comportamiento importa.

### Omit-list tipica (si el rol confirma ORM)

- Drift entity↔migracion → review (`../../dev-code-review/references/be-persistence-review.md`), no suite de tests.
- Nullability / tipos de columna campo a campo → review o migracion revisada, no N tests unitarios.

## Controllers delgados

Si el rol/arquitectura exige controllers que solo delegan (caso de `nestjs_cqrs_base`: controllers extienden `CqrsController` y delegan a `CommandBus`/`QueryBus`):

- No disenar unit del controller "por cobertura".
- El comportamiento del CA se prueba en el command/query handler (unit) y en el endpoint (integracion) segun la tabla de arriba.

## Validacion de entrada vs negocio

- Formato / presencia en el boundary ya cubierta por el stack de validacion → un solo caso de integracion la confirma; el resto va a omit-list (ver `decision-matrix.md`), salvo que el CA describa un mensaje o codigo de error concreto a garantizar.
- Reglas de negocio ("no se puede X si Y") → unit del dominio / use case (command/query handler).

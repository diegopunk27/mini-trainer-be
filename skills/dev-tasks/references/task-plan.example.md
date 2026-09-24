# Ejemplo de plan de desarrollo + estimacion

Ejemplo de referencia (stack backend CQRS). Usar solo si el formato de salida no esta claro. Adaptar al stack real del repo.

## Tarea: Update director (PATCH `/directors/:id`) con reglas de edicion y tests

### 1. Archivos clave a analizar

- `create-director/*`: patron reutilizable para scaffold de edicion.
- `directors.controller.ts` / `directors.module.ts`: registro del endpoint y wiring CQRS.
- Repositorio de directors y su relacion con movies: validacion de duplicidad e impacto en consumidores.

### 2. Reglas de arquitectura aplicables

- Reglas de arquitectura del repo que apliquen a commands CQRS y validators de negocio.

### 3. Cambios a realizar

1. Scaffold `update-director` (command dto, response dto, constantes).
2. Handler + wiring CQRS + endpoint `PATCH /directors/:id` + registro en modulo.
3. Validator de negocio (404, 400 por bloqueo nombre/apellido, 409 duplicidad, trim).
4. Repositorio para edicion (byId, asociacion peliculas, duplicidad excluyendo id, persist update).
5. Mapper entrada/salida con datos normalizados + `updatedAt`.

### 4. Flujos a validar por el desarrollador

- Editar director sin peliculas asociadas (happy path).
- Editar director inexistente (404).
- Regresion: listado de peliculas tras editar director.

### 5. Estimacion

Por semejanza contra el catalogo de arquetipos (`../../dev-estimation/references/archetype-catalog.md`). No calcular desde cero.

- **Capa**: BE
- **Arquetipo**: BE-write (feature de escritura crear/editar/eliminar end-to-end, N=18) -> base 0.5h
- **Riesgo infra/config**: No aplica (reutiliza el patron de `create-director`; sin infra ni config nueva)
- **Subtotal**: 0.5h
- **Estimacion final** (redondeo 0.5h hacia arriba): **0.5h**
- **Riesgos principales**: definicion final PATCH vs PUT, complejidad real de la query de duplicidad excluyendo id, setup de datos para tests de asociacion con movies.
- **Δ ajuste**: —

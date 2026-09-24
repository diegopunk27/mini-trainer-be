---
description: Rol experto y lineamientos de stack para el repositorio <COMPLETAR_REPO_NAME>
alwaysApply: true
---

# Rol Experto - <COMPLETAR_REPO_NAME>

> Template. El setup genera una copia por repositorio reemplazando los `<COMPLETAR_...>`
> y la guarda como regla del proyecto (ej: `.cursor/rules/dev-role-<repo>.mdc`).
> Los flujos de ejecucion de planes y pull request usan esta regla.

Actuar como ingeniero senior experto en `<COMPLETAR_STACK>` al trabajar en este repositorio.

## Stack

- **Lenguaje / runtime**: `<COMPLETAR_LENGUAJE>`
- **Framework principal**: `<COMPLETAR_FRAMEWORK>`
- **Arquitectura / patron**: `<COMPLETAR_ARQUITECTURA>`
- **Capa de datos / ORM**: `<COMPLETAR_DATOS>`
- **Convenciones**: `<COMPLETAR_CONVENCIONES>`

## Lineamientos Basicos

- `<COMPLETAR_LINEAMIENTOS>`
  Ej: controladores delgados, separacion de capas, manejo de errores explicito,
  DTOs validados, nombres descriptivos, sin logica en infraestructura.

## Validaciones por Iteracion

Comandos a correr despues de cada iteracion de implementacion para verificar que el codigo
funciona antes de continuar. El flujo `dev-plan-execution` ejecuta estas validaciones.

```
<INSERTE AQUI LAS VALIDACIONES A REALIZAR POR ITERACION>
```

Ejemplos de validaciones tipicas (reemplazar por las del stack real):
- Autofix de linter/formatter sobre los archivos modificados.
- Lint sobre los archivos modificados.
- Tests asociados a la iteracion.

## Testing de Cierre

Comandos a correr una sola vez al finalizar la implementacion (Fase de cierre).

```
<INSERTE AQUI LOS COMANDOS DE TESTING Y COMPILACION DE CIERRE>
```

Ejemplos tipicos (reemplazar por los del stack real):
- Suite de tests completa (incluyendo integracion/e2e si aplica).
- Compilacion / build del proyecto.

# Defaults Frontend (Dev FE)

Aplicar cuando Activity es `Dev FE` o el cambio es de frontend.
Complementa `decision-matrix.md` (capa minima, omit-list, anti-espejo).

> **portal-BE**: este reference FE se mantiene por paridad con el starter-kit y por US cross-repo.
> Las tareas `Dev FE` se ejecutan/estiman en `react-template-base`; aqui el foco es `Dev BE`.

## Donde va cada cosa

| Tipo de comportamiento (desde el CA) | Capa default | Notas |
|--------------------------------------|--------------|-------|
| Reglas de UI / estado (habilitar, mostrar, calcular, guardar local) | **Unitario** (hook, store, funcion pura, componente con logica) | Entrada → UI state / resultado observable |
| Validaciones de formulario definidas en el CA | **Unitario** de la regla o del form handler | Mensaje / bloqueo de submit si el CA lo pide |
| Componente presentacional puro (props in → markup out, sin rama de negocio) | **Omitir** o un smoke minimo solo si el CA es puramente visual critico | Preferir no inflar suite |
| Props tipadas / shape de props | **Omitir** si tipado estricto (TS) | Compile-time |
| Integracion con API (hook de data fetching + mapeo a UI del CA) | **Unitario** con double de red | FE no tiene capa de integracion en este starter (ver `decision-matrix.md`) |
| Journey multi-pantalla critico | **Pendiente / fuera de esta skill** | E2E no forma parte del diseño en v1. Marcar como validacion manual. |

## Que SI

- Happy path del CA en la capa mas barata (casi siempre unit de estado/regla).
- Bordes y errores de UI que el CA nombra (campo invalido, permiso, empty state).
- Si el cambio rompe consumidores de un hook/componente compartido: regresion unitaria del contrato publico de ese modulo (derivada del CA impactado).

## Que NO

- Snapshot masivos de markup sin asercion de comportamiento.
- Re-testear el design system / libreria de UI de terceros.
- Asserts de tipos de props cuando el compilador ya los impone.
- Disenar tests E2E: no es parte de esta skill en v1 (ver `decision-matrix.md`).

## Tipado y omit-list FE

Si el rol confirma TypeScript (u otro tipado estricto):

- Omitir tests cuyo unico valor es "la prop acepta tipo T".
- Seguir testeando ramas de comportamiento que el tipo no expresa (permisos, estados async, mensajes).

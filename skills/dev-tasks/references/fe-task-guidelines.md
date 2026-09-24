# Lineamientos de tareas Frontend

Criterios especificos para tareas `Dev FE` en la skill `dev-tasks`.

## Testing (diseno de tests)

Ver `../../dev-testing-strategy/references/fe-defaults.md` para defaults de capa y omit-list FE.

## Division maquetado / integracion (obligatorio)

Cuando la feature conecta con un endpoint BE, **siempre** crear dos tareas separadas:

- **FE-XXX Maquetado**: estructura de componentes, layout, UI completa y flujo de navegacion. La integracion con el BE se mockea (datos hardcodeados o fixture). Puede ejecutarse en paralelo con las tareas BE.
- **FE-XXX Integracion**: reemplazar el mock por la llamada real al endpoint, manejo de estados de carga/error y validacion del flujo completo contra el BE real. Depende de que la tarea BE correspondiente este cerrada.

Excepcion: si la tarea FE es puramente visual y no tiene integracion BE (ej: refactor de estilos, componente estatico), no aplicar esta division.

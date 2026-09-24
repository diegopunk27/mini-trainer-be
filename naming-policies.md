# NOMENCLATURA DEL PROYECTO

- **Archivos y carpetas**: kebab-case (lowercase con guion como separados). Si pertenece a un tipo de identidad génerica colocarle .Identidad.ts al archivo. Usar singular
  Ejemplo servicio : student.service.ts
  Ejemplo carpeta para handler : add-student.command.ts
- **Endpoints**: Recurso en plural en snakeCase
  Ejemplo: /userHistories
- **Clases/interfaces**: PascalCase (comienza con mayuscula y lleva una mayuscula por cada separador). En caso de ser una clase que representa una abstracción por ejemplo strategies, colocar la palabra al final
  Ejemplo : UserHistory
  Ejemplo strategy : ClaudeChatbotStrategy

- **metodos/funciones** : camelCase tanto nombre como parametros de la función
  Ejemplo : getById

- **variables y propiedades** : camelCase
  Ejemplo: userId

- **Constantes** : capital case con separador guion bajo
  Ejemplo : PROMPT_TEMPLATE

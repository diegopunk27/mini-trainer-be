# Root Cause Guidelines

Lineamientos para analizar la causa raiz de un bug. El analisis tiene dos partes:

1. **Causa del defecto**: que ocurrio concretamente para que el bug existiera.
2. **Red de seguridad que pudo haberlo evitado**: que mecanismo ausente o insuficiente lo dejo pasar.

**Regla de certeza**: solo formular causa si la certeza es Alta. Certeza Media: presentar como hipotesis con caveats explicitos. Certeza Baja o Media-Baja: no formular — indicar directamente que no hay evidencia suficiente y volver al Paso 2 con el usuario.

---

## Parte 1 — Causa del defecto

Razonar libremente sobre que ocurrio. No hay categorias fijas: describir la causa en terminos concretos a partir de la evidencia (codigo, plan, US, git).

Preguntas guia para el razonamiento:

- El comportamiento esperado, estaba especificado en la US?
- La US cambio despues de que se implemento la feature? El codigo refleja la version anterior?
- El plan de la Task cubria ese comportamiento? O habia un mismatch entre lo que la US pedia y lo que el plan definio?
- El plan era correcto pero el codigo se desvio? Un commit posterior altero lo que estaba bien?
- El comportamiento nunca estuvo en el codigo o estuvo y se rompio?

Ejemplos de causas posibles (no son categorias exhaustivas):

- La US no especificaba el comportamiento y QA lo espera — vacio de requerimiento.
- La US fue modificada post-implementacion y el codigo refleja la version anterior — desactualizacion.
- El plan de la Task no incluyo el paso o la validacion — mismatch entre US y plan.
- El codigo no siguio el plan — fallo de ejecucion.
- Un commit posterior (otro fix, refactor, feature) rompio algo que estaba correcto — regresion.
- Combinacion de las anteriores: ej. plan incompleto + codigo que tampoco lo suplanta.

Documentar:

- Descripcion libre de la causa (que paso, en que archivo/capa, desde cuando si git lo confirma).
- Evidencia concreta que la sostiene (codigo, diff, plan, CA violado).
- **Como se verifico**: pasos de reproduccion (o evidencia equivalente) que confirman que esa causa, y no otra, produce el defecto. No alcanza con el razonamiento; hay que poder mostrar el punto de falla reproducido (ej: reproducir el escenario y observar el valor/estado puntual que prueba la causa).
- Certeza: **Alta** para continuar, **Media** solo como hipotesis marcada, **Baja/Media-Baja** no formular.

Si la certeza no es Alta: indicar explicitamente *"No hay evidencia suficiente para determinar la causa con certeza. Se requiere mas investigacion."* y volver al Paso 2.

---

## Parte 2 — Red de seguridad que pudo haberlo evitado

Independiente de la causa: que mecanismo hubiera detectado o prevenido el bug antes de llegar a produccion. Solo documentar si hay evidencia clara de que fallo; no especular.

Ejemplos (no son categorias fijas):

- **Cobertura de tests**: un test del escenario del bug hubiera fallado en CI y expuesto el problema antes del merge.
- **Code review**: el reviewer podia haber detectado la desviacion entre el plan y el codigo, o el CA violado.
- **Actualizacion de documentacion**: si la US cambio, re-planificar las Tasks hubiera evitado que el codigo quedara desactualizado.
- **Revision del plan antes de ejecutar**: un plan incompleto que se revisa antes de implementar hubiera cerrado el gap.
- **Linters o validaciones estaticas**: si el error es tipico de tipo, contrato o estructura, una regla de lint o schema validation lo hubiera atrapado en compilacion.

Documentar para cada mecanismo que aplique:

- Que hubiera detectado el bug.
- Por que no lo detecto (ausencia, gap de cobertura, no revisado).

Si no hay evidencia clara de que algun mecanismo fallo, indicar: *"No se identifica una red de seguridad especifica que hubiera podido evitarlo con la informacion disponible."*

---

## Rastreo Git (alimenta la causa)

Complemento del analisis cuando hay repo clonado. Procedimiento en `git-intro-analysis.md`.

Dos conclusiones posibles:

| Conclusion | Descripcion |
|---|---|
| **Regresion por commit** | Un commit posterior al merge de la feature rompio o elimino el comportamiento correcto. |
| **Divergencia especificacion/implementacion** | El codigo no refleja lo que la especificacion actual requiere. Subtipos: nunca implementado / US cambio post-merge / Tasks no capturaron el requerimiento. |

El rastreo aporta evidencia temporal que alimenta el razonamiento de la causa; no la reemplaza.

La frecuencia de commits del archivo **no** decide si corresponde un test ni clasifica la causa. Ver `git-intro-analysis.md`.

---

## Evaluacion de Rules del Proyecto

Evaluar si el bug expone un gap sistemico en las rules del repo. **No modificar rules automaticamente.**

Solo proponer cambio en rules si el bug demuestra un patron repetible que una rule hubiera prevenido.

Output en la Task:

```markdown
### Causa del defecto
- **Descripcion**: [razonamiento libre y concreto — solo si certeza Alta o Media marcada]
- **Certeza**: Alta / Media (hipotesis) / Sin evidencia suficiente
- **Evidencia**: [bullets concretos: archivo, diff, CA, plan]
- **Como se verifico**: [pasos de reproduccion o evidencia equivalente que confirmaron la causa]

### Red de seguridad que pudo haberlo evitado
- [mecanismo]: [como hubiera detectado el bug y por que no lo hizo]
- [o "No se identifica una red de seguridad especifica con la informacion disponible"]

### Evaluacion de rules
- **Modificar rules**: Si / No / Evaluar con el equipo
- **Rules candidatas**: [lista o "Ninguna"]
- **Motivo**: [1-2 oraciones]
```

# PRD — Mini-Trainer

SaaS multi-tenant para entrenadores personales, estudios y coaches online. La referencia funcional es Harbiz (páginas de producto, centro de ayuda y reseñas de Trainerize, Everfit y TrueCoach). El mercado inicial es Argentina.

## Personas

| Persona | Quién es | Dónde entra |
| --- | --- | --- |
| Owner | Entrenador o dueño del estudio | Backoffice |
| Colaborador | Staff con permisos granulares | Backoffice |
| Cliente | Alumno | PWA |
| Admin de plataforma | Nosotros | Operación interna, no es una pantalla del MVP |

## Decisiones de producto ya cerradas

- Multi-tenant: una organización, y `organization_id` en cada tabla del tenant.
- La PWA del alumno usa el mismo stack (React 19 + Vite) y vive en un repo aparte del backoffice.
- Pagos online no entran en el MVP. En el MVP solo se registran pagos manuales. El puerto `PaymentProvider` (Mercado Pago, después Stripe) es posterior.
- Mercado: `es-AR`, `ARS`, `America/Argentina/Buenos_Aires`. Cada organización configura zona horaria, moneda y unidades. Los mensajes viven en archivos para sumar idiomas después.
- La IA no está en el camino crítico. Llega después, siempre asíncrona y opt-in.

## 1. Dentro del MVP

### Identidad y equipo

- **ID-01.** El owner registra la organización, con trial y límite de clientes activos.
- **ID-02.** Login separado para profesionales y clientes (audiencias JWT distintas), refresh token rotativo y recuperación de contraseña.
- **ID-03.** El mismo email puede ser cliente en N organizaciones o staff en otra. Hay selector y cambio de cuenta.
- **ID-04.** Invitación de colaboradores con permisos granulares: ver contacto, ver datos de salud, crear, editar y archivar clientes, alcance de la biblioteca (propia / propia + admin / toda), gestionar agenda, ver otros calendarios, gestionar bonos y registrar pagos. Solo el owner toca configuración, equipo y facturación.

### Clientes

- **CLI-01.** Pestañas Activos / Invitados / Archivados / Leads. Filtros por tag, profesional, estado y fecha de alta. Búsqueda. Acciones masivas: asignar tags, profesionales o programa, y archivar.
- **CLI-02.** Alta manual (con o sin acceso a la app), invitación por email, o link de invitación con tags, programa y profesional precargados, más límite de usos y vencimiento.
- **CLI-03.** Onboarding en la PWA: objetivo, teléfono, peso, altura, género, PAR-Q y consentimiento.
- **CLI-04.** Ficha: datos personales, salud (lesiones, alergias, condiciones, medicación, PAR-Q), notas, documentos, profesionales asignados y tags.
- **CLI-05.** Archivar libera el cupo del plan y conserva los datos. Eliminar es otra acción.
- **CLI-06.** Estados calculados, no guardados: Invitado, En espera, Activo, En riesgo (cumplimiento menor a 50 % en 14 días) y Cerrado.
- **CLI-07.** Alertas en Inicio: clientes sin nada programado, inactivos 7 días, bajo cumplimiento, invitaciones pendientes y bonos por vencer.

### Entrenamiento

- **ENT-01.** Biblioteca: catálogo global (free-exercise-db, dominio público) más ejercicios propios. Campos: nombre, video de YouTube/Vimeo o imagen, instrucciones, músculos principales y secundarios, equipamiento, categoría, dificultad, mecánica y tipo de registro (peso×reps, reps, tiempo, distancia). Búsqueda tolerante a errores, filtros, favoritos y duplicar un ejercicio global.
- **ENT-02.** Constructor de rutinas. Modo normal: bloques simples, superseries y circuitos con rondas. Cada ejercicio tiene series con reps o rango, tiempo, distancia, carga, %1RM, RPE o RIR, tempo, descanso y notas. Modo simple: texto libre.
- **ENT-03.** Calculadora de 1RM.
- **ENT-04.** Programas por semanas y días. Día 1 es la fecha de asignación. Tipos de tarea: rutina, cardio, video, documento, registrar métricas, nota.
- **ENT-05.** Asignación manual, masiva o por tag, con fecha de inicio. Se asigna una copia. Al editar el programa se puede actualizar para todos o solo la biblioteca. Se puede encadenar el programa siguiente y auto-archivar al cliente X días después del fin.
- **ENT-06.** Calendario del cliente: tareas sueltas, mover y editar. La tarea editada queda marcada como personalizada.
- **ENT-07.** Registro en la PWA, en lista o paso a paso. Reps × carga por serie. Estado por ejercicio: completado, incompleto o no realizado. Timer de descanso, RPE de la sesión, valoración 1–5 y comentario. Funciona sin conexión.
- **ENT-08.** El profesional ve los registros sin refrescar y puede cargar un registro en nombre del cliente.

### Progreso

- **PRG-01.** 15 métricas por defecto (peso, porcentaje de grasa y 13 perímetros) más métricas propias. Las carga el cliente, el staff o una tarea programada. Hay objetivos por métrica.
- **PRG-02.** Fotos de progreso (frente, perfil, espalda) con comparación entre fechas. Se elimina el EXIF.
- **PRG-03.** Récords por ejercicio (1RM estimado con Epley). Volumen por ejercicio y por grupo muscular, y RPE promedio. Períodos: semana, mes, 3 meses y año. Exportación a CSV/Excel.
- **PRG-04.** Unidades métricas o imperiales por usuario. En la base todo se guarda en sistema métrico.

### Agenda y reservas

- **AGE-01.** Ubicaciones y tipos de sesión (grupal o turno 1:1), con color, duración y cupo por defecto.
- **AGE-02.** Sesiones grupales: presencial u online (con link), organizador, cupo, lista de espera, visibilidad (todos / por tags / privada) y portada. Recurrencia diaria o semanal, con intervalo, días de la semana y fin por fecha o cantidad. Edición de solo esta, esta y las siguientes, o todas. Cancelación con aviso a los inscriptos.
- **AGE-03.** Turnos 1:1: disponibilidad semanal por profesional, con excepciones, buffers y anticipación mínima y máxima. Los horarios libres se calculan al vuelo. La base impide el doble turno.
- **AGE-04.** Bloqueos privados y reuniones internas.
- **AGE-05.** Política de reservas: ventana (todas las fechas futuras / N días / día siguiente / mes actual) y corte X minutos antes del inicio. Cancelar a tiempo devuelve el crédito; tarde lo pierde. El no-show también consume el crédito. Máximo de reservas activas y visibilidad de la lista de asistentes. Recordatorio N minutos antes y aviso al organizador.
- **AGE-06.** Calendario del profesional: mes, semana, día y lista. Filtros por profesional, ubicación y tipo. Panel lateral por sesión con asistentes, lista de espera, check-in y no-show.
- **AGE-07.** Lista de espera FIFO, con promoción automática. Si el siguiente no tiene créditos se lo saltea y se le avisa.
- **AGE-08.** Bonos: cantidad de créditos o ilimitado, y tipos de sesión que cubre. Vencimiento en fecha fija o a N días. Recarga semanal o mensual. Asignación manual con pago manual (efectivo, transferencia u otro). Al reservar se descuenta del bono que vence primero. Ajustes manuales e historial en un ledger.
- **AGE-09.** Log de actividad (quién reservó, canceló, entró en espera o editó) y métricas de asistencia.

### Notificaciones del MVP

Email: invitaciones, recuperación de contraseña, recordatorios, avisos al organizador y promoción desde la espera. Bandeja de notificaciones en la app.

## 2. Después del MVP, en orden de valor

| Fase | Alcance |
| --- | --- |
| P9 | Puerto `PaymentProvider`: Mercado Pago (Checkout Pro y suscripciones) y después Stripe. Planes, productos, cupones y tienda. Webhooks idempotentes, reembolsos y reintentos. Facturación electrónica ARCA/AFIP en un puerto aparte (`InvoicingProvider`). |
| P10 | Chat 1:1 con media y audio, difusión, Web Push, resumen diario a las 07:30 y límite de mensajes. |
| P11 | Formularios y automatizaciones por tag o compra. |
| P12 | Nutrición: alimentos, planes, macros, TMB y lista de compras. |
| P13 | Comunidad y logros: grupos, rachas, hitos, insignias y referidos. |
| P14 | Dashboards de negocio: finanzas, bajas, asistencia y cumplimiento. |
| P15 | IA asíncrona y opt-in: borradores de rutinas y un asistente acotado al tenant. |
| P16 | Landing del profesional, con leads y píxeles. |
| P17 | Wearables por OAuth (Strava, Garmin, Fitbit). HealthKit y Health Connect requieren Capacitor. |
| P18 | White-label: dominio, íconos, emails, apps de tienda, más idiomas y monedas. |

## 3. Fuera del MVP a propósito

- Chat, pagos online, nutrición, formularios propios y automatizaciones.
- Aprobación del contenido que crean los colaboradores.
- Hosting propio de videos. Se usan links de YouTube o Vimeo.
- Registro de clientes sin invitación. Solo invitación o link.
- Integración con calendarios externos.

## 4. Criterio de listo del MVP

Un entrenador registra su estudio, invita a un colaborador con permisos limitados y a un cliente, arma una rutina y un programa, el alumno lo registra en la PWA incluso sin conexión, y el profesional ve el registro y el récord sin refrescar. Hay agenda con cupo, bonos, lista de espera y recordatorio. Los datos de otra organización no se ven. El ledger de créditos cuadra.

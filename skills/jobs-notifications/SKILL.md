# Jobs y notificaciones

---
name: jobs-notifications
description: >
  Encolar jobs y notificaciones dentro de la transaccion de Postgres. Trigger: Al agregar recordatorios, vencimientos, materializacion de series o envio de email.
license: MIT
metadata:
  author: template-team
  version: "1.0.0"
  scope: [root]
  auto_invoke:
    - "Enqueueing a background job"
    - "Sending an email or in-app notification"
---

## Reglas

1. Los jobs pasan por `JobQueuePort`. La implementacion del MVP es pg-boss, en el mismo Postgres. Ver [ADR-0005](../../docs/adr/0005-pg-boss.md).
2. Encola en la misma transaccion que el cambio de negocio. Si la reserva hace rollback, el recordatorio no se encola.
3. "Ahora" sale de `ClockPort`. Los tests no leen el reloj del sistema.
4. `NotificationService.notify` escribe la fila y encola el envio. Canales del MVP: email (Handlebars, branding de la organizacion) e in-app. Push llega en P10.
5. Un job que depende de un estado (`booking.reminder`) vuelve a leer ese estado antes de actuar.
6. No uses `@nestjs/schedule` para trabajo que no puede duplicarse entre instancias.

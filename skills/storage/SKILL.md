# Storage

---
name: storage
description: >
  Subir archivos privados por organizacion y borrar EXIF de las fotos. Trigger: Al subir fotos de progreso, documentos, logos o imagenes de ejercicios.
license: MIT
metadata:
  author: template-team
  version: "1.0.0"
  scope: [root]
  auto_invoke:
    - "Uploading a file or progress photo"
    - "Generating a signed file URL"
---

## Reglas

1. El codigo habla con `StoragePort`. `STORAGE_DRIVER` elige S3 (MinIO en dev) o el adapter local de tests.
2. La clave es `org/{organizationId}/...`.
3. Multer, maximo 10 MB, y validacion de magic bytes.
4. `sharp` borra el EXIF, incluido el GPS, y genera un webp de 1600 px mas un thumbnail de 400 px.
5. El bucket es privado. Las URLs firmadas duran 10 minutos y no se cachean en la PWA.
6. Salud, PAR-Q y fotos son datos sensibles. El acceso pasa por permisos, no por una URL publica.

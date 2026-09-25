# Sistema de Gestión Hotelera — Backend

> **Tipo de proyecto:** Proyecto principal / sistema funcional

Backend para un sistema de gestión hotelera desarrollado con **Node.js**, **Express** y **Oracle Database**.

Es el proyecto más completo de este perfil y cubre distintos procesos de operación hotelera mediante una API REST organizada por módulos.

## Tecnologías

- Node.js
- Express
- Oracle Database / PL/SQL
- JWT
- bcrypt
- Express Validator
- Swagger / OpenAPI
- CORS
- dotenv

## Funcionalidades principales

- Autenticación con JWT
- Control de acceso por roles
- Gestión de hoteles
- Gestión de huéspedes
- Habitaciones y tipos de habitación
- Tarifas
- Reservas
- Check-in y check-out
- Pagos
- Servicios adicionales
- Experiencias
- Membresías y fidelización
- Calificaciones y reseñas
- Documentación de API con Swagger

## Arquitectura

```text
routes/
controllers/
services/
middleware/
config/
utils/
server.js
```

El proyecto separa rutas, controladores, servicios y middleware para mantener organizada la lógica de negocio.

## Ejecución

```bash
npm install
npm start
```

La configuración sensible, como credenciales de base de datos y claves JWT, debe mantenerse en un archivo `.env` local.

## Estado del proyecto

El detalle de módulos e implementación está disponible en:

[ESTADO_PROYECTO.md](./ESTADO_PROYECTO.md)

## Seguridad

- Contraseñas protegidas con bcrypt
- Autenticación mediante JWT
- Autorización basada en roles
- Validación de datos de entrada
- Configuración sensible mediante variables de entorno

---

**Autor:** Miguel Martínez

# Hotel Management Backend

Backend API for a hotel management system built with **Node.js**, **Express** and **Oracle Database**.

The project covers core hotel operations such as authentication, users, hotels, guests, rooms, rates, reservations, payments and additional services.

## Tech Stack

- Node.js
- Express
- Oracle Database / PL/SQL
- JWT
- bcrypt
- Express Validator
- Swagger / OpenAPI
- CORS
- dotenv

## Main Features

- JWT authentication and role-based access
- Hotel and room management
- Guest management
- Reservations and availability
- Check-in / check-out workflows
- Rates and seasonal pricing
- Payments
- Additional services and experiences
- Membership and loyalty features
- Ratings and reviews
- Swagger API documentation

## Architecture

```text
routes/
controllers/
services/
middleware/
config/
utils/
server.js
```

The project separates routing, request handling and business/database logic to keep the API maintainable.

## Getting Started

```bash
npm install
npm start
```

Create a local `.env` file for database credentials, JWT configuration and other environment-specific values.

## Project Status

A detailed implementation breakdown is available in [ESTADO_PROYECTO.md](./ESTADO_PROYECTO.md).

## Security

- Password hashing with bcrypt
- JWT-based authentication
- Role-based authorization
- Input validation
- Environment-based secrets

Do not commit credentials or production secrets.

---

**Author:** Miguel Martínez

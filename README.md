# 🛒 Purchase Management API

A full-stack purchase management system built to learn and demonstrate backend development concepts beyond a traditional CRUD application.

The project focuses on real-world business logic such as order lifecycle management, inventory reservation, authentication, automated expiration of orders, API testing, and cloud deployment.

The frontend was built with React, Vite and TypeScript, while the backend was developed with Express, Prisma and PostgreSQL.

---

## 🚀 Live Demo

### Frontend
> Add your Vercel URL here

### API
> Add your Azure API URL here

### API Documentation
> Add your Swagger URL here

---

## 📌 Features

### Authentication

- User registration
- User login
- JWT authentication
- Protected routes

### Products

- Product listing
- Inventory availability

### Orders

- Create orders
- Add products to an order
- Automatic stock reservation
- Cancel orders
- Simulated payment
- Order lifecycle management

### Inventory

- Available stock tracking
- Reserved stock tracking
- Automatic stock restoration after order expiration

### Background Jobs

- Automatic expiration of unpaid orders
- Automatic inventory restoration

### Security

- JWT Authentication
- Rate Limiting
- Request validation
- Centralized error handling

### Testing

- API integration tests
- Jest
- Supertest

---

# 🏗️ Architecture

The project follows a layered architecture to separate responsibilities.

```
Client
   │
Routes
   │
Controllers
   │
Services
   │
Repositories
   │
Prisma ORM
   │
PostgreSQL
```

Business logic lives inside the Service layer while Controllers remain thin and only orchestrate requests and responses.

---

# 📁 Project Structure

```
src
│
├── config
├── controllers
├── middlewares
├── repositories
├── routes
├── services
├── jobs
├── utils
├── prisma
├── tests
├── app.js
└── server.js
```

---

# 🛠️ Tech Stack

## Backend

- Node.js
- Express
- Prisma ORM
- PostgreSQL
- JWT
- Jest
- Supertest
- Swagger/OpenAPI
- node-cron

## Frontend

- React
- Vite
- TypeScript

## Cloud

- Microsoft Azure
- Azure Load Balancer
- Azure Database for PostgreSQL Flexible Server
- Vercel

---

# 🔄 Order Lifecycle

```
CREATED
    │
    ▼
RESERVED
    │
 ┌──┴────────────┐
 │               │
 ▼               ▼
PAID         EXPIRED
 │               │
 ▼               ▼
Completed   Stock Restored
```

---

# 🧠 Business Rules

- Orders start with the `CREATED` status.
- Products can only be added if enough stock is available.
- Stock is reserved when products are added to an order.
- Orders automatically expire after a configurable period.
- Expired orders restore reserved inventory.
- Paid orders cannot be modified.
- Cancelled or expired orders cannot be paid.

---

# 🧪 Running Tests

```bash
npm test
```

or

```bash
npm run test
```

---

# 📖 API Documentation

Swagger documentation is available at:

```
/api-docs
```

---

# ⚙️ Installation

Clone the repository

```bash
git clone https://github.com/your-user/your-repository.git
```

Install dependencies

```bash
npm install
```

Create your environment variables

```env
DATABASE_URL=
JWT_SECRET=
PORT=
```

Run migrations

```bash
npx prisma migrate deploy
```

Seed the database

```bash
npm run seed
```

Start development server

```bash
npm run dev
```

---

# 📚 What I Learned

This project was designed as a learning exercise to explore backend concepts commonly found in production systems, including:

- Layered architecture
- Business logic separation
- Authentication & Authorization
- Inventory management
- Order state machines
- Database transactions
- Background jobs
- REST API design
- Automated testing
- API documentation
- Cloud deployment on Azure

---

# 📄 License

This project is available for educational and portfolio purposes.

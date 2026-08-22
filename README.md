# GrabGear 🏕️🚴‍♂️
**"Rent Sports & Outdoor Gear Instantly"**

GrabGear is a robust RESTful backend API for a sports and outdoor equipment rental service. It connects **Customers** who want to rent gear with **Providers** who manage their inventory, while **Admins** oversee the platform. 

The API is fully documented using Swagger and includes secure role-based authorization, automated payments via Stripe, and strict data validation.

---

## 🚀 Live Demo & Documentation
- **Live API URL:** `https://backend-gear-up-prisma-stripe.vercel.app/api/v1`
- **Interactive Swagger Documentation:** [Swagger UI](https://backend-gear-up-prisma-stripe.vercel.app/api-docs)

---

## 🛠️ Tech Stack
- **Framework:** Node.js with Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL (Hosted on NeonDB)
- **ORM:** Prisma Client
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **Validation:** Zod
- **Payments:** Stripe Payment Gateway
- **Documentation:** Swagger (swagger-jsdoc & swagger-ui-express)
- **Deployment:** Vercel

---

## ✨ Key Features

### 👤 User Roles (RBAC)
- **Customer:** Can browse gear, place rental orders, pay via Stripe, view payment history, and leave reviews.
- **Provider:** Can add, edit, and remove gear from their inventory. They can view incoming orders and update the status to `PICKED_UP` or `RETURNED`.
- **Admin:** Can manage gear categories and view all users on the platform.

### 🛡️ Security & Reliability
- **Global Error Handling:** Centralized error formatting for Prisma, Zod, and App errors.
- **Database Transactions:** Ensures ACID compliance (e.g., verifying payments simultaneously updates the order status and creates a receipt).
- **Zod Validation:** All incoming request bodies are strictly validated before hitting the database.

---

## 📖 Local Installation Guide

### Prerequisites
- Node.js (v18+)
- A PostgreSQL Database (Local or NeonDB)
- A Stripe Developer Account (for test keys)

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/m-d-Irfan/Backend_Gear_up_prisma_Stripe.git
   cd Backend_Gear_up_prisma_Stripe
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory using `.env.example` as a template:
   ```env
   NODE_ENV=development
   PORT=5000
   DATABASE_URL="postgresql://username:password@localhost:5432/gearup_db"
   JWT_ACCESS_SECRET="your_jwt_secret"
   JWT_ACCESS_EXPIRES_IN="7d"
   STRIPE_SECRET_KEY="sk_test_your_key"
   ```

4. **Initialize Database & Seed Data:**
   Push the Prisma schema to your database and run the seed script to automatically create an Admin, Provider, Customer, and sample gear.
   ```bash
   npx prisma db push
   npm run seed
   ```
   **Seed Credentials for Testing:**
   - Admin: `admin@gearup.com` | `Admin123!`
   - Provider: `provider@gearup.com` | `Provider123!`
   - Customer: `customer@gearup.com` | `Customer123!`

5. **Run the Application:**
   ```bash
   npm run dev
   ```
   The API will be running at `http://localhost:5000`. You can view the local Swagger docs at `http://localhost:5000/api-docs`.

---

## 🔗 API Endpoints Quick Reference

| Module | Endpoint | Method | Role | Description |
|--------|----------|--------|------|-------------|
| **Auth** | `/api/v1/auth/register` | `POST` | Public | Register Customer/Provider |
| **Auth** | `/api/v1/auth/login` | `POST` | Public | Login and get JWT Token |
| **Gear** | `/api/v1/gear` | `GET` | Public | Browse, filter, and search gear |
| **Gear** | `/api/v1/gear` | `POST` | Provider/Admin| Create a new gear listing |
| **Orders**| `/api/v1/orders` | `POST` | Customer | Place a new rental order |
| **Orders**| `/api/v1/orders/:id/status`| `PATCH`| Provider/Admin| Update order (CONFIRMED, RETURNED) |
| **Payment**| `/api/v1/payments/create-checkout-session`| `POST` | Customer | Generate Stripe transaction ID |
| **Payment**| `/api/v1/payments/verify` | `POST` | Customer | Verify payment and confirm order |

> **Note:** For the complete list of endpoints, request formats, and responses, please visit the [Live Swagger Documentation](https://backend-gear-up-prisma-stripe.vercel.app/api-docs).

---

## 🧪 How to Test with Swagger UI

Swagger UI allows you to interact with the API directly from your browser without needing Postman.

### Step 1: Login & Get Token
1. Open the [Swagger UI](https://backend-gear-up-prisma-stripe.vercel.app/api-docs).
2. Scroll down to the **Authentication** section and open `POST /api/v1/auth/login`.
3. Click the **"Try it out"** button.
4. Enter one of the Seed Credentials (e.g., the Admin email and password) in the Request body box and click **Execute**.
5. Scroll down to the Server Response and **copy the `accessToken`** (without quotes).

### Step 2: Authorize
1. Scroll to the very top of the Swagger page and click the green **"Authorize"** button.
2. In the Value field, type `Bearer ` followed by the token you copied (e.g., `Bearer eyJhbGciOi...`).
3. Click **Authorize** and then **Close**.

### Step 3: Test Endpoints
Now you are authenticated! You can open any other endpoint (like `GET /api/v1/users`), click **"Try it out"**, and click **Execute** to see live data directly from the database.

# control-system
=======
# Service Booking System

This is a Next.js application for managing a service booking system with three roles: Boss, Customer, and Waiter.

## Prerequisites

- Node.js (v18 or later)
- npm

## Setup Instructions

Since the environment was initialized without Node.js access, please follow these steps manually:

1.  **Install Dependencies:**
    Open a terminal in this directory and run:
    ```bash
    npm install
    ```

2.  **Initialize Database:**
    This project uses SQLite. Initialize the database schema:
    ```bash
    npx prisma db push
    ```

3.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

4.  **Access the Application:**
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Boss:**
    - View and manage appointment requests (Approve/Reject).
    - Manage staff status (Idle/Busy).
    - View 24h schedule and assign staff.
    - View staff work logs.
- **Customer:**
    - Browse staff status.
    - View shared schedule.
    - Book appointments (select time and waiter).
    - View and withdraw requests.
- **Waiter:**
    - Simple dashboard to toggle work status (Busy/Idle).

## Project Structure

- `app/`: Next.js App Router pages.
    - `boss/`: Boss dashboard.
    - `customer/`: Customer dashboard.
    - `waiter/`: Waiter dashboard.
    - `actions.ts`: Server Actions for data mutation.
- `prisma/schema.prisma`: Database schema.
- `lib/prisma.ts`: Database client instance.

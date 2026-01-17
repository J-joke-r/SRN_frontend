# 🖥️ Personal Details Collection System – Frontend

This repository contains the **frontend application** for the **Personal Details Collection System**, a secure web-based platform where users can log in, submit their personal information, and administrators can manage submitted records and also users can see if there are any annoucnements made by the admins of the community.

The frontend is built using **Next.js 13 (App Router)** and communicates securely with a **Node.js + Express backend** that handles authentication, authorization, and database operations using **Supabase**.

---

## 🔗 Project Architecture

This project is divided into **two separate repositories**:

- **Frontend (this repository)**  
  - Handles UI, routing, and user interactions  
  - Built with Next.js + Tailwind CSS  

- **Backend (separate repository)**  
  - Node.js + Express REST API  
  - Verifies Supabase JWT tokens  
  - Manages database operations and role-based access  

⚠️ **Note:** This frontend application requires the backend service to be running in order to function properly.

---

## 🚀 Features

### User Features
- Secure authentication using **Supabase Auth**
  - Email & Password login
  - Google OAuth login
- User dashboard to:
  - Submit personal details
  - Update previously submitted information

### Admin Features
- Admin dashboard with:
  - View all user submissions
  - Search users
  - Edit user details
  - Delete records
- Role-based access control (Admin / User)

---

## 🛠️ Tech Stack

- **Framework:** Next.js 13+ (App Router)
- **Language:** JavaScript / TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Supabase Authentication
- **API Communication:** REST APIs (Node.js Backend)

---

## 📁 Project Structure

```text
/app
  /login        - Authentication pages
  /dashboard    - User dashboard
  /admin        - Admin dashboard
/components     - Reusable UI components
/utils          - API helpers & auth utilities
/styles         - Global styles

# 🍛 Catering Reservation and Ordering System

[![Technology Stack](https://img.shields.io/badge/Stack-HTML%2FCSS%2FJS-brightgreen)](https://www.javascript.com/)
[![Database](https://img.shields.io/badge/Database-Firebase%20Realtime%20DB-orange)](https://firebase.google.com/)
[![Status](https://img.shields.io/badge/Status-Complete%20&%20Dynamic-blue)](https://github.com/your-username/your-repo-name)

# Link Here : [Click Here](https://vinayakgoyal2208.github.io/Catering-Management-System/)

## Table of Contents
1. [Introduction](#introduction)
2. [Key Features](#key-features)
3. [Technologies Used](#technologies-used)
4. [Setup & Installation](#setup--installation)
5. [Usage & Workflow](#usage--workflow)
6. [Project Structure](#project-structure)

---


## 1. Introduction

The **Catering Reservation and Ordering System** is a dynamic web application built to allow catering businesses to showcase their menus, manage products, and handle customer orders efficiently. It aims to empower local businesses by providing an accessible online portal to sell their commodities and promote traditional Indian culture through food.

This project strictly adheres to a modular code structure, is fully mobile-responsive, and utilizes **Firebase Realtime Database** to ensure a live and updated user experience, specifically for order tracking.

---

## 2. Key Features

The system is designed with distinct user and administrator modules, focusing on a dynamic, user-friendly interface.

### ✅ User/Customer Features
* **User Authentication:** Secure registration and login using Firebase Auth.
* **Dynamic Menu:** Browse and search products instantly.
* **Shopping Cart:** Add, update quantities, and remove items before checkout.
* **Mobile-Responsive Design:** The entire interface, from navigation to the cart, is fully dynamic and optimized for mobile devices (less than 768px).
* **Real-Time Order History:** Orders placed or updated by the Admin are instantly reflected in the user's **"My Orders"** dashboard without requiring a page refresh.
* **Secure Checkout:** Place orders with event details (date, guest count, address).

### 🛠️ Admin Features 
* **Product Management:** Add, edit, and delete catering items/products in real-time.
* **Real-Time Order Management:** View all incoming orders instantly.
* **Status Updates:** Easily update order status (`Pending`, `Confirmed`, `Completed`) with immediate reflection on the customer dashboard.

---

## 3. Technologies Used

This project is a pure frontend application leveraging Firebase as a Backend-as-a-Service (BaaS).

* **Frontend:** HTML5, CSS3 (with responsive media queries), Vanilla JavaScript (ES6 Modules).
* **Styling:** Custom CSS with a focus on Indian theme colors (Saffron, Green, Brown).
* **Database & Auth:** **Google Firebase**
    * **Firebase Authentication:** For user registration and login.
    * **Firebase Realtime Database:** For storing products, user data, orders, and contact messages.

---

## 4. Setup & Installation

To run this project locally, you need a Firebase project and a local web server (since ES modules require a server to run correctly).

### Prerequisites
1.  **Node.js/npm** (for the `http-server`)
2.  A **Firebase Project** configured with **Authentication** and **Realtime Database**.

### Step 1: Clone the Repository
```bash
git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
cd catering-reservation-and-ordering-system

```
### Step 2: Configure Firebase Credentials
```
You must update the configuration file with your own Firebase details.

1. Open js/firebase-config.js.
2. Replace the placeholder values in firebaseConfig with your actual project credentials.

```
 ### Step 3: Run the Application 
```bash
Install the http-server package globally (if not installed) and start the local server.

# Install server (if needed)
npm install -g http-server

# Run the server
http-server . -p 5500

```
## 5. Project Structure 
```
.
├── css/
│   └── styles.css        # Complete and dynamic styling (including mobile media queries)
├── js/
│   ├── app.js            # Core application logic, event handlers, UI rendering, and real-time listeners (key fix for order history)
│   ├── auth.js           # Firebase Authentication methods (register, login, logout)
│   ├── orders.js         # Firebase Database functions for order operations
│   ├── products.js       # Firebase Database functions for product operations
│   └── firebase-config.js# Firebase SDK initialization and config
├── index.html            # Main HTML structure with all sections and modals
└── README.md             # This file





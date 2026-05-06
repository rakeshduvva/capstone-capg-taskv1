# 🛍️ ShopZone — Online Shopping E-Commerce Application

A full-stack e-commerce web application built with **Node.js**, **Express**, **MongoDB**, and vanilla **HTML/CSS/JavaScript**. Features user authentication (signup/login), product catalog, shopping cart, and order management.

![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-brightgreen?logo=mongodb)
![Express](https://img.shields.io/badge/Express-4.18-blue?logo=express)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Running Locally](#-running-locally)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Hosting on AWS](#-hosting-on-aws)
- [Environment Variables](#-environment-variables)

---

## ✨ Features

- 🔐 **User Authentication** — Signup, Login, Logout with session management
- 🛒 **Shopping Cart** — Add/remove items, update quantities, real-time total
- 🔍 **Product Search** — Filter products by name or category
- 📦 **Product Catalog** — 12 products across 4 categories (Electronics, Fashion, Home, Sports)
- 📱 **Responsive Design** — Works on desktop, tablet, and mobile
- 🎨 **Modern UI** — Premium design with animations, glassmorphism, and hover effects
- 🗄️ **MongoDB Database** — Persistent storage for users, products, and orders

---

## 🛠️ Tech Stack

| Layer       | Technology            |
|-------------|----------------------|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **Backend**  | Node.js, Express.js  |
| **Database** | MongoDB with Mongoose ODM |
| **Auth**     | bcryptjs + express-session |
| **Sessions** | connect-mongo (MongoDB session store) |

---

## 🏗️ Architecture

```
┌──────────────┐     HTTP      ┌──────────────────┐     Mongoose    ┌──────────────┐
│              │  ──────────►  │                  │  ────────────►  │              │
│   Browser    │               │  Express Server  │                 │   MongoDB    │
│  (Frontend)  │  ◄──────────  │   (server.js)    │  ◄────────────  │  (shopzone)  │
│              │   HTML/JSON   │                  │     Documents   │              │
└──────────────┘               └──────────────────┘                 └──────────────┘
```

---

## 📌 Prerequisites

Before you begin, make sure you have the following installed:

| Software   | Version | Download Link |
|-----------|---------|---------------|
| **Node.js** | 18+    | [https://nodejs.org](https://nodejs.org) |
| **npm**     | 9+     | Comes with Node.js |
| **MongoDB** | 7.0+   | [https://www.mongodb.com/try/download](https://www.mongodb.com/try/download/community) |
| **Git**     | 2.0+   | [https://git-scm.com](https://git-scm.com) |

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/shopzone-ecommerce.git
cd shopzone-ecommerce
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
MONGO_URI=mongodb://localhost:27017/shopzone
SESSION_SECRET=shopzone-secret-key-2026
PORT=3000
```

### 4. Start MongoDB

Make sure MongoDB is running locally:

```bash
# Windows (if installed as service)
net start MongoDB

# Or start manually
mongod --dbpath="C:\data\db"

# macOS / Linux
sudo systemctl start mongod
```

### 5. Run the Application

```bash
npm start
```

The app will be available at: **http://localhost:3000**

> 💡 On first run, the database is automatically seeded with 12 sample products.

---

## 🏃 Running Locally

```bash
# Start the server
npm start

# Or use dev mode
npm run dev
```

Open your browser and navigate to:

| Page       | URL                         |
|-----------|----------------------------|
| Home      | http://localhost:3000        |
| Login     | http://localhost:3000/login  |
| Signup    | http://localhost:3000/signup |

---

## 📂 Project Structure

```
shopzone-ecommerce/
├── server.js              # Express server + MongoDB connection + API routes
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables (not committed)
├── README.md              # Project documentation
└── public/                # Static frontend files
    ├── index.html         # Home page — product catalog + cart
    ├── login.html         # Login page
    ├── signup.html        # Signup page
    ├── css/
    │   └── styles.css     # Complete stylesheet
    └── js/
        └── app.js         # Frontend logic — cart, search, auth state
```

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint       | Description         | Auth Required |
|--------|---------------|---------------------|:---:|
| POST   | `/api/signup`  | Create new account  | ❌ |
| POST   | `/api/login`   | Login to account    | ❌ |
| POST   | `/api/logout`  | Logout user         | ❌ |
| GET    | `/api/me`      | Get current user    | ❌ |

### Products

| Method | Endpoint         | Description          | Auth Required |
|--------|-----------------|----------------------|:---:|
| GET    | `/api/products`  | Get all products     | ❌ |

### Orders

| Method | Endpoint       | Description       | Auth Required |
|--------|---------------|-------------------|:---:|
| POST   | `/api/orders`  | Place a new order | ✅ |

### Request/Response Examples

**Signup:**
```bash
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{"full_name":"John Doe","email":"john@example.com","password":"pass123"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"pass123"}'
```

---

## ☁️ Hosting on AWS

### Option A: AWS EC2 (Recommended for this project)

#### Step 1 — Launch an EC2 Instance

1. Go to **AWS Console** → **EC2** → **Launch Instance**
2. Choose **Amazon Linux 2023** or **Ubuntu 22.04** AMI
3. Select **t2.micro** (free tier eligible)
4. Configure Security Group — open ports:
   - **22** (SSH)
   - **80** (HTTP)
   - **443** (HTTPS)
   - **3000** (Node.js — optional, for testing)
5. Create/select a key pair and download the `.pem` file
6. Launch the instance

#### Step 2 — Connect to EC2

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ec2-user@<YOUR_EC2_PUBLIC_IP>
```

#### Step 3 — Install Node.js and MongoDB

```bash
# Update system
sudo yum update -y          # Amazon Linux
# sudo apt update -y        # Ubuntu

# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs   # Amazon Linux
# sudo apt install -y nodejs  # Ubuntu

# Verify
node -v
npm -v
```

**Install MongoDB on Amazon Linux:**
```bash
# Create repo file
sudo tee /etc/yum.repos.d/mongodb-org-7.0.repo <<EOF
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/amazon/2023/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://pgp.mongodb.com/server-7.0.asc
EOF

sudo yum install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Install MongoDB on Ubuntu:**
```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Step 4 — Deploy the Application

```bash
# Clone your repo
git clone https://github.com/YOUR_USERNAME/shopzone-ecommerce.git
cd shopzone-ecommerce

# Install dependencies
npm install

# Create .env file
cat > .env <<EOF
MONGO_URI=mongodb://localhost:27017/shopzone
SESSION_SECRET=$(openssl rand -hex 32)
PORT=3000
EOF

# Test run
node server.js
```

#### Step 5 — Run with PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the app
pm2 start server.js --name shopzone

# Auto-restart on reboot
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs shopzone
```

#### Step 6 — Set Up Nginx Reverse Proxy

```bash
# Install Nginx
sudo yum install -y nginx    # Amazon Linux
# sudo apt install -y nginx  # Ubuntu

# Configure Nginx
sudo tee /etc/nginx/conf.d/shopzone.conf <<'EOF'
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

Your app is now live at: **http://YOUR_EC2_PUBLIC_IP**

---

### Option B: AWS Elastic Beanstalk (Easier)

#### Step 1 — Install EB CLI

```bash
pip install awsebcli
```

#### Step 2 — Initialize and Deploy

```bash
cd shopzone-ecommerce

# Initialize Elastic Beanstalk
eb init -p node.js shopzone-app --region us-east-1

# Create environment and deploy
eb create shopzone-env

# Open in browser
eb open
```

#### Step 3 — Set Environment Variables

```bash
eb setenv MONGO_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/shopzone SESSION_SECRET=your-secret PORT=8080
```

> ⚠️ For Elastic Beanstalk, use **MongoDB Atlas** (cloud-hosted MongoDB) instead of local MongoDB.

---

### MongoDB Atlas (Cloud Database — Recommended for Production)

For production, use **MongoDB Atlas** instead of local MongoDB:

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) → Create a free cluster
2. Create a database user with a password
3. Whitelist your EC2 IP address (or `0.0.0.0/0` for testing)
4. Get the connection string and update `.env`:

```env
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/shopzone?retryWrites=true&w=majority
```

---

## 🔐 Environment Variables

| Variable         | Description                    | Default                                |
|-----------------|--------------------------------|----------------------------------------|
| `MONGO_URI`     | MongoDB connection string      | `mongodb://localhost:27017/shopzone`   |
| `SESSION_SECRET` | Secret key for session signing | `shopzone-secret-key-2026`            |
| `PORT`          | Server port                    | `3000`                                |

---

## 📝 License

This project is licensed under the MIT License.

---

## 👤 Author

**ShopZone** — Built as part of the Cloud & DevSecOps Capstone Project.
   c a p s t o n e - c a p g - t a s k v 1  
 
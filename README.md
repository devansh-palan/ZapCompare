⚡ ZapCompare

ZapCompare is a full-stack web application that helps users quickly compare grocery prices across multiple platforms — Blinkit, Swiggy Instamart, and Zepto.
It features secure authentication with Gmail OTP + JWT, a product search dashboard, and optimized performance with Redis caching.

✨ Features

Secure Authentication

Login and Register with Gmail.

OTP verification via Gmail.

JWT tokens stored in cookies for sessions.

Smart Product Comparison

Search by brand and item name.

Scrapes product data from Blinkit, Swiggy Instamart, and Zepto using Puppeteer.

Returns the 10 most relevant results with clickable product links.

Optimized Performance

User data stored in PostgreSQL.

Recent searches cached in Redis (avoids repeated scraping).

Modern Tech Stack

Frontend: React + TailwindCSS

Backend: Node.js + Express + Puppeteer

Database: PostgreSQL

Cache: Redis

📂 Project Structure
ZapCompare/
│── frontend/       # ReactJS (UI: Home, Login, Register, Dashboard)
│   └── package.json
│
│── backend/        # Node.js backend (Auth, Scraping, DB, Redis, JWT)
│   └── package.json
│
└── README.md

⚙️ Installation & Setup
1. Clone the repository
git clone https://github.com/devansh-palan/ZapCompare.git
cd ZapCompare

2. Setup Backend
cd backend
npm install


Create a .env file inside backend/ with the following:

PORT=5000
DB_USER=your_pg_user
DB_HOST=localhost
DB_NAME=zapcompare
DB_PASS=your_pg_password
DB_PORT=5432

REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret_key

GMAIL_USER=your_gmail_id
GMAIL_APP_PASS=your_app_password


Start backend server:

npm start

3. Setup Frontend
cd ../frontend
npm install
npm start


The app should now be live at:
👉 http://localhost:3000

🚀 Usage

Register with a Gmail address → receive OTP.

Enter OTP to complete registration (JWT issued).

Login with Gmail (existing users skip OTP).

Search products by brand and/or item name.

Compare results from Blinkit, Swiggy Instamart, and Zepto.

Cached results load instantly from Redis.

📦 Dependencies
Backend (/backend)

express → API server & routing

cors → Enable frontend-backend communication

dotenv → Environment variables

cookie-parser → JWT cookie handling

jsonwebtoken → Authentication tokens

nodemailer → Send OTP via Gmail

pg → PostgreSQL client

redis → OTP + search cache storage

puppeteer → Web scraping (Blinkit, Swiggy, Zepto)

Frontend (/frontend)

react → UI framework

react-router-dom → Navigation (Home, Login, Register, Dashboard)

react-hot-toast → Notifications for login/register/OTP

tailwindcss → Styling framework

Native fetch API for backend requests

🔑 Example Flow

Register → Enter Gmail → OTP sent via Nodemailer → Verified → User stored in PostgreSQL → JWT cookie set.

Login → Gmail checked in DB → JWT cookie issued.

Search → Backend scrapes 3 platforms → Results cached in Redis → Returns cheapest + top products.

🤝 Contributing

Contributions are welcome!

Fork the repo

Create a feature branch

Submit a PR 🎉

📜 License

This project is licensed under the MIT License.
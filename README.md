🎓 Training & Placement Automation System (MERN Stack)
🚀 Digitizing the Campus Placement Process
Show Image
Show Image
Show Image
Show Image
Show Image
Show Image

🧠 Project Overview
Colleges manage student academic and placement data in Excel sheets. During recruitment, companies specify eligibility criteria such as CGPA, branch, backlogs, and skills. Filtering students manually from large Excel files is time-consuming, error-prone, and inefficient.
This project automates the entire process using the MERN Stack.
Admins can upload Excel data, manage students, add companies, apply criteria, and instantly generate eligible student lists.
It supports role-based login (Admin, TPO, Student) and scales for 10,000+ students.

🏗️ Tech Stack
LayerTechnologyFrontendReact.js + Tailwind CSS / Material UIBackendNode.js + Express.jsDatabaseMongoDB (Atlas)File UploadMulter + XLSX (Excel-to-JSON)AuthenticationJWT + bcryptAPI TestingPostmanDeploymentRender (Backend) + Vercel (Frontend)

🧩 Core Features
👨‍💼 Admin / TPO Panel

✅ Upload Excel file → auto-save to MongoDB
✅ Add/Update/Delete student profiles
✅ Add companies & set eligibility criteria
✅ Auto-generate eligible student list
✅ Export eligible lists (Excel/PDF)
✅ Dashboard showing total students, placements, and active companies

🎓 Student Panel

✅ Login & view profile
✅ Update skills, resume, certifications
✅ See eligible companies
✅ Receive notifications for drives


⚙️ System Architecture
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Admin Panel  │  │  TPO Panel   │  │Student Panel │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                           ▼                                 │
│                    Axios API Calls                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Node + Express)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Authentication Middleware (JWT + Role-Based)        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │   Auth   │  │ Students │  │Companies │  │  Upload  │     │
│  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│       │              │              │             │         │
│       └──────────────┴──────────────┴─────────────┘         │
│                          ▼                                  │
│              Controllers & Business Logic                   │
│                          ▼                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Mongoose ODM (Models & Schemas)              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE (MongoDB Atlas)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │  Users   │  │ Students │  │Companies │                   │
│  │Collection│  │Collection│  │Collection│                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
└─────────────────────────────────────────────────────────────┘

📂 Project Structure
Backend Structure
backend/
├── config/
│   └── db.js                    # MongoDB connection
├── controllers/
│   ├── authController.js         # Login, Register, JWT
│   ├── studentController.js      # CRUD for students
│   ├── companyController.js      # CRUD for companies
│   ├── uploadController.js       # Excel upload & parsing
│   └── dashboardController.js    # Statistics
├── middleware/
│   ├── auth.js                   # JWT verification
│   └── roleCheck.js              # Role-based access
├── models/
│   ├── User.js                   # User schema
│   ├── Student.js                # Student schema
│   └── Company.js                # Company schema
├── routes/
│   ├── authRoutes.js
│   ├── studentRoutes.js
│   ├── companyRoutes.js
│   ├── uploadRoutes.js
│   └── dashboardRoutes.js
├── uploads/                      # Temporary Excel files
├── .env                          # Environment variables
├── app.js                        # Express app setup
├── server.js                     # Server entry point
└── package.json
Frontend Structure
frontend/
├── src/
│   ├── api/
│   │   └── axiosInstance.js      # Axios config & interceptors
│   ├── components/
│   │   ├── Navbar.jsx            # Navigation bar
│   │   ├── Sidebar.jsx           # Admin sidebar
│   │   ├── DashboardCard.jsx     # Reusable card component
│   │   ├── Table.jsx             # Reusable table component
│   │   ├── ProtectedRoute.jsx    # Route protection
│   │   └── Toast.jsx             # Notification component
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── UploadExcel.jsx
│   │   ├── Students.jsx
│   │   ├── Companies.jsx
│   │   ├── FilterStudents.jsx
│   │   ├── StudentDashboard.jsx
│   │   └── EligibleCompanies.jsx
│   ├── utils/
│   │   ├── auth.js               # Token management
│   │   └── constants.js          # App constants
│   ├── App.jsx                   # Main app component
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles
├── public/
├── .env                          # Environment variables
├── tailwind.config.js
├── vite.config.js
└── package.json

🗄️ Database Schema
User Model
javascript{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['admin', 'tpo', 'student']),
  createdAt: Date
}
Student Model
javascript{
  name: String,
  email: String (unique),
  phone: String,
  rollNo: String (unique),
  branch: String,
  cgpa: Number,
  backlogs: Number,
  passingYear: Number,
  skills: [String],
  resumeLink: String,
  placed: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
Company Model
javascript{
  companyName: String,
  role: String,
  package: Number,
  criteria: {
    minCGPA: Number,
    maxBacklogs: Number,
    branchesAllowed: [String],
    skillsRequired: [String]
  },
  recruitmentDate: Date,
  eligibleStudents: [ObjectId] (ref: 'Student'),
  createdAt: Date
}

🔌 API Endpoints
Authentication Routes
POST   /api/auth/register      # Register new user
POST   /api/auth/login         # Login user
GET    /api/auth/me            # Get current user (protected)
Student Routes
GET    /api/students           # Get all students (Admin/TPO)
GET    /api/students/:id       # Get single student
POST   /api/students           # Create student (Admin/TPO)
PUT    /api/students/:id       # Update student
DELETE /api/students/:id       # Delete student (Admin)
GET    /api/students/profile   # Get own profile (Student)
PUT    /api/students/profile   # Update own profile (Student)
Company Routes
GET    /api/companies          # Get all companies
GET    /api/companies/:id      # Get single company
POST   /api/companies          # Add company (Admin/TPO)
PUT    /api/companies/:id      # Update company
DELETE /api/companies/:id      # Delete company (Admin)
POST   /api/companies/:id/filter  # Filter eligible students
Upload Routes
POST   /api/upload/students    # Upload Excel file (Admin/TPO)
GET    /api/upload/template    # Download sample Excel template
POST   /api/upload/export      # Export students to Excel
Dashboard Routes
GET    /api/dashboard/stats    # Get placement statistics
GET    /api/dashboard/recent   # Get recent activities

🚀 Installation & Setup
Prerequisites

Node.js (v16+)
MongoDB Atlas account
Git

Backend Setup

Clone the repository

bashgit clone <repository-url>
cd backend

Install dependencies

bashnpm install

Create .env file

envPORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development

Start the server

bash# Development mode
npm run dev

# Production mode
npm start
Server will run on http://localhost:5000
Frontend Setup

Navigate to frontend

bashcd frontend

Install dependencies

bashnpm install

Create .env file

envVITE_API_URL=http://localhost:5000/api

Start the development server

bashnpm run dev
Frontend will run on http://localhost:5173

📊 Excel Upload Format
Sample Excel Structure
NameEmailPhoneRoll NoBranchCGPABacklogsPassing YearSkillsResume LinkPlacedJohn Doejohn@college.edu9876543210CS001Computer Science8.502025JavaScript,React,Node.jshttps://resume.linkFALSEJane Smithjane@college.edu9876543211IT002Information Technology7.812025Python,Django,SQLhttps://resume.linkFALSE
Important Notes:

Skills should be comma-separated (JavaScript,React,Node.js)
CGPA should be a number (8.5)
Backlogs should be a number (0, 1, 2, etc.)
Placed should be TRUE or FALSE
Email and Roll No must be unique


🔐 Authentication & Authorization
JWT Token Flow

User logs in with email & password
Backend validates credentials
JWT token generated with user ID and role
Token sent to frontend
Frontend stores token in localStorage
Token sent in Authorization header for protected routes
Backend middleware verifies token on each request

Role-Based Access

Admin: Full access (CRUD all data, upload Excel, manage users)
TPO: Can manage students and companies, view reports
Student: Can view/edit own profile, see eligible companies


🎯 Key Features Explanation
1. Auto-Filtering Algorithm
When a company is added with criteria, the system:

Queries all students from database
Applies filters:

CGPA >= company's minimum CGPA
Backlogs <= company's max backlogs
Branch matches allowed branches
Has at least one required skill


Returns filtered list instantly

javascript// Example filtering logic
const eligibleStudents = await Student.find({
  cgpa: { $gte: company.criteria.minCGPA },
  backlogs: { $lte: company.criteria.maxBacklogs },
  branch: { $in: company.criteria.branchesAllowed },
  skills: { $in: company.criteria.skillsRequired },
  placed: false
});
2. Excel Upload & Parsing

Uses multer for file upload
Uses xlsx package to read Excel file
Converts to JSON format
Validates each row
Bulk inserts into MongoDB
Returns success/failure report

3. Export to Excel/PDF

Generates downloadable reports
Includes filtered student lists
Formatted with company criteria
Ready for HR/recruiters


🧪 Testing
Using Postman

Register Admin

POST http://localhost:5000/api/auth/register
Body: {
  "name": "Admin User",
  "email": "admin@college.edu",
  "password": "admin123",
  "role": "admin"
}

Login

POST http://localhost:5000/api/auth/login
Body: {
  "email": "admin@college.edu",
  "password": "admin123"
}

Add Student (with token)

POST http://localhost:5000/api/students
Headers: {
  "Authorization": "Bearer <your_jwt_token>"
}
Body: {
  "name": "John Doe",
  "email": "john@college.edu",
  "rollNo": "CS001",
  "branch": "Computer Science",
  "cgpa": 8.5,
  "backlogs": 0,
  "skills": ["JavaScript", "React"]
}

🌐 Deployment
Backend Deployment (Render)

Create account on Render
Create new Web Service
Connect GitHub repository
Configure:

Build Command: npm install
Start Command: npm start


Add environment variables (MONGO_URI, JWT_SECRET)
Deploy

Frontend Deployment (Vercel)

Create account on Vercel
Import GitHub repository
Configure:

Framework Preset: Vite
Build Command: npm run build
Output Directory: dist


Add environment variable:

VITE_API_URL=https://your-backend-url.onrender.com/api


Deploy


📸 Screenshots
Admin Dashboard

Statistics overview with total students, companies, and placements

Upload Excel Page

Drag-and-drop interface for bulk student upload

Filter Students Page

Real-time filtering based on company criteria

Student Dashboard

Personal profile and eligible companies view


🛠️ Tech Stack Details
Backend Dependencies
json{
  "express": "^4.18.2",
  "mongoose": "^8.0.0",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "multer": "^1.4.5-lts.1",
  "xlsx": "^0.18.5",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "express-validator": "^7.0.1"
}
Frontend Dependencies
json{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "axios": "^1.6.2",
  "tailwindcss": "^3.3.5",
  "react-toastify": "^9.1.3",
  "framer-motion": "^10.16.5",
  "react-icons": "^4.12.0",
  "xlsx": "^0.18.5"
}

🐛 Common Issues & Solutions
Issue 1: MongoDB Connection Error
Solution: Check your MongoDB Atlas connection string and ensure IP whitelist includes your current IP
Issue 2: JWT Token Expired
Solution: Increase token expiry time in backend or implement refresh token mechanism
Issue 3: Excel Upload Fails
Solution: Ensure Excel file matches the required format and column names are exact
Issue 4: CORS Error
Solution: Add frontend URL to CORS whitelist in backend

🤝 Contributing

Fork the repository
Create your feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request


📝 Future Enhancements

 Email notifications for placement drives
 SMS integration for instant alerts
 Resume parsing using AI
 Interview scheduling module
 Analytics dashboard with charts
 Mobile application (React Native)
 Multi-language support
 Integration with LinkedIn
 Automated report generation
 Video interview integration
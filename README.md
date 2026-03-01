# CampusConnect

A comprehensive web application that bridges university talent with opportunities. CampusConnect enables students to discover and apply for academic projects, startup gigs, part-time jobs, and hackathons, while allowing recruiters and project leads to find and connect with skilled candidates.



## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Overview](#api-overview)
- [Architecture Highlights](#architecture-highlights)

---

## Features

### Authentication and Authorization
- Email/password registration with email verification
- OAuth integration (Google and GitHub)
- Password reset via email
- JWT-based session management
- Dual-role system: Seeker (job hunters) and Finder (recruiters)
- Seamless role switching within the application

### User Profiles
- Customizable profiles with avatar, bio, university, and department
- Skills and interests tagging
- Portfolio and resume URL support
- Profile completeness tracking

### Opportunity Management
- Create and manage postings for academic projects, startup gigs, part-time jobs, and hackathons
- Configurable fields: required skills, deadline, work mode, duration, compensation
- Custom application questions
- Post status management (open, closed, draft)

### Application System
- Apply with cover letter, resume, portfolio, and highlighted skills
- Answer custom questions from posters
- Application status tracking: Pending, Reviewing, Shortlisted, Accepted, Rejected
- Application withdrawal support
- Real-time status change notifications

### Real-Time Notifications
- Pusher-powered instant notifications
- New application alerts for finders
- Status change alerts for seekers
- Notification bell with unread count
- Mark-as-read functionality

### Search and Discovery
- Full-text search across posts
- Filter by type, work mode, and status
- Sort by newest, deadline, or popularity

### Smart Recommendations
- Personalized job recommendations using a weighted scoring algorithm:
  - Skills Match (40%)
  - Behavioral Signals (20%)
  - Freshness (15%)
  - Profile Fit (15%)
  - Popularity (10%)
- Dedicated "For You" feed

### Match Score System
- Profile-to-job matching with detailed breakdowns
- Visual match score (0-100%) on post cards

### Saved Jobs
- Bookmark posts for later review
- Dedicated saved jobs page

### Real-Time Chat
- Direct messaging between seekers and finders
- Conversation list with message previews
- Real-time message delivery
- Unread message indicators

### AI Chatbot
- Gemini-powered context-aware assistant
- Help with job search strategies, resume tips, and app navigation
- Accessible floating chat widget on all pages

### Video Interviews
- Schedule interviews with date/time selection
- Integrated video calls using Daily.co
- Interview status tracking (scheduled, completed, cancelled)
- Email notifications for scheduled interviews
- Join, cancel, and reschedule functionality

---

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime environment |
| Express.js | Web framework |
| MongoDB Atlas | Cloud database |
| Mongoose | ODM for MongoDB |
| JWT | Authentication tokens |
| Passport.js | OAuth strategies (Google, GitHub) |
| bcrypt | Password hashing |
| Pusher | Real-time notifications |
| Nodemailer | Email service |
| Cloudinary | File storage (resumes, avatars) |
| Google Gemini | AI chatbot |
| jitsi Meet | Video conferencing |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| Vite | Build tool and dev server |
| TailwindCSS v4 | Styling |
| React Router v7 | Client-side routing |
| Axios | HTTP client |
| Pusher JS | Real-time client |
| Framer Motion | Animations |
| GSAP | Advanced animations |

---

## Project Structure

```
CampusConnect/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── PostCard.jsx
│   │   │   ├── Chatbot.jsx
│   │   │   ├── ApplyModal.jsx
│   │   │   ├── ScheduleInterviewModal.jsx
│   │   │   └── ...
│   │   ├── pages/              # Route pages
│   │   │   ├── Landing.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Posts.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── VideoCall.jsx
│   │   │   └── ...
│   │   ├── context/            # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ToastContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API service layer
│   │   └── constants/          # Theme and constants
│   ├── public/
│   └── package.json
│
├── Server/                     # Node.js backend
│   ├── index.js                # Application entry point
│   ├── Config/
│   │   ├── passport.js         # OAuth configuration
│   │   ├── pusher.js           # Pusher setup
│   │   └── cloudinary.js       # Cloudinary setup
│   ├── Controller/             # Route handlers
│   │   ├── authController.js
│   │   ├── postController.js
│   │   ├── applicationController.js
│   │   ├── chatController.js
│   │   ├── chatbotController.js
│   │   └── interviewController.js
│   ├── Model/                  # Mongoose schemas
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Application.js
│   │   ├── Message.js
│   │   └── Conversation.js
│   ├── routes/                 # API route definitions
│   ├── middleware/             # Express middleware
│   ├── services/               # Business logic services
│   └── package.json
│
└── README.md
```

---

## Prerequisites

- Node.js 18 or higher
- npm
- MongoDB Atlas account (or local MongoDB instance)
- Gmail account with App Password enabled
- Cloudinary account
- Pusher account
- Google Cloud Console project (for OAuth)
- GitHub OAuth App
- Google AI Studio account (for Gemini API key)
- Daily.co account (for video calls)

---

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CampusConnect
   ```

2. **Install server dependencies**
   ```bash
   cd Server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables** (see next section)

---

## Environment Variables

### Server (`Server/.env`)

Create a `.env` file in the `Server` directory with the following variables:

```env
# Server Configuration
PORT=5000
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key

# OAuth - Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# OAuth - GitHub
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Email (Gmail SMTP)
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Pusher
PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=your_pusher_cluster

# AI Chatbot
GEMINI_API_KEY=your_gemini_api_key

# Video Calls
DAILY_API_KEY=your_daily_api_key
```

### Client (`client/.env`)

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000
VITE_PUSHER_KEY=your_pusher_key
VITE_PUSHER_CLUSTER=your_pusher_cluster
```

---

## Running the Application

### Development Mode

**Start the backend server:**
```bash
cd Server
npm run dev
```

**Start the frontend development server:**
```bash
cd client
npm run dev
```

### Access Points
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Production Build

**Build the client:**
```bash
cd client
npm run build
```

The production build will be generated in the `client/dist` directory.

---

## API Overview

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with credentials |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/auth/verify-email/:token` | Verify email |
| GET | `/api/auth/google` | Google OAuth |
| GET | `/api/auth/github` | GitHub OAuth |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | List posts with filters |
| GET | `/api/posts/recommendations` | Get personalized recommendations |
| GET | `/api/posts/my-posts` | Get user's posts |
| GET | `/api/posts/:id` | Get single post |
| POST | `/api/posts` | Create post |
| PUT | `/api/posts/:id` | Update post |
| DELETE | `/api/posts/:id` | Delete post |
| POST | `/api/posts/:id/save` | Toggle save post |
| GET | `/api/posts/saved` | Get saved posts |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/applications/:postId/apply` | Apply to post |
| GET | `/api/applications/my-applications` | Get user's applications |
| GET | `/api/applications/post/:postId` | Get post applications |
| PUT | `/api/applications/:id/status` | Update status |
| DELETE | `/api/applications/:id/withdraw` | Withdraw application |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/conversations` | Get conversations |
| GET | `/api/chat/conversations/:id/messages` | Get messages |
| POST | `/api/chat/conversations/:id/messages` | Send message |
| POST | `/api/chat/conversations` | Start conversation |

### Interviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/interviews/:applicationId/schedule` | Schedule interview |
| GET | `/api/interviews/:applicationId/join` | Get meeting URL |
| POST | `/api/interviews/:applicationId/cancel` | Cancel interview |
| POST | `/api/interviews/:applicationId/complete` | Mark complete |

---

## Architecture Highlights

### Authentication Flow
1. User registers and receives verification email
2. Email verification activates account
3. Login issues JWT token stored in localStorage
4. Protected routes verify token via auth middleware

### Real-Time Notifications
1. Client subscribes to Pusher channel `user-{userId}`
2. Server triggers events on relevant actions
3. Client updates UI in real-time

### Recommendation Engine
```
Score = (Skills Match × 0.40) + (Behavior × 0.20) + (Freshness × 0.15) 
      + (Profile Fit × 0.15) + (Popularity × 0.10)
```

### Video Interview Flow
1. Finder schedules interview, at jitsi meet
2. Both parties access "Join Interview" button
3. Video call opens in embedded player
4. Post-call: mark complete and update application status

---

## Notes

- **TailwindCSS v4**: Uses updated syntax (e.g., `bg-linear-to-r` instead of `bg-gradient-to-r`)
- **Gemini API**: Free tier has rate limits; implement appropriate error handling
- **MongoDB**: Compound indexes ensure application uniqueness per post/applicant

---

## License

This project was created for  Web Hackathon.

# 🥗 NUTRI-AI — Master Agent Instruction File
> Read this **entire file** before starting any task. No exceptions.

---

## 🧠 Self-Correcting Rules Engine

This file contains a growing ruleset that improves over time.
**At every session start, read the entire "Learned Rules" section before doing anything.**

### How It Works
1. When the user corrects you or you make a mistake, **immediately append a new rule** to the "Learned Rules" section at the bottom of this file.
2. Rules are numbered sequentially and written as clear, imperative instructions.
3. Format: `N. [CATEGORY] Never/Always do X — because Y.`
4. Categories: `[STYLE]` `[CODE]` `[ARCH]` `[TOOL]` `[PROCESS]` `[DATA]` `[UX]` `[OTHER]`
5. Before starting any task, scan all rules for relevant constraints.
6. If two rules conflict, the **higher-numbered (newer) rule wins.**
7. **Never delete rules.** If a rule becomes obsolete, append a new rule that supersedes it.

### When to Add a Rule
- User explicitly corrects your output ("no, do it this way")
- User rejects a file, approach, or pattern
- You hit a bug caused by a wrong assumption about this codebase
- User states a preference ("always use X", "never do Y")

---

## 📋 Project Overview

| Field | Value |
|---|---|
| **App Name** | Nutri-AI |
| **Tagline** | AI-powered health & nutrition platform for personalised lifestyle transformation |
| **Stack** | MERN — MongoDB, Express.js, React.js, Node.js |
| **Styling** | Tailwind CSS |
| **Auth** | JWT (stored in localStorage) |
| **AI** | Anthropic Claude API (health reports, meal plans, chat coach) |
| **File Uploads** | Multer + Cloudinary (images and videos) |
| **Real-time** | Socket.io (chat + notifications) |
| **API Style** | REST |
| **Frontend Build** | Vite + React |

---

## 📁 Folder Structure
```
nutri-ai/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Full page views
│   │   ├── context/         # Auth & Global state (React Context)
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # Axios API calls
│   │   └── utils/           # Helper functions
├── server/                  # Express backend
│   ├── models/              # Mongoose models
│   ├── routes/              # API route files
│   ├── controllers/         # Route logic
│   ├── middleware/          # Auth, error handling, file upload
│   ├── utils/               # AI API calls, helpers
│   └── socket/              # Socket.io setup
├── .env                     # Environment variables (never commit)
└── NUTRI-AI.md              # This file — always read before coding
```

---

## 👤 User Roles

| Role | Access |
|---|---|
| User | Auth, Health Profile, AI Report, Exercise, Diet Log, AI Chat, Community |
| Admin | Admin Dashboard — view all users, posts, workout logs, AI activity |

---

## 🗄️ MongoDB Models

### User
```
_id, name, email, password (bcrypt hashed), role (user/admin), avatar, createdAt
```

### HealthProfile
```
userId (ref: User), age, gender, weight (kg), height (cm),
activityLevel, goal (lose/maintain/gain), dailyBudget (INR),
bmi, dailyCalorieNeeds, createdAt, updatedAt
```

### AIHealthReport
```
userId (ref: User), bmi, bmiCategory, dailyCalories,
macros { protein, carbs, fat }, wellnessRecommendations [],
generatedAt
```

### Exercise
```
_id, name, type (cardio/strength/yoga/hiit/flexibility),
muscleGroup, difficulty (beginner/intermediate/advanced),
duration (mins), caloriesBurned, description, videoUrl, thumbnail
```

### WorkoutLog
```
userId (ref: User), exerciseId (ref: Exercise),
date, duration, caloriesBurned, notes
```

### DietLog / MealPlan
```
userId (ref: User), date, dailyBudget,
meals [{ mealType (breakfast/lunch/dinner/snack),
name, calories, protein, carbs, fat, estimatedCost }],
totalCalories, totalCost, generatedByAI (bool)
```

### ChatMessage
```
userId (ref: User), role (user/assistant), message, timestamp
```

### CommunityPost
```
userId (ref: User), content, mediaUrls [], mediaType (image/video/none),
likes [], comments [{ userId, text, createdAt }], createdAt
```

### Notification
```
userId (ref: User), type, message, isRead, createdAt
```

---

## 🔌 API Routes

### Auth — `/api/auth`
| Method | Route | Description |
|--------|-------|-------------|
| POST | /register | Register new user |
| POST | /login | Login, returns JWT |
| GET | /me | Get current user (protected) |

### Health Profile — `/api/health`
| Method | Route | Description |
|--------|-------|-------------|
| POST | /profile | Create/update health profile |
| GET | /profile | Get user's health profile |
| GET | /report | Get AI-generated health report |
| POST | /report/generate | Generate new AI health report |

### Exercise — `/api/exercises`
| Method | Route | Description |
|--------|-------|-------------|
| GET | / | Get all exercises (search & filters) |
| GET | /:id | Get single exercise |
| POST | /log | Log a completed workout |
| GET | /log/history | Get user's workout history |

### Diet — `/api/diet`
| Method | Route | Description |
|--------|-------|-------------|
| GET | /meal-plan | Get today's meal plan |
| POST | /meal-plan/generate | Generate AI meal plan |
| GET | /log | Get diet log history |

### AI Chat — `/api/chat`
| Method | Route | Description |
|--------|-------|-------------|
| POST | /message | Send message, get AI response |
| GET | /history | Get user's chat history |
| DELETE | /history | Clear chat history |

### Community — `/api/community`
| Method | Route | Description |
|--------|-------|-------------|
| GET | /posts | Get all posts (paginated) |
| POST | /posts | Create post (with media upload) |
| DELETE | /posts/:id | Delete own post |
| POST | /posts/:id/like | Like/unlike a post |
| POST | /posts/:id/comment | Add comment |

### Admin — `/api/admin` *(admin role only)*
| Method | Route | Description |
|--------|-------|-------------|
| GET | /stats | Total users, posts, workout logs, AI messages |
| GET | /users | List all users |
| DELETE | /users/:id | Delete a user |
| GET | /posts | View all community posts |
| DELETE | /posts/:id | Remove any post |

### Notifications — `/api/notifications`
| Method | Route | Description |
|--------|-------|-------------|
| GET | / | Get user notifications |
| PATCH | /:id/read | Mark as read |

---

## 🖥️ Frontend Pages

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Marketing page with CTA |
| Register | `/register` | Sign up form |
| Login | `/login` | Login form |
| Onboarding | `/onboarding` | Health profile setup (first login only) |
| Dashboard | `/dashboard` | Overview: BMI, calories, recent activity |
| Health Report | `/health-report` | Full AI-generated health report |
| Exercises | `/exercises` | Browse/search workouts with filters |
| Exercise Detail | `/exercises/:id` | Single exercise + log button |
| Diet Log | `/diet` | Today's AI meal plan + history |
| AI Chat | `/chat` | Real-time AI coach chat interface |
| Community | `/community` | Feed of posts, create post |
| Profile | `/profile` | User info, avatar upload, settings |
| Admin Dashboard | `/admin` | Admin-only stats and management |

---

## 🔐 Environment Variables (.env)
```
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

ANTHROPIC_API_KEY=your_claude_api_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

CLIENT_URL=http://localhost:5173
```

---

## 🤖 AI Usage Rules (Anthropic Claude)
- **Health Report:** Generate BMI analysis, calorie needs, macro split, and 5 wellness recommendations from HealthProfile data.
- **Meal Plan:** Generate a full-day plan (4 meals) fitting the user's calorie target and INR daily budget.
- **Chat Coach system prompt:** *"You are a friendly, motivating AI nutrition and fitness coach. Keep responses concise, positive, and actionable. Always reference the user's health profile when relevant."*
- Always call AI from the **server side only** — never expose API keys to the frontend.

---

## 🏗️ Build Order *(follow strictly — do not skip phases)*

```
Phase 1: Backend — Auth + Health Profile + AI Health Report
Phase 2: Backend — Exercise routes + Diet/Meal Plan routes
Phase 3: Backend — AI Chat + Community + Notifications
Phase 4: Backend — Admin routes + Socket.io setup
Phase 5: Frontend — Vite setup + Auth pages + Protected Routes
Phase 6: Frontend — Onboarding + Dashboard + Health Report page
Phase 7: Frontend — Exercise pages + Diet Log page
Phase 8: Frontend — AI Chat page + Community Feed
Phase 9: Frontend — Admin Dashboard + Profile page
Phase 10: Final — Polish, error states, loading skeletons, deploy prep
```

---

## ✅ Definition of Done *(per feature)*
- [ ] Route exists and returns correct data
- [ ] Error handling returns meaningful messages
- [ ] Frontend connected and displays real data
- [ ] Loading and error states shown to user
- [ ] No hardcoded values — all from .env or DB

---

## 📏 Core Agent Rules *(always apply)*

```
1.  [ARCH]    Always read this entire file before starting any task.
2.  [ARCH]    Never change the folder structure without asking first.
3.  [CODE]    Use async/await everywhere — never .then() chains.
4.  [CODE]    Always add try/catch error handling to every route controller.
5.  [DATA]    Use environment variables for ALL secrets and URLs — never hardcode.
6.  [ARCH]    Reuse existing models and middleware — do not recreate them.
7.  [PROCESS] When fixing a bug, only touch the specific file causing the issue.
8.  [STYLE]   Always use Tailwind CSS for styling — no inline styles or separate CSS files.
9.  [PROCESS] After completing each phase, save a summary to the Knowledge Base.
10. [PROCESS] Always follow the Build Order — never jump ahead to a later phase.
11. [CODE]    Always call Anthropic Claude API from the server side only.
12. [ARCH]    API routes live in server/routes/, controllers in server/controllers/.
13. [PROCESS] Review the Implementation Plan artifact before executing any phase.
```

---

## 📚 Learned Rules
<!-- New rules are appended below this line. Do not edit above this section. -->

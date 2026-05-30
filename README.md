# 💘 Dating App

A full-stack **Dating / Social Network** application built with **.NET 9** on the backend and **Angular 21** on the frontend. Users can browse members, like profiles, exchange messages, upload photos via Cloudinary, and filter matches by gender and age — all secured with JWT authentication and role-based access control.

---

## 📑 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Data Model](#data-model)
- [API Overview](#api-overview)
- [Frontend Overview](#frontend-overview)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Seed Data](#seed-data)
- [Roles](#roles)
- [Contributing](#contributing)

---

## Features

**Members**
- Register with display name, email, password, gender, date of birth, city, country, and bio
- Browse other members with **pagination** and filters (gender, age range)
- View a member's profile, photos, and message thread on dedicated tabs
- Edit your own profile (display name, bio, city, country)

**Photos**
- Upload profile photos stored on **Cloudinary**
- Set any uploaded photo as your profile image
- Delete photos (removes from Cloudinary and database)

**Likes**
- Toggle a like on any other member's profile
- View members you have liked and members who liked you (`liked` / `likedBy` predicate)

**Messaging**
- Send direct messages to other members
- View paginated inbox, outbox, and unread message threads
- Soft-delete messages (both sides must delete before the record is removed)
- Track message read status (`ReadAt` timestamp)

**Security & Roles**
- Stateless JWT authentication
- Three roles: **Member**, **Moderator**, **Admin**
- Admin panel: list users with roles, edit roles
- Photo moderation endpoint (Moderator+)
- `LogUserActivity` action filter automatically updates `LastActive` on every authenticated request

**Frontend**
- Angular 21 with standalone components, **Signals**, and Zoneless change detection
- Tailwind CSS v4 + DaisyUI v5 for styling
- JWT interceptor auto-attaches the bearer token to every request
- Route guards protect authenticated pages; separate guard prevents leaving a dirty profile form
- Route resolver pre-fetches member data before navigating to the detail view
- View Transitions API for smooth page navigation

---

## Tech Stack

### Backend

| Category | Technology |
|---|---|
| Runtime | .NET 9 |
| Framework | ASP.NET Core Web API |
| ORM | Entity Framework Core 9 |
| Database | SQLite (file: `dating.db`) |
| Identity | ASP.NET Core Identity |
| Authentication | JWT Bearer (`Microsoft.AspNetCore.Authentication.JwtBearer`) |
| Photo storage | Cloudinary (`CloudinaryDotNet 1.27`) |
| Architecture | Repository pattern, service layer |

### Frontend

| Category | Technology |
|---|---|
| Framework | Angular 21 |
| Language | TypeScript 5.9 |
| State management | Angular Signals |
| Change detection | Zoneless |
| Styling | Tailwind CSS v4 + DaisyUI v5 |
| HTTP | Angular `HttpClient` with functional interceptors |
| Testing | Vitest |
| Build | Angular CLI / `@angular/build` |

---

## Architecture

```
┌─────────────────────────────────┐
│         Angular 21 SPA          │
│  (localhost:4200)               │
│                                 │
│  AccountService  (Signals)      │
│  LikesService    (Signals)      │
│  JWT Interceptor                │
│  Route Guards                   │
└────────────┬────────────────────┘
             │ HTTP REST (JSON)
             ▼
┌─────────────────────────────────┐
│     ASP.NET Core 9 Web API      │
│  (localhost:5000 / 5001)        │
│                                 │
│  AccountController   /account   │
│  MembersController   /members   │
│  LikesController     /likes     │
│  MessagesController  /messages  │
│  AdminController     /admin     │
│                                 │
│  JWT Middleware                 │
│  LogUserActivity Filter         │
└────────────┬────────────────────┘
             │
   ┌─────────┴──────────┐
   │                    │
   ▼                    ▼
SQLite DB          Cloudinary
(dating.db)     (photo storage)
```

---

## Data Model

```
┌──────────────┐      ┌──────────────┐
│   AppUser    │──────│    Member    │
│ (Identity)   │  1:1 │              │
│ DisplayName  │      │ DisplayName  │
│ ImageUrl     │      │ Gender       │
│ RefreshToken │      │ DateOfBirth  │
└──────────────┘      │ City/Country │
                      │ Description  │
                      │ LastActive   │
                      └──────┬───────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            ▼                ▼                ▼
       ┌─────────┐    ┌─────────────┐  ┌──────────────┐
       │  Photo  │    │ MemberLikes │  │   Message    │
       │ Url     │    │ SourceMember│  │ Content      │
       │ PublicId│    │ TargetMember│  │ ReadAt       │
       └─────────┘    └─────────────┘  │ SenderDeleted│
                      (composite PK)   │ RecipDeleted │
                                       └──────────────┘
```

### Entity summary

| Entity | Key fields |
|---|---|
| `AppUser` | `DisplayName`, `Email`, `ImageUrl`, `RefreshToken` (extends `IdentityUser`) |
| `Member` | `DisplayName`, `Gender`, `DateOfBirth`, `City`, `Country`, `Description`, `ImageUrl`, `LastActive`, `CreatedAt` |
| `Photo` | `Url`, `PublicId` (Cloudinary), `MemberId` |
| `MemberLikes` | `SourceMemberId`, `TargetMemberId` (composite PK) |
| `Message` | `Content`, `SentAt`, `ReadAt`, `SenderDeleted`, `RecipientDeleted`, `SenderId`, `RecipientId` |

---

## API Overview

Base path: `/api` (default ASP.NET routing — adjust if you set a custom prefix)

### Account — `/api/account`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/account/register` | No | Register a new user (auto-assigned `Member` role) |
| `POST` | `/account/login` | No | Log in and receive a JWT |

### Members — `/api/members`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/members` | Paginated list of members filtered by `gender`, `minAge`, `maxAge` |
| `GET` | `/members/{id}` | Get a single member by ID |
| `GET` | `/members/{id}/photos` | Get all photos for a member |
| `PUT` | `/members` | Update current user's profile |
| `POST` | `/members/upload-photo` | Upload a photo to Cloudinary |
| `PUT` | `/members/set-profile-image/{photoId}` | Set a photo as the profile image |
| `DELETE` | `/members/remove-photo/{photoId}` | Delete a photo from Cloudinary and DB |

### Likes — `/api/likes`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/likes/{targetMemberId}` | Toggle like on a member (like / unlike) |
| `GET` | `/likes/list` | Get IDs of members the current user has liked |
| `GET` | `/likes?predicate=liked` | Members the current user has liked |
| `GET` | `/likes?predicate=likedBy` | Members who have liked the current user |

### Messages — `/api/messages`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/messages` | Send a message to a member |
| `GET` | `/messages` | Paginated messages filtered by container (`Inbox` / `Outbox` / `Unread`) |
| `GET` | `/messages/thread/{recipientId}` | Full message thread between two members |
| `DELETE` | `/messages/{id}` | Soft-delete a message |

### Admin — `/api/admin`

| Method | Endpoint | Role required | Description |
|---|---|---|---|
| `GET` | `/admin/get-admin` | `Admin` | Sanity check endpoint |
| `GET` | `/admin/users-with-roles` | `Admin` | List all users and their roles |
| `GET` | `/admin/edit-roles/{userId}?roles=...` | `Admin` | Add / remove roles for a user |
| `GET` | `/admin/photos-to-moderate` | `Admin`, `Moderator` | List photos awaiting moderation |

> All endpoints except `/account/register` and `/account/login` require `Authorization: Bearer <token>`.

---

## Frontend Overview

The Angular SPA lives in `client/` and is served on `http://localhost:4200` in development.

### Routes

| Path | Component | Guard |
|---|---|---|
| `/` | `Home` | Redirects to `/members` if logged in |
| `/register` | `Register` | Public |
| `/signin` | `SignIn` | Public |
| `/members` | `MembersList` | Auth required |
| `/members/:id` | `MemberDetails` | Auth required |
| `/members/:id/profile` | `MemberProfile` | Auth required, unsaved-changes guard |
| `/members/:id/messages` | `MemberMessages` | Auth required |
| `/members/:id/photos` | `MemberPhotos` | Auth required |
| `/messages` | `Messages` | Auth required |
| `/lists` | `Lists` | Auth required |
| `**` | `NotFound` | — |

### Key services

| Service | Responsibility |
|---|---|
| `AccountService` | Login, register, logout; stores current user in `localStorage`; exposes `currentUser` Signal |
| `LikesService` | Toggle likes, fetch liked member IDs; exposes `likeIds` Signal |

### Angular patterns used

- **Signals** and `computed()` for reactive state (no NgRx / BehaviorSubject)
- **Zoneless** change detection (`provideZonelessChangeDetection`)
- Functional **JWT interceptor** (`jwtInterceptor`) auto-attaches `Authorization` header
- Route **resolver** (`memberResolver`) pre-loads member data
- **`preventUnsavedChangesGuard`** prompts before leaving a dirty profile form
- `withViewTransitions()` for native browser view transitions between routes

---

## Project Structure

```
dating-app/
├── DatingApp.sln
├── .vscode/
├── API/                              # .NET 9 Web API
│   ├── API.csproj
│   ├── Program.cs
│   ├── Controllers/
│   │   ├── BaseApiController.cs
│   │   ├── AccountController.cs
│   │   ├── MembersController.cs
│   │   ├── LikesController.cs
│   │   ├── MessagesController.cs
│   │   └── AdminController.cs
│   ├── Data/
│   │   ├── AppDbContext.cs
│   │   ├── Seed.cs
│   │   ├── UserSeedData.json
│   │   ├── MemberRepositary.cs
│   │   ├── LikesRepository.cs
│   │   └── MessageRepository.cs
│   ├── Entities/
│   │   ├── AppUser.cs
│   │   ├── Member.cs
│   │   ├── Photo.cs
│   │   ├── MemberLikes.cs
│   │   └── Message.cs
│   ├── DTOs/
│   │   ├── RegisterDto.cs
│   │   ├── LoginDto.cs
│   │   ├── MemberUpdateDto.cs
│   │   ├── MessageDto.cs
│   │   └── ...
│   ├── Helpers/
│   │   ├── PaginationParams.cs
│   │   ├── MemberParams.cs
│   │   ├── MessageParams.cs
│   │   ├── PaginatorResult.cs
│   │   ├── LogUserActivity.cs
│   │   └── CloudinarySettings.cs
│   ├── Interfaces/
│   │   ├── IMemberRepositary.cs
│   │   ├── ILikesRepository.cs
│   │   ├── IMessageRepository.cs
│   │   ├── ITokenService.cs
│   │   └── IPhotoService.cs
│   ├── Services/
│   │   ├── TokenService.cs
│   │   └── PhotoService.cs
│   ├── Extensions/
│   ├── appsettings.json
│   └── appsettings.Development.json
└── client/                           # Angular 21 SPA
    ├── package.json
    ├── angular.json
    └── src/
        ├── app/
        │   ├── app.ts
        │   ├── app.routes.ts
        │   └── app.config.ts
        ├── core/
        │   ├── services/
        │   │   ├── account-service.ts
        │   │   └── likes-service.ts
        │   ├── interceptors/
        │   │   └── jwt-interceptor.ts
        │   └── gaurds/
        │       ├── auth-guards.ts
        │       └── prevent-unsaved-changes-guard.ts
        ├── features/
        │   ├── account/           # register, sign-in
        │   ├── members/           # list, details, profile, messages, photos
        │   ├── messages/          # inbox/outbox view
        │   ├── lists/             # likes list view
        │   ├── home/
        │   └── not-found/
        ├── types/                 # TypeScript interfaces (Member, Message, etc.)
        └── environments/
```

---

## Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js 20+](https://nodejs.org/) and [npm](https://www.npmjs.com/)
- [Angular CLI](https://angular.io/cli): `npm install -g @angular/cli`
- A [Cloudinary](https://cloudinary.com/) account (free tier works fine)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ahmed-sial/dating-app.git
cd dating-app
```

### 2. Configure the API

Copy your Cloudinary credentials and a JWT signing key into `API/appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data source=dating.db"
  },
  "TokenKey": "<your-long-random-secret-key>",
  "CloudinarySettings": {
    "CloudName": "<your-cloud-name>",
    "ApiKey": "<your-api-key>",
    "ApiSecret": "<your-api-secret>"
  }
}
```

### 3. Run the API

```bash
cd API
dotnet run
```

The API will start (typically on `https://localhost:5001` / `http://localhost:5000`) and will:
- Apply any pending EF Core migrations automatically
- Seed the database with demo members and an admin user (only on first run)

### 4. Install frontend dependencies

```bash
cd ../client
npm install
```

### 5. Run the Angular app

```bash
ng serve
```

The SPA will be available at `http://localhost:4200`.

---

## Configuration

### API (`appsettings.Development.json`)

| Key | Description |
|---|---|
| `ConnectionStrings:DefaultConnection` | SQLite connection string (file path) |
| `TokenKey` | HMAC signing key for JWTs — use a long random string in production |
| `CloudinarySettings:CloudName` | Your Cloudinary cloud name |
| `CloudinarySettings:ApiKey` | Cloudinary API key |
| `CloudinarySettings:ApiSecret` | Cloudinary API secret |

### Frontend (`src/environments/environment.development.ts`)

| Key | Default | Description |
|---|---|---|
| `apiUrl` | `http://localhost:5000/api` | Base URL for all API requests |

---

## Seed Data

On first startup the API seeds demo members from `API/Data/UserSeedData.json` using `UserManager`. All seeded members get:
- Password: `Pa$$w0rd`
- Role: `Member`

An **admin** account is also created:
- Email: `admin@test.com`
- Password: `Pa$$w0rd`
- Roles: `Admin`, `Moderator`

---

## Roles

| Role | Access |
|---|---|
| `Member` | All standard member features |
| `Moderator` | Member features + photo moderation |
| `Admin` | All features + user/role management |

Role assignment is managed via `GET /admin/edit-roles/{userId}?roles=Admin,Member`.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: describe your change"`
4. Push to your fork: `git push origin feature/your-feature`
5. Open a Pull Request

Please make sure the API compiles (`dotnet build`) and the Angular app builds cleanly (`ng build`) before submitting.

---

> Built with 💜 .NET 9 and Angular 21.

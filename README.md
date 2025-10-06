# Collaborative Whiteboard Application

A full-stack application built with Next.js and Supabase, enabling users to create projects, manage whiteboards, and collaborate in real-time using the TLDraw library. This project demonstrates a complete development cycle from database design to deployment.


## ✨ Key Features

- **User Authentication:** Secure user sign-up and login functionality.
- **Project Management:** Full CRUD (Create, Read, Update, Delete) operations for projects.
- **Whiteboard Management:** Create and manage multiple whiteboards within each project.
- **Collaborative Drawing:** Real-time whiteboarding powered by the TLDraw library.
- **Project Sharing:** Invite other users to collaborate on your projects.
- **Role-Based Access:** Simple member role implementation within projects.

---

## 🛠️ Tech Stack

- **Frontend:** [Next.js](https://nextjs.org/) (React Framework)
- **Backend:** [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **BaaS / Hosting:** [Supabase](https://supabase.io/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Whiteboard Library:** [TLDraw](https://tldraw.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)

---

## Database Schema

The database is structured using Prisma to manage users, projects, members, and whiteboards.



```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Project {
  id          String          @id @default(cuid())
  name        String
  description String?
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
  ownerId     String
  owner       User            @relation("ProjectOwner", fields: [ownerId], references: [id], onDelete: Cascade)
  members     ProjectMember[]
  whiteboards Whiteboard[]

  @@map("projects")
}

model User {
  id                 String   @id @default(cuid())
  username           String   @unique
  normalizedUsername String?  @unique
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  ownedProjects Project[]       @relation("ProjectOwner")
  memberships   ProjectMember[]

  @@map("users")
}

model ProjectMember {
  id        String   @id @default(cuid())
  userId    String
  projectId String
  role      String   @default("member") // e.g., "admin", "member"
  joinedAt  DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([userId, projectId])
  @@map("project_members")
}

model Whiteboard {
  id        String   @id @default(cuid())
  name      String
  content   String   @default("{}")
  projectId String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  data      Json?
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@map("whiteboards")
}
```


## 🏁 Getting Started
Follow these instructions to set up and run the project on your local machine.

**Prerequisites**
Node.js (v18 or later)
npm or yarn
Git
A free Supabase account to host your PostgreSQL database.

## Installation & Setup
Clone the repository:

bash
```
git clone https://github.com/SarthakNative/tldraw-app.git
```
Navigate to the project directory:

bash
```
cd tldraw-app
```

Install dependencies:

bash
```
npm install
```

Set up environment variables:

Create a .env.local file by copying the example file:

bash
```
cp .env.example .env.local
```

Open .env.local and fill in the required values:

### Get this from your Supabase project -> Project Settings -> Database -> Connection string
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[HOST]:5432/postgres"

### A strong, random string for signing authentication tokens.
### You can generate one here: https://www.lastpass.com/features/password-generator
JWT_SECRET="YOUR_SUPER_SECRET_JWT_KEY"
Sync the database schema:

This command generates the Prisma Client based on your schema.
bash
```
npx prisma generate
```
This command pushes your schema changes to the database, creating the tables.
bash
```
npx prisma db push
```
Run the development server:

bash
```
npm run dev
```
Open the application:
Visit http://localhost:3000 in your browser.

## Deployment
if ne wants to deploy the application, they can just import project into vercel from github, **remember, for serverless, you should be connecting to port 6543, the connection pooler port. You can find the URL in your project only, after clicking the connection button**

## How to Test
Follow this user flow to test all core functionalities of the application:

1. Authentication: Navigate to the root URL. You will be redirected to the login page. Create a new user account and log in.
2. Project Dashboard: After logging in, you will land on the /projects dashboard.
3. Project CRUD:
4. Create a new project.
5. Edit its name and description.
6. Delete a project to confirm functionality.
7. Whiteboard CRUD:
8. Click on a project to open it.
9. Inside a project, create one or more whiteboards.
10. Perform update and delete operations on the whiteboards.

11. Drawing:
Open a whiteboard.
Use the drawing tools to create content on the canvas. Your changes should save automatically.
Collaboration:
Use the "Share" feature within a project to invite another registered user.
Log out of your current account.
Log in as the invited user. You should now see the shared project on their dashboard.

## Author
Sarthak
GitHub: @SarthakNative
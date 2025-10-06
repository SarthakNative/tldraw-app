Collaborative Whiteboard Project
A real-time collaborative whiteboard application designed for teams. Built with a modern tech stack including Next.js, Supabase, and TLDraw, this project allows users to create projects, manage members, and collaborate on shared digital whiteboards.

Table of Contents
Project Overview
Key Features
Tech Stack
Database Schema
Local Setup Instructions
Deployment
Testing Guide
Project Overview
This application provides a seamless and interactive environment for real-time collaboration. The core functionality revolves around "Projects," which act as containers for shared "Whiteboards." Users can sign up, create their own projects, and invite others to collaborate. The integration with TLDraw provides a feature-rich and performant whiteboarding experience.

The backend is powered by Supabase for its database and authentication services, with Prisma acting as the ORM for type-safe database access. The entire application is built with Next.js, leveraging its capabilities for both frontend rendering and backend API routes. The UI is crafted with Tailwind CSS for a clean, modern, and responsive design.

Key Features
User Authentication: Secure user sign-up and login managed by Supabase Auth.
Project Management: Full CRUD (Create, Read, Update, Delete) functionality for projects.
Collaborative Workspaces: Invite users to projects to view and edit shared whiteboards.
Real-time Whiteboards: Create multiple whiteboards within each project, powered by the fast and flexible TLDraw library.
Type-Safe Codebase: Built entirely with TypeScript for robust and maintainable code.
Tech Stack
Framework: Next.js
Styling: Tailwind CSS
Whiteboard Library: TLDraw
Backend-as-a-Service: Supabase (PostgreSQL Database, Auth)
ORM: Prisma
Language: TypeScript
Database Schema
The database is managed using a PostgreSQL instance on Supabase and modeled with the Prisma schema below.

Prisma Schema
prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  ownerId     String
  owner       User     @relation("ProjectOwner", fields: [ownerId], references: [id], onDelete: Cascade)
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
  role      String   @default("member")
  joinedAt  DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([userId, projectId])
  @@map("project_members")
}

model Whiteboard {
  id        String   @id @default(cuid())
  name      String
  content   String   @default("{}") // Stores TLDraw snapshot as a JSON string
  projectId String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@map("whiteboards")
}
Table Relationships
User & Project (One-to-Many): A User can own multiple Projects.
Project & Whiteboard (One-to-Many): A Project can contain multiple Whiteboards.
User & Project (Many-to-Many): A User can be a member of multiple Projects, and a Project can have multiple Users as members. This relationship is managed through the ProjectMember join table.
Local Setup Instructions
Follow these steps to get the project running on your local machine.

1. Prerequisites
Node.js (v18 or later)
npm or yarn
Git
A Supabase account
2. Installation
Clone the repository and install the project dependencies.

bash
# Clone the repository
git clone https://github.com/your-username/your-repo-name.git

# Navigate into the project directory
cd your-repo-name

# Install dependencies
npm install
# or
yarn install
3. Environment Setup
You will need to connect the project to your own Supabase instance.

Create a Supabase Project: Go to your Supabase dashboard and create a new project.

Get Database URL: Navigate to Project Settings > Database. Under Connection string, copy the URI that starts with postgresql://.

Get API Keys: Navigate to Project Settings > API. Copy the Project URL and the anon public key.

Create .env.local file: In the root of your project, create a new file named .env.local and add the following variables, replacing the placeholders with your Supabase credentials.

env
# Found in Project Settings > Database > Connection string
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-DB-HOST]:5432/postgres"

# Found in Project Settings > API
NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_PUBLIC_KEY"
4. Database Migration
Apply the Prisma schema to your Supabase database. This will create the tables defined in schema.prisma.

bash
npx prisma migrate dev
5. Start the Server
Run the development server.

bash
npm run dev
The application should now be running at http://localhost:3000.

Deployment
Live URL: https://your-live-app-url.com (Replace with your deployment URL)

Deployment Notes
This Next.js application is optimized for deployment on platforms like Vercel or Netlify.

Environment Variables: When deploying, ensure you add the same environment variables from your .env.local file to your hosting provider's environment variable settings.
Build Command: The standard build command is npm run build.
Database: Your Supabase database is already hosted and does not require separate deployment.
Testing Guide
Follow these steps to test the core functionalities of the application.

1. Authentication and Routing
Navigate to the root URL (/).
If you are not logged in, you should be automatically redirected to the /login page.
Create a new account or log in with an existing one.
Upon successful login, you should be redirected to the main dashboard at /projects.
Locate and click the "Logout" button. You should be logged out and redirected back to the login page.
2. Project CRUD Operations
On the /projects dashboard, find the section for "Owned Projects".
Create: Click the "New Project" button, fill in a name and description, and submit. The new project should appear in your list.
Update: Find the project you just created and use the edit functionality to change its name or description. Verify the changes are saved.
Delete: Use the delete functionality to remove the project. Confirm that it is no longer visible on your dashboard.
3. Whiteboard CRUD Operations
Create a project or click on an existing one to navigate to its whiteboards page (/projects/[projectId]/whiteboards).
Create: Click the "New Whiteboard" button, give it a name, and submit. The whiteboard should appear in the list.
Update: Rename the whiteboard and confirm the new name is displayed.
Delete: Delete the whiteboard and confirm it's removed from the list.
4. Whiteboard Drawing Functionality
Click to open a whiteboard.
Use the drawing tools provided by TLDraw to create shapes, lines, and text.
Refresh the page. Your drawings should persist and be reloaded correctly.
5. Project Sharing and Collaboration
Create two separate user accounts for this test.
Log in as User A. Create a new project.
Find the "Share" or "Invite" feature for that project and share it with User B's email/username.
Log out as User A.
Log in as User B.
Navigate to the /projects dashboard and check the "Shared Projects" (or equivalent) section. The project shared by User A should be visible.
Click on the shared project to access its whiteboards and verify that you can view and edit them.
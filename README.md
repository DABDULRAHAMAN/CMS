# CMS - Personal & Team Calendar Manager

A modern, responsive Calendar Management System (CMS) built with Next.js 15, allowing users to manage personal and team events with ease. Features natural language event creation, drag-and-drop-like interaction, and a beautiful UI.

## Features

- 📅 **Interactive Calendar**: Switch between Week and Month views.
- ✨ **Natural Language Quick Add**: Create events by typing "Lunch with John tomorrow at 2pm".
- 👥 **Personal & Team Contexts**: Separate calendars for personal tasks and team schedules.
- 🔐 **Authentication**: Secure login and registration flows.
- 📱 **Responsive Design**: Built with Tailwind CSS for all screen sizes.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose)
- **Auth**: [Auth.js (NextAuth v5)](https://authjs.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **NLP**: [Chrono Node](https://github.com/wanasit/chrono) for parsing dates.

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB installed locally or a MongoDB Atlas connection string

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/DABDULRAHAMAN/CMS.git
   cd CMS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/cms
   AUTH_SECRET=your_super_secret_key_here
   # To generate a secret: npx auth secret
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage Guide

- **Creating Events**: Click the "New" button or type naturally in the Quick Add bar (e.g., "Meeting Friday 10am").
- **Editing**: Click any event to edit details or delete it.
- **Switching Contexts**: Use the sidebar to toggle between "Personal" and "Team" calendars.

## Deployment

This app can be easily deployed on [Vercel](https://vercel.com/new). Remember to add your `MONGODB_URI` and `AUTH_SECRET` to the deployment environment variables.



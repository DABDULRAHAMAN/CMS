CMS – Calendar Management System

CMS (Calendar Management System) is a full-stack application that allows users to manage events and schedules using a calendar-based interface.  
The project is divided into a frontend and backend for better scalability and maintenance.

📁 Project Structure
CMS/
├── calendar-backend/ # Backend source code
├── calendar-management-system/ # Frontend source code
├── README.md

🛠️ Prerequisites

Make sure the following are installed on your system:

- Git
- Python 3.x
- Node.js and npm
- VS Code (recommended)

🚀 How to Run the Project

1️⃣ Clone the Repository
  git clone https://github.com/DABDULRAHAMAN/CMS.git
  cd CMS

2️⃣ Backend Setup
  cd calendar-backend
  python -m venv venv
  
  Activate virtual environment:
  1. Windows
    venv\Scripts\activate
  2. Linux / macOS
  source venv/bin/activate
  
  Install dependencies:
    pip install -r requirements.txt
    
  Run the backend:
    node server.js
    
  Backend will run on:
    http://localhost:5000

  
3️⃣ Frontend Setup
  Open a new terminal and run:
      cd calendar-management-system
      npm install
      npm start
      npm run dev
      
  Frontend will run on:
      http://localhost:3000





# IAM Joiner-Mover-Leaver Workflow System

A Node.js + SQLite based Identity & Access Management (IAM) workflow system that automates employee onboarding, role changes, and offboarding processes.

## Features
- User onboarding (Joiner)
- Role change workflow (Mover)
- Employee offboarding (Leaver)
- Failed and Retry provisioning 
- Audit logging
- SQLite database integration

## Tech Stack
- Node.js
- Express.js
- SQLite
- HTML/CSS

## Project Structure
- server.js
- database.js
- index.html

## How to Run
1. Install dependencies:
   npm install
2. Start server:
   node server.js
3. Open browser:
   http://localhost:3000

## Screenshots
1. Dashboard
   ![dashboard](screenshots\dashboard.png)
2. Joiner Workflow
   ![Joiner-workflow](screenshots\Joiner-workflow1.png)
3. User table
   ![User-table](screenshots\User-table.png)
4. Mover Workflow
   ![Mover-workflow-initiating](screenshots\mover-workflow1.png)
   ![Mover-workflow-result](screenshots\mover-workflow2.png)
5. Failed Provisioning
   ![Failed-provisioning-simulating](screenshots\Failed-provisioning1.png)
   ![Failed-provisioning-simulated-results](screenshots\Failed-provisioning2.png)
6. Retry Provisioning
   ![Retry-provisioning](screenshots\Retry-provisioning1.png)
   ![Retry-provisioning-results](screenshots\Retry-provisioning2.png)
7. Leaver Workflow
   ![Leaver-workflow-initiating](screenshots\leaver-workflow1.png)
   ![Leaver-workflow-result](screenshots\leaver-workflow2.png)
8. Audit logs
   ![Audit-logs](screenshots\Audit-logs.png)

## 👤 Author
Khushboo Jayasval

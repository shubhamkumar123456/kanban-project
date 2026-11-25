# Kanban Project Board — React + Vite

A responsive, cream-and-brown Kanban task manager inspired by the screenshots and feature descriptions in the supplied Kanban Project Board PDF.

## Requirements
- Node.js 18+ (Node.js 20+ recommended)
- npm

## Run locally
1. Extract the ZIP folder.
2. Open the extracted `kanban-project` folder in VS Code.
3. Open Terminal → New Terminal.
4. Run:
   ```bash
   npm install
   npm run dev
   ```
5. Open the local URL printed by Vite (usually `http://localhost:5173`).

## Included
- Sign-in / sign-up style entry screen (demo only; no real authentication backend)
- Board with To Do, In Progress, In Review and Done columns
- Drag-and-drop between columns
- Create, edit and delete task modal
- Task title, description, priority, label, assignee, due date and status
- Search and priority filter
- Dashboard cards and chart derived from the same task state
- Analytics and calendar views
- HelpBot with quick questions and local scripted responses
- `localStorage` persistence after refresh
- Responsive layout for desktop, tablet and mobile

## Notes
- This is a frontend prototype. Login is a local demo flow; password recovery and real multi-user authentication require a backend.
- The UI follows the palette and major layouts from the PDF. Pixel-perfect matching can require further tuning against full-resolution original screenshots and your preferred browser size.

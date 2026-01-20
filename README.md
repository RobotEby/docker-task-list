# 🐋 Docker Todo-List - Fullstack Application

![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)

### This project is a complete to-do list application built to demonstrate the power of **containerization** and **orchestration** of microservices.

### The application uses a modern frontend in React, a robust API in Node.js, a NoSQL database, and an automated CI/CD pipeline.

## Features

- ✅ Create, list, and remove tasks.
- ✅ Mark tasks as completed.
- ✅ Data persistence with MongoDB.
- ✅ Responsive interface with TailwindCSS.
- ✅ Development environment identical to production via Docker.
- ✅ Automatic tests integrated into the workflow.

## Technologies Used

- **Frontend:** React, Vite, TailwindCSS.
- **Backend:** Node.js, Express, Mongoose.
- **Database:** MongoDB.
- **Infrastructure:** Docker, Docker Compose.
- **DevOps:** GitHub Actions (CI).

## How to Run

You don't need to install Node or MongoDB on your machine, just **Docker** and **Docker Compose**.

1. Clone the repository:

```bash
git clone https://github.com/RobotEby/journey-in-backend.git
cd docker-todo-list
```

2. Start the application:

```bash
docker-compose up --build
```

3. Access the application in your browser:

```bash
Frontend: http://localhost:5173
Backend API: http://localhost:5000/todos
```

## Testing

Tests are run automatically with each push to the repository via GitHub Actions. To run the tests locally via Docker:

```bash
docker-compose run --rm tests
```

## Project Structure

- `/frontend:` React application configured with Vite and Tailwind.
- `/backend:` Node.js API connected to MongoDB.
- `docker-compose.yml:` Definition and orchestration of services (db, api, web, tests).
- `.github/workflows:` Continuous integration pipeline configuration.

#### Developed with 🐋 by [RobotEby](https://github.com/RobotEby)

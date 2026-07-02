# ToDo API – Node.js + Express + TypeScript

A RESTful ToDo API built with Node.js, Express, and TypeScript.  
The project follows a clean architecture using routes, controllers, and middleware.

---

## Features

- Create a todo  
- Get all todos  
- Get todo by ID  
- Update todo  
- Delete todo  
- Request logging middleware  
- Input validation  
- REST API structure  

---

## Tech Stack

- Node.js  
- Express.js  
- TypeScript  
- tsx  

---

## Project Structure

src/

├── server.ts

├── app.ts

├── routes/

├── controllers/

├── middleware/

├── models/

├── data/

---

## Setup

npm install

---

## Run Project

Development:
npm run dev

Production:
npm run build
npm start

---

## API Endpoints

Method | Endpoint | Description
------ | -------- | -----------
GET | /todos | Get all todos
GET | /todos/:id | Get todo by id
POST | /todos | Create todo
PUT | /todos/:id | Update todo
DELETE | /todos/:id | Delete todo

---

## Example Todo

{
  "id": 1,
  "title": "Learn Express",
  "completed": false
}

---

## Purpose

This project was built to practice backend development fundamentals, REST APIs, and TypeScript structure.

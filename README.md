
# SAY Home:

Say Home is an AI-powered real estate CRM platform designed to streamline property management, prospect tracking, customer interactions, and sales operations.
The platform combines a client-facing portal with a powerful administrative dashboard, helping agencies manage prospects, appointments, properties, and customer support from a single centralized system.

<div align="center">
  
  ![Logo](say-home-client/public/logo-w-o-bg.png)

</div>

## Features

- Property browsing and management
- Secure authentication with JWT
- Prospect and lead management
- Appointment scheduling
- Commercial sales pipeline
- AI-powered property matching
- Prospect classification (Hot / Warm / Cold)
- AI customer support chatbot
- Ticket and support management
- Administrative analytics dashboard


## Tech Stack

**Frontend**:
React, Next.js, TypeScript, Tailwind CSS

**Backend**:
Spring Boot, Spring Security, JWT

**Database**:
MySQL, Qdrant

**AI**:
Python, Random Forest, Langchain

**Tools**:
Docker, Postman, GitHub


## Screenshots

![App Screenshot](https://dummyimage.com/468x300?text=App+Screenshot+Here)


## Run Locally

Clone the project

```bash
  git clone https://link-to-project
```


Install dependencies (front office)

```bash
  cd say-home-client && npm install
```

Navigate to the project root

```bash
  cd say-home
```

Install dependencies (back office)

```bash
  cd say-home-admin && npm install
```

Install dependencies (backend)

```bash
  cd say-home-api && mvn clean install -DskipTest
```

Install dependencies (ai)

```bash
  cd say-home-ai && venv/Scripts/Activate && pip install -r requirements.txt
```

Start the servers

```bash
  cd say-home-client && npm run dev 
  cd say-home-admin && npm run dev
```

```bash
  mvn spring-boot:run
```

```bash
  uvicorn main:app --reload --port 8000
```
## Environment Variables

To run this project, contact us for the env vars

## Authors

- [@AxTcH4](https://www.github.com/AxTcH4)
- [@Yagashirag77](https://www.github.com/Yagashirag77)
- [@salmanazih](https://www.github.com/salmanazih)

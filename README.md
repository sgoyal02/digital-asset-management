
# Digital Asset Management
A centralized platform that manages digital assets end-to-end, automates intelligence around content, and provides visibility into usage, compliance, and performance- without slowing down day-to-day operations.
It is designed around asynchronous event-driven processing so that user-facing APIs remain responsive while heavy operations execute in background workers.


## Features

### Authentication & Authorization

- JWT Authentication
- Access token + refresh token strategy
- Role-based access control
- Protected APIs
- Automatic access token refresh
- Secure logout

### Asset Management
- Upload images, videos, docs and audio
- Store files in minIO object storage
- Asset versioning
- Asset lifecycle manage
- Collections & folders
- Metadata management
- Asset ownership
- Usage 
- Expiry track

### Background processing
- Event driven architecture
- RabbitMQ message queues
- Background workers
- Media processing
- Duplicate detection
- Expiry tracking
- Thumbnail generation
- Metadata generation
- Content classification
- Report generation

### Search & Discovery
- Filters
- Lifecycle filters
- Collection based browsing

### Analytics
- Usage reports
- Duplicate reports
- Expired assets
- Compliance reports
- Processing statistics


## Tech Stack
### Frontend
- React
- TypeScript
- Vite
- React Router
- Axios
- TailwindCSS

### Backend
- Node.js
- TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- RabbitMQ
- minIO
- JWT
- Multer
- Docker

### Infrastructure
- Docker compose
- PostgreSQL
- RabbitMQ
- MinIO
- Nginx

## Project Structure

```
root
│
├── apps
│   ├── api
│   └── web
│
├── infra
│   ├── docker-compose.yml
│   ├── .env.example
│   ├── postgres.env.example
│   ├── minio.env.example
│   └── rabbitmq.env.example
│   └── nginx
│
├── README.md
└── package.json
└── .github/workflows
```

## Folder Structure

### apps/

-contains all application source code.


#### apps/api
Backend REST API for authentication, asset management, metadata, analytics and worker communication.

```
api
│
├── prisma
│
├── src
│   ├── middleware
│   ├── modules
│   ├── workers
│   ├── queues
│   ├── lib
│   ├── tests
│   ├── services
│   ├── events
│   ├── types
│   ├── router.ts
│   └── app.ts
│   └── index.ts
│
├── Dockerfile
└── package.json
```

#### modules/ - feature based architecture.

```
auth
assets
collections
dashboard
jobs
reports
```
every module follows same structure.

```
auth

controller.ts
service.ts
router.ts
```

#### prisma/ - contains prisma ORM config.
It has postgreSQL schema, db migrations, prisma client config.

```
schema.prisma
migrations/
```

#### workers/ - contains async worker implementations.
workers consume events from RabbitMQ separately from API requests.
- Duplicate detect
- Metadata extracte
- Image analysis, video process- thumbnail generate
- Report generate
- Expiry validation

#### queue/ - rabbitMQ producers and consumers.
It has connection, publisher, queues config.
- Asset upload
- Thumbnail generate
- Asset update
- Asset approve
- Asset archive
- Generate report
- Detect duplicate

---

#### apps/web
React frontend with ts, and vite

```
src
│
├── services
├── components
├── pages
├── hooks
├── context
├── providers
├── images
├── modules
├── routes
├── utils
└── validations
├── App.tsx
├── Dockerfile
├── index.css
├── main.tsx
```

#### pages/ - application web pages.
```
Login
Dashboard
Assets
Collections
Reports
```

#### modules/ - specific page flow features separately.
```
Assets
Collections
Jobs_admin
Reports
```
#### components/ - reusable UI components.
Example-
```
layout
DialogModal
ErrorFormat
StatusBadge
```
#### services/ - api communication.
- axios instance : axios instance with automatic token refresh.
- centralized api service


#### infra/ - project infrastructure config to run platform
```
docker-compose.yml
postgres.env.example
minio.env.example
rabbitmq.env.example
nginx/
```

#### Docker Compose
its infrastructure services include-
- api
- web
- postgreSQL
- rabbitMQ
- minIO

Run
```bash
cd infra
docker compose up --build
```
---

## Authentication Flow
It uses JWT access tokens together with refresh tokens.

### Login
1. User logs in.
2. API validates credentials
3. access Token is generated.
4. refresh Token is generated.
5. refresh Token is stored securely.
6. tokens are returned to frontend.

### Access token refresh
1. token expired
2. api return 401
3. axios interceptor calls refresh api
4. api validate refresh token, generate new access token
5. return original req

### Asset Upload Flow
1. user upload file
2. in api, stored in minio storage
3. asset metadata
4. postgresql
5. publish event
6. rabbitmq flow, bacjground worker process
7. thumbnail generates, duplicate detection process
8. metadata extract,
9. DB update
User receive immediate response while heavy processing continues in async

### Background Processing
Heavy CPU intensive work, it never blocks user requests.
Example-
- Image analysis
- Video inspect
- Thumbnail generate
- Metadata extract
- Duplicate detect
- Report generation
- Expiry validation

### RabbitMQ
It is used as messaging backbone.
example events-
```
asset.uploaded
asset.reviewed
asset.approved
asset.archived
report.generate
duplicate.detect
```
### MinIO
It acts as object storage of following-
- Images
- videos
- audio
- docs
- Asset versions
- Generated thumbnails

### Prisma
Prisma ORM manages PostgreSQL. it has-
- DB schema
- migrations
- Type-safe queries
- Relations

entities in this-
- Users
- Assets
- AssetVersions
- Collections
- Metadata
- Job logs
- Reports Cal
- Usage logs
- Asset collections


### Environment Variables
Example env files are provided inside the infra directory.

## Run Locally

Clone repository
```bash
git clone <repo-url>
```

Install all dependencies-
```bash
pnpm install
```

Start infrastructure
```bash
docker compose -f infra/docker-compose.yml up -d
```

## Assigment Objectives Covered
- Asset upload and management
- Asset versioning
- Metadata management
- Lifecycle workflows
- Background processing
- Message queue architecture
- Object storage
- Search and filtering
- Reporting and analytics
- Secure authentication
- Role based authorization
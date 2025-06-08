# Celebrity Recognition Backend

A Node.js backend for a celebrity recognition application that uses Clarifai's API to detect celebrities in images.

## Features

- User authentication (register, login, profile management)
- Celebrity recognition using Clarifai API
- Entry tracking for user activity
- RESTful API design
- Secure password hashing with bcrypt
- Input validation and sanitization
- Error handling and logging
- Environment-based configuration
- Database migrations

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v10 or higher)
- npm or yarn
- Clarifai API key (sign up at [Clarifai](https://www.clarifai.com/))

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd celebrity_backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # Database Configuration
   DATABASE_URL=postgres://username:password@localhost:5432/celebrity_db
   
   # Security
   JWT_SECRET=your_jwt_secret_key_here
   CLARIFAI_API_KEY=your_clarifai_api_key_here
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
   RATE_LIMIT_MAX=100  # 100 requests per window per IP
   ```

4. Set up the database:
   ```bash
   # Create a new PostgreSQL database
   createdb celebrity_db
   
   # Run database migrations
   npm run knex:migrate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /register` - Register a new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```

- `POST /signin` - Sign in
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```

### User

- `GET /profile/:id` - Get user profile
- `PUT /profile/:id` - Update user profile

### Image

- `PUT /image` - Increment user's entry count
  ```json
  {
    "id": 1
  }
  ```
  
- `POST /imageurl` - Detect celebrity in image
  ```json
  {
    "input": "https://example.com/celebrity.jpg"
  }
  ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Node environment | development |
| DATABASE_URL | PostgreSQL connection URL | - |
| JWT_SECRET | Secret for JWT signing | - |
| CLARIFAI_API_KEY | Clarifai API key | - |
| RATE_LIMIT_WINDOW_MS | Rate limit window in ms | 900000 (15 min) |
| RATE_LIMIT_MAX | Max requests per window per IP | 100 |

## Database Schema

### users
- `id` - Primary key
- `name` - User's full name
- `email` - User's email (unique)
- `entries` - Number of image submissions
- `joined` - Timestamp of account creation
- `created_at` - Timestamp of record creation
- `updated_at` - Timestamp of last update

### login
- `id` - Primary key
- `email` - User's email (foreign key to users.email)
- `hash` - Hashed password
- `created_at` - Timestamp of record creation
- `updated_at` - Timestamp of last update

## Deployment

### Prerequisites
- A server with Node.js and PostgreSQL installed
- PM2 or similar process manager (recommended)
- Nginx or similar reverse proxy (recommended)

### Steps
1. Set up your production environment variables in `.env`
2. Install dependencies with `npm install --production`
3. Run database migrations: `NODE_ENV=production npm run knex:migrate`
4. Start the server: `NODE_ENV=production npm start`

## Security Considerations

- Always use HTTPS in production
- Keep your environment variables secure
- Regularly update dependencies
- Use a strong JWT secret
- Implement proper CORS policies
- Use rate limiting to prevent abuse

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

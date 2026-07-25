# MDP Tours Backend

A robust, production-ready REST API powering the MDP Tours application. Built with [NestJS](https://nestjs.com/) and MongoDB, designed for scalability, type safety, and seamless integrations.

## 🚀 Tech Stack

- **Framework:** NestJS (Node.js)
- **Database:** MongoDB (via Mongoose)
- **Authentication:** JWT with Passport
- **Documentation:** Swagger OpenAPI
- **Validation:** class-validator & class-transformer
- **Storage:** AWS S3 SDK (Client-S3)
- **Logging:** Winston Logger

## 🔒 Security Measures

This backend is secured for production deployment with several layers of protection:

1. **Helmet:** Automatically sets secure HTTP headers to mitigate cross-site scripting (XSS), clickjacking, and other well-known web vulnerabilities.
2. **Rate Limiting (Throttler):** Prevents brute-force and DDoS attacks. By default, limits are set to 100 requests per minute per IP.
3. **CORS:** Strictly configured to only allow requests from whitelisted frontend domains (`https://mdptours.com`, `http://localhost:5173`, etc.) while securely handling credentials.
4. **Validation Pipeline:** Global validation pipes with `whitelist` and `forbidNonWhitelisted` enabled, ensuring that only explicitly expected data can enter the application layer.

## 🛠 Prerequisites

- Node.js (v18+)
- MongoDB (Local or Atlas)
- AWS Account (for S3 bucket configuration)

## ⚙️ Environment Variables

Create a `.env` file in the root directory. The following variables are required for the application to run successfully:

```env
# Application Port
PORT=3001

# Database
MONGODB_URI=mongodb://localhost:27017/mdp-tours

# Authentication
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d

# AWS S3 (If applicable)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=your_bucket_name
```
*(Do not commit your `.env` file to version control!)*

## 📦 Installation & Running

```bash
# Install dependencies
npm install

# Run in development mode (with watch)
npm run start:dev

# Build for production
npm run build

# Start production build
npm run start:prod
```

## 📚 API Documentation

This project utilizes Swagger for interactive API documentation. 

Once the server is running, navigate to:
**[http://localhost:3001/api/docs](http://localhost:3001/api/docs)**

Here you can view all available endpoints, required parameters, and test requests directly via the browser. Bearer Token authentication is supported within the Swagger UI.

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Generate test coverage
npm run test:cov
```

## 🚢 Deployment

This backend is designed to be easily deployed to modern cloud platforms (AWS, Render, Railway, DigitalOcean). 
Ensure that your production environment sets `NODE_ENV=production` and that all environment variables matching the `.env` template are securely configured in your hosting provider's dashboard.

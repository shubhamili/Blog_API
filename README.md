
# 📝 Blog Post Management API

A robust, secure, and scalable backend API built using Node.js, Express, MongoDB, and Passport.js for managing blog posts, users, authentication, authorization, and interaction features like likes and comments.

---

## 🚀 Features

- ✅ User registration & login with JWT-based authentication
- ✅ Role-based access control (`admin`, `editor`, `user`) using Passport.js
- ✅ CRUD operations on blog posts
- ✅ File upload for post pictures using `multer`
- ✅ Like/unlike posts
- ✅ Add comments to posts
- ✅ Secure routes with Passport JWT strategy
- ✅ Modular architecture with controllers, models, middlewares

---

## 🧱 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT + Passport.js
- **Authorization:** Role-based with custom middleware
- **File Upload:** Multer
- **Environment Config:** dotenv

---

## 🧑‍💻 Project Setup

1. **Clone the repository**

```bash
git clone https://github.com/your-username/blog-post-management.git
cd blog-post-management
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment**

Create a `.env` file in the root directory and add:

```env
PORT=5000
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
```

4. **Run the server**

```bash
npm run dev
```

---

## 🔐 Authentication & Authorization

- Users register/login and receive a JWT token.
- Token is sent via HTTP headers (`Authorization: Bearer <token>`) or cookies.
- Passport verifies the token and attaches the user to `req.user`.
- Custom middleware `authorizeRoles()` checks if the user's role allows access.

---

## 🙌 Credits

Built by Shubham with ❤️  

---

## 📌 License

This project is open-source and available under the [MIT License](LICENSE).

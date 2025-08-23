# Messaging App

A real-time messaging application that allows users to send text messages and files, with features like file expiration and real-time updates using Pusher.

## Features

- **User Authentication**: Secure login and registration system.
- **Real-Time Messaging**: Instant updates using Pusher.
- **File Sharing**: Upload and share files with automatic expiration after 24 hours.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Cloudinary Integration**: Store and manage uploaded files.
- **CDN Cache Invalidation**: Ensure files are removed from the internet after deletion.

## Technologies Used

### Frontend
- React
- Axios
- CSS

### Backend
- Node.js
- Express
- MongoDB (Mongoose)
- Cloudinary
- Multer
- Pusher

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/messaging-app.git
   ```

2. Navigate to the project directory:
   ```bash
   cd messaging-app
   ```

3. Install dependencies for both frontend and backend:
   ```bash
   cd backend
   npm install
   cd ../frontend
   npm install
   ```

4. Set up environment variables:
   - Create a `.env` file in the `backend` directory with the following:
     ```env
     PORT=5000
     MONGO_URI=your_mongo_connection_string
     CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
     CLOUDINARY_API_KEY=your_cloudinary_api_key
     CLOUDINARY_API_SECRET=your_cloudinary_api_secret
     PUSHER_APP_ID=your_pusher_app_id
     PUSHER_KEY=your_pusher_key
     PUSHER_SECRET=your_pusher_secret
     PUSHER_CLUSTER=your_pusher_cluster
     ```

5. Start the backend server:
   ```bash
   cd backend
   node server.js
   ```

6. Start the frontend development server:
   ```bash
   cd frontend
   npm start
   ```

7. Open the app in your browser:
   ```
   http://localhost:3000
   ```

## Folder Structure

```
backend/
  config/
    Cloudinary.js
    pusher.js
  controllers/
    messageController.js
  middleware/
    auth.js
  models/
    Message.js
    User.js
  routes/
    auth.js
    messages.js
frontend/
  public/
    index.html
  src/
    components/
      Chat.js
      MessageForm.js
      MessageList.js
    App.js
    index.js
```

## Deployment

This app can be deployed to platforms like Render, Vercel, or Heroku. Ensure the environment variables are properly configured in the deployment settings.


## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## Acknowledgments

- [Cloudinary](https://cloudinary.com/)
- [Pusher](https://pusher.com/)
- [Multer](https://github.com/expressjs/multer)

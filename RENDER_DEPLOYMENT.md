# Deploying Car Rental System to Render

## Prerequisites
1. GitHub/GitLab account with this repository
2. Render account (free tier available)
3. MongoDB Atlas account (free tier available)

## Step-by-Step Deployment Guide

### 1. Setup MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user with password
4. Whitelist all IPs (0.0.0.0/0) for Render access
5. Get your connection string (it looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/car_rental`)

### 2. Deploy Backend to Render

1. **Create New Web Service**
   - Go to Render Dashboard → New → Web Service
   - Connect your GitHub/GitLab repository
   - Name: `car-rental-backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `node backend/server.js`

2. **Set Environment Variables** (in Render dashboard)
   ```
   NODE_ENV=production
   PORT=5001
   MONGODB_URI=<your-mongodb-atlas-connection-string>
   JWT_SECRET=<generate-a-secure-random-string>
   JWT_EXPIRE=7d
   CLIENT_URL=<will-be-your-frontend-url-after-step-3>
   
   # Payment Gateway
   RAZORPAY_KEY_ID=<your-razorpay-key>
   RAZORPAY_KEY_SECRET=<your-razorpay-secret>
   RAZORPAY_WEBHOOK_SECRET=<your-webhook-secret>
   
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=<your-email>
   EMAIL_PASS=<your-app-password>
   
   # SMS Configuration (optional)
   MSG91_AUTH_KEY=<your-msg91-key>
   MSG91_SENDER_ID=CARNTL
   ADMIN_PHONE=<admin-phone-number>
   ```

3. **Deploy** - Render will automatically deploy
4. **Note your backend URL** (e.g., `https://car-rental-backend.onrender.com`)

### 3. Deploy Frontend to Render

1. **Create New Static Site**
   - Go to Render Dashboard → New → Static Site
   - Connect same repository
   - Name: `car-rental-frontend`
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/build`

2. **Set Environment Variables**
   ```
   REACT_APP_API_URL=<your-backend-url-from-step-2>/api
   ```
   Example: `https://car-rental-backend.onrender.com/api`

3. **Deploy** - Render will build and deploy
4. **Note your frontend URL** (e.g., `https://car-rental-frontend.onrender.com`)

### 4. Update Backend CLIENT_URL

1. Go back to your backend service settings
2. Update `CLIENT_URL` environment variable to your frontend URL
3. Trigger a manual deploy

### 5. Important Considerations

#### File Uploads
⚠️ **Critical**: Render's file system is ephemeral. Uploaded car images will be lost on redeploye.

**Solutions:**
- **Option A**: Use **Cloudinary** (recommended, free tier available)
  - Sign up at [Cloudinary](https://cloudinary.com)
  - Update `backend/middleware/upload.js` to use Cloudinary SDK
  - Store image URLs in MongoDB instead of local paths

- **Option B**: Use **AWS S3** or **Render Disks** (paid)

#### Free Tier Limitations
- Backend service spins down after inactivity (cold starts take 30-50 seconds)
- Consider upgrading to paid plan for production use

#### Database Seeding
If you need to seed the database:
```bash
# Run this command in Render Shell (Service → Shell)
node backend/seed.js
```

#### Razorpay Webhook
Update your Razorpay webhook URL to:
`https://your-backend-url.onrender.com/api/razorpay/webhook`

## Testing Deployment

1. Visit your frontend URL
2. Try to register/login
3. Test car listing and booking functionality
4. Verify payment integration works
5. Check email notifications

## Troubleshooting

### Backend won't connect to MongoDB
- Check MongoDB Atlas whitelist includes `0.0.0.0/0`
- Verify connection string format
- Check MongoDB user permissions

### CORS Errors
- Verify `CLIENT_URL` in backend matches frontend URL exactly
- No trailing slash in URLs

### Images not displaying
- Implement cloud storage solution (Cloudinary/S3)
- Update upload middleware and car image URLs

### Cold Start Issues
- Free tier spins down after 15 min inactivity
- First request after inactivity takes 30-50 seconds
- Consider upgrading to paid tier

## Post-Deployment Checklist

- [ ] MongoDB Atlas connected and accessible
- [ ] Backend API responding at `/api/health` or similar endpoint
- [ ] Frontend loads and displays correctly
- [ ] User registration/login works
- [ ] Car listing displays
- [ ] Booking system functional
- [ ] Payment gateway integrated
- [ ] Email notifications working
- [ ] Admin dashboard accessible
- [ ] Image uploads handled (via cloud storage)

## Useful Commands

```bash
# View backend logs
# Go to: Render Dashboard → Your Service → Logs

# Access backend shell
# Go to: Render Dashboard → Your Service → Shell

# Seed database
node backend/seed.js

# Check MongoDB connection
node -e "require('mongoose').connect('YOUR_MONGODB_URI').then(() => console.log('Connected')).catch(console.error)"
```

## Estimated Costs
- **MongoDB Atlas**: Free (512MB storage)
- **Render Free Tier**: 
  - Backend: Free (750 hrs/month)
  - Frontend: Free (100GB bandwidth/month)
- **Cloudinary**: Free (25GB storage, 25GB bandwidth)

**Total for minimal traffic: $0/month** ✅

For production with consistent traffic, expect $7-25/month for Render paid plans.

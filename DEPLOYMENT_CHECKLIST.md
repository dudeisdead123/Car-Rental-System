# 🚀 Quick Deployment Checklist

## Before Deployment

### 1. Database Setup
- [ ] Create MongoDB Atlas account
- [ ] Create cluster and database
- [ ] Create database user
- [ ] Whitelist all IPs (0.0.0.0/0)
- [ ] Copy connection string

### 2. Code Changes (✅ Already Done)
- [x] Updated `frontend/src/utils/api.js` to use `REACT_APP_API_URL`
- [x] Updated `backend/server.js` CORS for production
- [x] Updated server to listen on `0.0.0.0`
- [x] Created `render.yaml` configuration
- [x] Added build scripts to package.json

### 3. File Upload Setup (⚠️ CRITICAL - Must Do)
- [ ] Sign up for Cloudinary account
- [ ] Get Cloudinary credentials (cloud_name, api_key, api_secret)
- [ ] Install: `npm install cloudinary multer-storage-cloudinary`
- [ ] Update `backend/middleware/upload.js` (see CLOUDINARY_SETUP.md)
- [ ] Test image upload locally

### 4. Environment Variables Preparation
Prepare these values (you'll enter in Render dashboard):

**Backend:**
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<generate-random-32-char-string>
JWT_EXPIRE=7d
PORT=5001
CLIENT_URL=<frontend-url-after-deployment>
RAZORPAY_KEY_ID=<your-key>
RAZORPAY_KEY_SECRET=<your-secret>
RAZORPAY_WEBHOOK_SECRET=<your-webhook-secret>
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<your-email>
EMAIL_PASS=<your-app-password>
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
NODE_ENV=production
```

**Frontend:**
```
REACT_APP_API_URL=<backend-url>/api
```

## Deployment Steps

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Prepare for Render deployment"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### Step 2: Deploy Backend
1. Login to [Render](https://render.com)
2. New → Web Service
3. Connect repository
4. Settings:
   - Name: `car-rental-backend`
   - Environment: `Node`
   - Build: `npm install`
   - Start: `node backend/server.js`
5. Add all backend environment variables
6. Create Web Service
7. **Copy backend URL**: `https://car-rental-backend-xxxx.onrender.com`

### Step 3: Deploy Frontend
1. New → Static Site
2. Connect same repository
3. Settings:
   - Name: `car-rental-frontend`
   - Build: `cd frontend && npm install && npm run build`
   - Publish: `frontend/build`
4. Add environment variable:
   - `REACT_APP_API_URL` = `<backend-url-from-step-2>/api`
5. Create Static Site
6. **Copy frontend URL**: `https://car-rental-frontend-xxxx.onrender.com`

### Step 4: Update Backend CLIENT_URL
1. Go to backend service
2. Environment → Edit
3. Update `CLIENT_URL` to frontend URL from Step 3
4. Save and redeploy

### Step 5: Seed Database (Optional)
1. Go to backend service → Shell
2. Run: `node backend/seed.js`

## Post-Deployment Testing

- [ ] Frontend loads
- [ ] Can view car listings
- [ ] User registration works
- [ ] User login works
- [ ] Can make bookings
- [ ] Payment gateway works
- [ ] Admin dashboard accessible
- [ ] Image uploads work (via Cloudinary)
- [ ] Email notifications sent
- [ ] No console errors

## Common Issues & Fixes

### "Network Error" / CORS Error
- Check `CLIENT_URL` in backend matches frontend URL exactly
- No trailing slashes in URLs

### Images not loading
- Verify Cloudinary setup completed
- Check image URLs in database (should be Cloudinary URLs)

### Backend not responding
- Check MongoDB connection string
- Verify MongoDB Atlas whitelist
- Check Render logs for errors

### Frontend shows blank page
- Check `REACT_APP_API_URL` is correct
- Verify backend is running
- Check browser console for errors

## Monitoring

**Backend Logs**: Render Dashboard → Backend Service → Logs
**Frontend Logs**: Render Dashboard → Frontend Service → Logs
**Database**: MongoDB Atlas → Cluster → Metrics

## Cost Estimate
- MongoDB Atlas: **Free**
- Render Backend: **Free** (with cold starts)
- Render Frontend: **Free**
- Cloudinary: **Free** (25GB)

**Total: $0/month** for low-medium traffic

Upgrade to paid plans ($7+/month) for:
- No cold starts
- Better performance
- Custom domains
- More bandwidth

---

✅ **You're ready to deploy!** Follow the steps above carefully.

📚 **Detailed guides available:**
- [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) - Complete deployment guide
- [CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md) - Image upload configuration

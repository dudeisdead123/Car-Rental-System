# ⚠️ IMPORTANT: File Upload Configuration for Production

## Current Issue
Your app uses local file storage for car images in the `/uploads/cars/` directory. **This will NOT work on Render** because:
- Render's filesystem is ephemeral (temporary)
- Files are deleted on every deployment
- Multiple server instances can't share local files

## Required Fix: Use Cloudinary (Recommended)

### Step 1: Install Cloudinary
```bash
npm install cloudinary multer-storage-cloudinary
```

### Step 2: Update `backend/middleware/upload.js`

Replace current content with:

```javascript
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'car-rental/cars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, height: 750, crop: 'limit' }]
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = upload;
```

### Step 3: Get Cloudinary Credentials

1. Sign up at [Cloudinary](https://cloudinary.com/users/register/free)
2. Go to Dashboard
3. Copy your credentials:
   - Cloud Name
   - API Key
   - API Secret

### Step 4: Add Environment Variables

In Render (and your local `.env`):
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 5: Update Car Controller (if needed)

The image URL will now be stored as a full Cloudinary URL instead of local path:
- Before: `/uploads/cars/car-123.jpg`
- After: `https://res.cloudinary.com/your-cloud/image/upload/v123/car-rental/cars/car-123.jpg`

Your frontend should work automatically since it's just displaying image URLs.

## Alternative: Keep Local Storage (Development Only)

If you want to keep local storage for development but use Cloudinary in production:

```javascript
// backend/middleware/upload.js
const multer = require('multer');
const path = require('path');

let storage;
let upload;

if (process.env.NODE_ENV === 'production') {
  // Use Cloudinary for production
  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  const cloudinary = require('cloudinary').v2;
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'car-rental/cars',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    }
  });
} else {
  // Use local storage for development
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/cars/');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'car-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
}

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;
```

## Testing Locally with Cloudinary

After implementing Cloudinary:
```bash
# Add to your .env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Restart your server
npm run dev
```

Try uploading a car image - it should now go to Cloudinary!

## Free Tier Limits (Cloudinary)
- ✅ 25 GB storage
- ✅ 25 GB bandwidth/month
- ✅ More than enough for most car rental apps

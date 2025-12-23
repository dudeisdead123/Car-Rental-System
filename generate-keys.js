#!/usr/bin/env node

/**
 * Generate secure random keys for deployment
 * Run: node generate-keys.js
 */

const crypto = require('crypto');

console.log('\n🔐 Secure Keys for Render Deployment\n');
console.log('Copy these values to your Render environment variables:\n');
console.log('=' .repeat(60));

// Generate JWT Secret
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('\nJWT_SECRET=');
console.log(jwtSecret);

// Generate Webhook Secret (for Razorpay)
const webhookSecret = crypto.randomBytes(32).toString('hex');
console.log('\nRAZORPAY_WEBHOOK_SECRET=');
console.log(webhookSecret);

console.log('\n' + '='.repeat(60));
console.log('\n✅ Keep these secrets safe and never commit to GitHub!');
console.log('💡 Add them to Render dashboard Environment Variables\n');

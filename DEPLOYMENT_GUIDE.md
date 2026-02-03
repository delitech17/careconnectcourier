# CareConnect Courier - Render Deployment Guide

## Quick Start for Render Deployment

Your CareConnect Courier application is ready for production deployment on Render! Follow these steps to get it live in minutes.

## 📋 Pre-Deployment Checklist

- [ ] GitHub account with your repository
- [ ] Render account (free at render.com)
- [ ] Secure values for `ADMIN_TOKEN` and `JWT_SECRET` (generate random strings)
- [ ] Gmail account with App Password setup (for email notifications)

## 🚀 Step-by-Step Deployment

### 1. Generate Secure Tokens

Before deployment, generate secure tokens for production:

```bash
# Generate ADMIN_TOKEN (run in PowerShell or terminal)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT_SECRET (run again)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save these values - you'll need them in Step 4.

### 2. Prepare Gmail App Password

1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already done
3. Click **App passwords** (appears after 2FA is enabled)
4. Select: App: **Mail**, Device: **Windows Computer**
5. Google will generate a 16-character password
6. Copy this password - you'll use it as `EMAIL_PASS`

### 3. Connect GitHub to Render

1. Visit [render.com](https://render.com) and sign up/login
2. Click **Dashboard** → **New +** → **Web Service**
3. Select **Deploy an existing repository**
4. Authorize GitHub and select your `careconnectcourier` repository
5. Click **Connect**

### 4. Configure Web Service

Set the following values:

| Field | Value |
|-------|-------|
| **Name** | `careconnect-courier` |
| **Runtime** | Node |
| **Region** | Oregon (or your preferred region) |
| **Branch** | main |
| **Build Command** | `cd node_server && npm install` |
| **Start Command** | `cd node_server && npm start` |
| **Plan** | Free (can upgrade later) |

### 5. Add Environment Variables

Click **Environment** and add these variables:

```
NODE_ENV = production
ADMIN_TOKEN = [Your generated token from Step 1]
JWT_SECRET = [Your generated secret from Step 1]
APP_URL = https://careconnect-courier.onrender.com
ALLOWED_ORIGINS = https://careconnect-courier.onrender.com
EMAIL_USER = your-email@gmail.com
EMAIL_PASS = [16-char password from Step 2]
RATE_LIMIT_MAX = 200
JSON_LIMIT = 100kb
```

**⚠️ Important:** 
- Replace `careconnect-courier` with your actual service name
- Do NOT use the example values!
- Keep `EMAIL_USER` and `EMAIL_PASS` private

### 6. Deploy!

1. Click **Create Web Service**
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Build and start your application
   - Assign a live URL

3. Wait for deployment to complete (watch the logs)
4. Your app will be live at: `https://careconnect-courier.onrender.com`

## ✅ Post-Deployment Verification

Once deployed, test these features:

1. **Homepage:** Visit your deployed URL
2. **Contact Form:** Submit a message (check console logs for confirmation)
3. **Tracking:** Enter any tracking code (public endpoint)
4. **Admin Panel:** Go to `/admin/index.html` and login with your `ADMIN_TOKEN`
5. **Create Shipment:** Test admin functionality by creating a test shipment

## 📊 Monitoring Your Deployment

### View Logs
- Go to **Render Dashboard** → Your Service → **Logs**
- Real-time updates of application activity

### Check Metrics
- **Settings** → **Metrics** tab
- Monitor CPU, memory, and request volumes

### Enable Email Alerts
- **Settings** → **Notifications**
- Get alerts for deployment failures

## 🔄 Updating Your Application

Every time you push changes to GitHub:

1. Render automatically detects the change
2. Triggers a new build automatically
3. Deploys the new version (zero-downtime)
4. **No manual action needed!**

To push updates:
```bash
git add .
git commit -m "Update: description of changes"
git push origin main
```

## 🆓 Free Plan vs Paid Plans

### Free Plan
- ✅ Zero cost
- ✅ HTTPS included
- ✅ Automatic deployments
- ⚠️ Service sleeps after 15 min of inactivity
- ⚠️ First request takes ~30 seconds to wake up

### Paid Plans ($7+/month)
- ✅ Always-on service
- ✅ 24/7 uptime
- ✅ Better performance
- ✅ Priority support

**Recommendation:** Start with Free plan, upgrade when needed.

## 🗄️ Data Storage

Your application uses JSON files for data storage. This works for demo/small-scale usage but consider:

### Current Setup (JSON files)
- ✅ Simple, no setup needed
- ❌ Data persists only in-memory on Render
- ❌ Not suitable for production with real users

### For Production, Consider:
1. **PostgreSQL** (free tier available)
2. **MongoDB Atlas** (free tier)
3. **AWS S3** for file storage
4. **Supabase** (Firebase alternative)

## 🔐 Security Checklist

- [ ] Changed `ADMIN_TOKEN` to a random string
- [ ] Changed `JWT_SECRET` to a random string
- [ ] Using Gmail App Password (not your actual password)
- [ ] 2-Step Verification enabled on Gmail
- [ ] `ALLOWED_ORIGINS` points to your Render domain
- [ ] `.env` file is in `.gitignore` (never commit secrets)

## 🆘 Troubleshooting

### Service Won't Build
**Error:** "Build failed"
- Check **Build Logs** in Render Dashboard
- Ensure `node_server/package.json` exists
- Verify all dependencies are listed

### Service Crashes After Deploy
**Error:** "Application crashed"
- Check **Logs** for error messages
- Verify all environment variables are set
- Check if `ADMIN_TOKEN` or `JWT_SECRET` are still default values

### CORS Errors in Browser Console
**Error:** "CORS policy blocked request"
- Make sure `ALLOWED_ORIGINS` includes your Render URL
- Remember to include `https://` prefix
- Check for trailing slashes

### Emails Not Sending
**Error:** "Failed to send email"
- Verify `EMAIL_USER` and `EMAIL_PASS` are correct
- Ensure Gmail has 2-Step Verification enabled
- Check App Password was generated correctly
- Try sending a test email from admin panel

### Service Takes 30+ Seconds to Load
**Cause:** Free plan spins down inactive services
- This is normal - service is waking up
- Upgrade to paid plan for instant startup
- Or keep service active with monitoring tools

## 📞 Support Resources

- **Render Help:** [docs.render.com](https://docs.render.com)
- **Gmail Issues:** [support.google.com/accounts](https://support.google.com/accounts)
- **Node.js Help:** [nodejs.org](https://nodejs.org)
- **Express.js Docs:** [expressjs.com](https://expressjs.com)

## 📈 Next Steps

After deployment:

1. **Set Custom Domain** (in Render → Settings → Custom Domains)
2. **Setup Database** (for production data)
3. **Configure Email** properly for notifications
4. **Monitor Performance** regularly
5. **Backup Data** periodically
6. **Scale as Needed** (upgrade plan)

## 📝 Deployment Checklist

Before pushing to production:

- [ ] `.env` file is in `.gitignore`
- [ ] `.env.example` has safe placeholder values
- [ ] All dependencies in `package.json`
- [ ] No hardcoded secrets in code
- [ ] Admin token changed from default
- [ ] JWT secret changed from default
- [ ] Gmail App Password configured
- [ ] CORS settings updated
- [ ] Database ready (if using real DB)
- [ ] Error handling working
- [ ] Rate limiting configured

---

**Ready to deploy?** Push your code to GitHub and follow the steps above!

**Questions?** Check the RENDER_DEPLOY.md file in this directory for detailed information.

**Happy deploying! 🚀**

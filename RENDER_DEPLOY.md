# Deployment to Render

This guide will help you deploy your CareConnect Courier application to Render.

## Prerequisites

1. A [Render account](https://render.com) (sign up for free)
2. Your GitHub repository connected to Render
3. Environment variables ready (see `.env.example`)

## Deployment Steps

### 1. Connect Your GitHub Repository

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Select **Deploy an existing repository**
4. Find your `careconnectcourier` repository and connect it
5. Click **Connect**

### 2. Configure the Web Service

Fill in the following settings:

- **Name:** `careconnect-courier`
- **Runtime:** `Node`
- **Build Command:** `cd node_server && npm install`
- **Start Command:** `cd node_server && npm start`
- **Plan:** Free (or paid if you want more resources)

### 3. Set Environment Variables

Click **Environment** and add the following variables:

```
NODE_ENV = production
ADMIN_TOKEN = [Your secure admin token - generate a random string]
JWT_SECRET = [Your JWT secret - generate a random string]
APP_URL = https://your-service-name.onrender.com
ALLOWED_ORIGINS = https://your-service-name.onrender.com
EMAIL_USER = [Your Gmail address]
EMAIL_PASS = [Your Gmail App Password - see note below]
RATE_LIMIT_MAX = 200
JSON_LIMIT = 100kb
```

### 4. Gmail App Password Setup (Required for Email Notifications)

1. Go to [Google Account Settings](https://myaccount.google.com)
2. Enable **2-Step Verification** if not already enabled
3. Go to **App passwords**
4. Select **Mail** and **Windows Computer**
5. Copy the generated password
6. Use this password as `EMAIL_PASS` in Render environment variables

### 5. Deploy

1. Click **Create Web Service**
2. Render will automatically:
   - Build your application
   - Install dependencies
   - Start your server
   - Assign you a URL: `https://careconnect-courier.onrender.com`

### 6. Verify Deployment

Once deployment is complete:

1. Visit your deployed URL: `https://your-service-name.onrender.com`
2. Test the application:
   - Check homepage loads correctly
   - Try the contact form
   - Test admin panel access with your `ADMIN_TOKEN`

## Important Notes

### Free Plan Considerations

- Your service will spin down after 15 minutes of inactivity (free plan)
- First request after spin-down takes ~30 seconds
- Upgrade to paid plan for 24/7 uptime

### Database Persistence

This application uses JSON files for storage, which are stored in the `/data` directory. On free Render plans, this data persists but may be cleared if the service is redeployed. For production, consider:

1. Using a proper database (PostgreSQL, MongoDB)
2. Implementing cloud storage (AWS S3, Supabase)

### Security Best Practices

1. **Change Default Tokens:** Always generate new, secure values for `ADMIN_TOKEN` and `JWT_SECRET`
2. **Use Strong Passwords:** Don't use the examples in this guide
3. **Enable HTTPS:** Render provides free HTTPS automatically
4. **Keep Secrets Safe:** Never commit `.env` files to GitHub

### Custom Domain

To use a custom domain:

1. In Render Dashboard → Your Web Service
2. Click **Settings** → **Custom Domains**
3. Add your domain
4. Follow DNS configuration instructions

### Monitoring & Logs

- View application logs in Render Dashboard
- Check server health in the **Metrics** tab
- Enable email notifications for deployment failures

## Troubleshooting

### Build Fails
- Check Build & Deploy Logs in Render Dashboard
- Ensure `node_server/package.json` exists
- Verify Node.js dependencies are correct

### Application Won't Start
- Check environment variables are set correctly
- Verify `ADMIN_TOKEN` and `JWT_SECRET` are not default values
- Review application logs for errors

### CORS Errors
- Update `ALLOWED_ORIGINS` to match your deployed domain
- Include both `https://` and `http://` variants if needed

### Email Not Sending
- Verify `EMAIL_USER` and `EMAIL_PASS` are correct
- Check Gmail App Password is properly set
- Ensure 2-Step Verification is enabled on Gmail account

## Update Deployments

Every time you push to GitHub:

1. Render automatically detects changes
2. Triggers build process
3. Deploys new version (zero-downtime)
4. No manual intervention needed

## Support

For issues with:
- **Render Deployment:** [Render Docs](https://render.com/docs)
- **Application Code:** Check server logs in Render Dashboard
- **Gmail Configuration:** [Google Support](https://support.google.com/accounts)

---

**Deployment Date:** [Add deployment date]
**Service URL:** [Add your deployed URL]
**Domain:** [Add custom domain if applicable]

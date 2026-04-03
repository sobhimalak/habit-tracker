# Forme Habits: Vercel Deployment Guide

To ensure your premium features (like **Reminders** and **Performance Analytics**) work perfectly on your live site, you need to add your security keys to the **Vercel Dashboard**.

## 1. Locating Your Keys
Open your local `.env` file in this repository. You will see these two lines:

```bash
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BElwQD...
VAPID_PRIVATE_KEY=x5ok1YJ...
```

## 2. Adding to Vercel
1.  Go to your **Vercel Dashboard** (vercel.com).
2.  Select your **`habit-tracker`** project.
3.  Navigate to **Settings** > **Environment Variables**.
4.  Add the following **two** variables manually:

### **Variable 1**
-   **Key**: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
-   **Value**: (Copy the long string from your `.env`)

### **Variable 2**
-   **Key**: `VAPID_PRIVATE_KEY`
-   **Value**: (Copy the short string from your `.env`)

## 3. Redeploy
1.  Go to the **Deployments** tab in Vercel.
2.  Find your latest deployment.
3.  Click the **three dots (...)** and select **Redeploy**.

> [!TIP]
> **Why this is needed**: For security, your browser and our backend need these "secret handshakes" (VAPID keys) to talk to each other without anyone else listening. Once these are in Vercel, your reminders will work perfectly! 🚀

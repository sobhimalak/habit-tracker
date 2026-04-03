# Forme Habits: Training Ecosystem

Premium Strength & Conditioning Tracker with Automated Habits & Real-time Gains Visualization.

## 🚀 Getting Started

1.  **Environment Setup**: Ensure your `.env` is configured (see `deployment_guide.md`).
2.  **Install Dependencies**: `npm install`
3.  **Database Migration**: `npx prisma db push`
4.  **Launch Dashboard**: `npm run dev`

---

## 🔔 The Signal (Reminders)

**Forme Habits** uses a secure signal dispatcher to keep you consistent. 

### **Automated (Production)**
The app is configured via `vercel.json` to automatically check for reminders every **1 minute**. 
-   **Status**: Active on Vercel after deployment.

### **Manual Trigger (Testing)**
If you want to trigger a reminder **right now** to test your setup, run this command in your terminal:

```bash
curl "http://localhost:3000/api/notifications/send?secret=habit-tracker12345"
```

*Note: Replace `localhost:3000` with your Vercel URL when testing live!*

---

## 📈 Evolution (Statistics)
Your progress is tracked via the **Tonnage Engine**. 
-   **Volume**: Sets x Reps x Weight.
-   **Tonnage Progress**: Compare this week's total moved weight vs last week.
-   **Consistency**: Branded streaks based on your completion logs.

---

## 🛠 Tech Stack
-   **Core**: Next.js 13.5 (App Router), TypeScript.
-   **Auth**: NextAuth.js (Google & Credentials).
-   **Database**: Prisma ORM with PostgreSQL.
-   **Aesthetics**: Glassmorphism, Tailwind CSS, Obsidian UI.
-   **Signals**: Web Push API & Vercel Crons.

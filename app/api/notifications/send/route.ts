export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import webpush from "web-push";

// Configure Web-Push with VAPID keys
webpush.setVapidDetails(
  "mailto:example@yourdomain.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");

    // Simple security check for cron/automation
    if (secret !== process.env.NEXTAUTH_SECRET) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinute}`;

    console.log(`Checking for reminders at ${currentTime}...`);

    // Find all habits that have a reminder at this time
    const habitsToRemind = await prisma.habit.findMany({
      where: {
        reminderTime: currentTime,
        isActive: true,
      },
      include: {
        user: {
          include: {
            pushSubscriptions: true
          }
        }
      }
    }) as any[]; // Cast to any to bypass stale prisma types if needed, but fields are verified

    console.log(`Found ${habitsToRemind.length} habits with reminders.`);

    const results = [];

    for (const habit of habitsToRemind) {
      const subscriptions = habit.user.pushSubscriptions;

      for (const sub of subscriptions) {
        const payload = JSON.stringify({
          title: `Time for ${habit.name}!`,
          body: `Don't break your streak! Reach your goal of ${habit.goalValue || 1} ${habit.goalUnit || 'times'} today.`,
          icon: "/icon-192x192.png",
          badge: "/badge-72x72.png",
          data: {
            url: `/`
          }
        });

        try {
          await webpush.sendNotification({
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth
            }
          }, payload);
          results.push({ success: true, habitId: habit.id, userId: habit.userId });
        } catch (error: any) {
          console.error(`Error sending push to user ${habit.userId}:`, error.statusCode);
          // If 410 or 404, the subscription is expired/invalid, should delete it
          if (error.statusCode === 410 || error.statusCode === 404) {
            await prisma.pushSubscription.delete({ where: { endpoint: sub.endpoint } });
          }
          results.push({ success: false, habitId: habit.id, error: error.message });
        }
      }
    }

    return NextResponse.json({ processed: habitsToRemind.length, results });
  } catch (error) {
    console.error("Error sending notifications:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

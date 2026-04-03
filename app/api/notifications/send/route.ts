export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import webpush from "web-push";

// VAPID Details Initialization Helper
function initWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  
  if (!publicKey || !privateKey) {
    console.error("VAPID Keys missing in environment.");
    return false;
  }

  webpush.setVapidDetails(
    "mailto:example@yourdomain.com",
    publicKey,
    privateKey
  );
  return true;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");
    const debug = searchParams.get("debug") === "true";
    const timeOverride = searchParams.get("time");

    // Simple security check for cron/automation
    if (secret !== process.env.NEXTAUTH_SECRET) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Initialize only when called
    if (!initWebPush()) {
      return new NextResponse("Notification Service Not Configured", { status: 500 });
    }

    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = now.getMinutes().toString().padStart(2, '0');
    const currentTime = timeOverride || `${currentHour}:${currentMinute}`;

    console.log(`Checking for reminders at ${currentTime} (Debug: ${debug})...`);

    let habitsToRemind: any[] = [];

    if (debug) {
      // In debug mode, find up to 5 habits to test
      habitsToRemind = await prisma.habit.findMany({
        take: 5,
        include: {
          user: { include: { pushSubscriptions: true } }
        }
      }) as any[];
    } else {
      // Standard time-based lookup
      habitsToRemind = await prisma.habit.findMany({
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
      }) as any[];
    }

    console.log(`Found ${habitsToRemind.length} habits to process.`);

    const results = [];

    for (const habit of habitsToRemind) {
      const subscriptions = habit.user.pushSubscriptions;

      for (const sub of subscriptions) {
        const payload = JSON.stringify({
          title: debug ? `[TEST] Signal for ${habit.name}` : `Time for ${habit.name}!`,
          body: debug ? "System diagnostic signal: Branded alerts are fully operational." : `Don't break your streak! Reach your goal of ${habit.goalValue || 1} ${habit.goalUnit || 'times'} today.`,
          icon: "/logo.png",
          badge: "/logo.png",
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
          if (error.statusCode === 410 || error.statusCode === 404) {
            await (prisma as any).pushSubscription.delete({ where: { endpoint: sub.endpoint } });
          }
          results.push({ success: false, habitId: habit.id, error: error.message });
        }
      }
    }

    return NextResponse.json({ 
      serverTime: `${currentHour}:${currentMinute}`,
      checkingTime: currentTime,
      processed: habitsToRemind.length, 
      results 
    });
  } catch (error) {
    console.error("Error sending notifications:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

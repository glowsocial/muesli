import { auth } from "@/auth";
import { google } from "googleapis";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const account = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: "google" }
    });

    if (!account?.access_token) {
      return NextResponse.json({ events: [] }); // User hasn't finished connecting Google
    }

    const authClient = new google.auth.OAuth2();
    authClient.setCredentials({ access_token: account.access_token });

    const calendar = google.calendar({ version: "v3", auth: authClient });

    // Get today's events from the start of the day to the end of the day
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      maxResults: 20,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items?.map(event => ({
      id: event.id,
      summary: event.summary,
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      htmlLink: event.htmlLink,
    })) || [];

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return NextResponse.json({ error: "Failed to fetch calendar events" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { eventId, notesText } = body;

    if (!eventId || !notesText) {
      return NextResponse.json({ error: "Missing eventId or notesText" }, { status: 400 });
    }

    const account = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: "google" }
    });

    if (!account?.access_token) {
      return NextResponse.json({ error: "No Google permission to edit calendar" }, { status: 403 });
    }

    const authClient = new google.auth.OAuth2();
    authClient.setCredentials({ access_token: account.access_token });

    const calendar = google.calendar({ version: "v3", auth: authClient });

    // Fetch existing event to append notes to description rather than overwriting
    const existingEvent = await calendar.events.get({
      calendarId: "primary",
      eventId: eventId
    });

    const newDescription = existingEvent.data.description
      ? existingEvent.data.description + `\n\n<h3>📝 Muesli AI Notes:</h3>\n<pre>${notesText}</pre>`
      : `<h3>📝 Muesli AI Notes:</h3>\n<pre>${notesText}</pre>`;

    // Update event description
    const response = await calendar.events.patch({
      calendarId: "primary",
      eventId: eventId,
      requestBody: {
        description: newDescription
      }
    });

    return NextResponse.json({ success: true, eventLink: response.data.htmlLink });
  } catch (error) {
    console.error("Error updating calendar event:", error);
    return NextResponse.json({ error: "Failed to update calendar event" }, { status: 500 });
  }
}

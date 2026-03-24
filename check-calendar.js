const { PrismaClient } = require('@prisma/client');
const { google } = require('googleapis');
const prisma = new PrismaClient();

async function check() {
  const account = await prisma.account.findFirst({
    where: { provider: "google" }
  });
  
  const authClient = new google.auth.OAuth2();
  authClient.setCredentials({ access_token: account.access_token });

  const calendar = google.calendar({ version: "v3", auth: authClient });

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  console.log("Fetching events from", startOfDay.toISOString(), "to", endOfDay.toISOString());

  const response = await calendar.events.list({
    calendarId: "primary",
    timeMin: startOfDay.toISOString(),
    timeMax: endOfDay.toISOString(),
    maxResults: 20,
    singleEvents: true,
    orderBy: "startTime",
  });

  console.log("Raw events length:", response.data.items?.length);
  if (response.data.items?.length > 0) {
    console.log("Events:", response.data.items.map(i => i.summary));
  }

  await prisma.$disconnect();
}

check().catch(console.error);

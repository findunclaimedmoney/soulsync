import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // ── Background scheduler — runs every hour ─────────────────────────────────
  // Sends 24h follow-up emails to free users who haven't upgraded yet.
  // Fires once immediately on startup (catches any missed window), then hourly.
  import("./lib/mailer").then(({ runFollowupScheduler }) => {
    runFollowupScheduler().catch(() => {});
    setInterval(() => runFollowupScheduler().catch(() => {}), 60 * 60 * 1000);
  }).catch(() => {});

  // ── Daily companion greetings — checks once per hour, fires at 8am UTC ────
  // On each hourly tick, checks if the current UTC hour is 8. If so, dispatches
  // morning greeting push notifications from each companion to opted-in users.
  import("./routes/mobile").then(({ runDailyGreetingsScheduler }) => {
    let lastGreetingDay = -1; // tracks the last calendar day we sent greetings

    const maybeRunGreetings = () => {
      const now = new Date();
      const utcHour = now.getUTCHours();
      const utcDay = now.getUTCDate();
      // Fire once per calendar day, at 8am UTC
      if (utcHour === 8 && utcDay !== lastGreetingDay) {
        lastGreetingDay = utcDay;
        runDailyGreetingsScheduler(logger).catch((err: unknown) => {
          logger.error({ err }, "Daily greetings scheduler error");
        });
      }
    };

    // Check immediately on startup (in case server restarted during the 8am window)
    maybeRunGreetings();
    setInterval(maybeRunGreetings, 60 * 60 * 1000);
  }).catch(() => {});
});

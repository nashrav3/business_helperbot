import fastify from "fastify";
import { webhookCallback } from "grammy";
import type { Bot } from "#root/bot/index.js";
import { logger } from "#root/logger.js";

export const createServer = async ({
  getBot,
}: {
  getBot: (token: string) => Promise<Bot>;
}) => {
  const server = fastify({
    logger,
  });

  server.setErrorHandler(async (error, request, response) => {
    logger.error(error);

    await response.status(500).send({ error: "Oops! Something went wrong." });
  });

  server.get("/", () => ({ status: true }));

  server.post("/:token([0-9]+:[a-zA-Z0-9_-]+)", async (request, response) => {
    const { token } = request.params as { token: string };

    return webhookCallback(await getBot(token), "fastify")(request, response);
  });

  return server;
};

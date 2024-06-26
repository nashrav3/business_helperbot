import { autoChatAction } from "@grammyjs/auto-chat-action";
import { hydrate } from "@grammyjs/hydrate";
import { hydrateReply } from "@grammyjs/parse-mode";
import { BotConfig, StorageAdapter, Bot as TelegramBot, session } from "grammy";
import {
  Context,
  SessionData,
  createContextConstructor,
} from "#root/bot/context.js";
import {
  adminFeature,
  forwardMessageFeature,
  groupMigrationFeature,
  languageFeature,
  setBusinessConnectionFeature,
  setGroupFeature,
  unhandledFeature,
  welcomeFeature,
} from "#root/bot/features/index.js";
import { errorHandler } from "#root/bot/handlers/index.js";
import { i18n, isMultipleLocales } from "#root/bot/i18n.js";
import { updateLogger } from "#root/bot/middlewares/index.js";
import { config } from "#root/config.js";
import { logger } from "#root/logger.js";
import type { PrismaClientX } from "#root/prisma/index.js";
import { detectChangeFeature } from "./features/detect-change.js";
import { newConversationReplyFeature } from "./features/new-conversation-reply.js";
import { setReplayFeature } from "./features/set-reply.js";

type Options = {
  prisma: PrismaClientX;
  sessionStorage?: StorageAdapter<SessionData>;
  config?: Omit<BotConfig<Context>, "ContextConstructor">;
};

export function createBot(token: string, options: Options) {
  const { sessionStorage, prisma } = options;
  const bot = new TelegramBot(token, {
    ...options.config,
    ContextConstructor: createContextConstructor({ logger, prisma }),
  });
  const protectedBot = bot.errorBoundary(errorHandler);

  // Middlewares
  // bot.api.config.use(parseMode("HTML"));

  if (config.isDev) {
    protectedBot.use(updateLogger());
  }

  protectedBot.use(autoChatAction(bot.api));
  protectedBot.use(hydrateReply);
  protectedBot.use(hydrate());
  protectedBot.use(
    session({
      initial: () => ({
        state: "idle",
        triggerText: "NULL",
        isWelcomeReply: false,
      }),
      storage: sessionStorage,
      getSessionKey: (ctx) => {
        const key = ctx.chat?.id;
        return String(key);
      },
    }),
  );
  protectedBot.use(i18n);

  // Handlers
  protectedBot.use(newConversationReplyFeature);
  protectedBot.use(welcomeFeature);
  protectedBot.use(adminFeature);
  protectedBot.use(setGroupFeature);
  protectedBot.use(groupMigrationFeature);
  protectedBot.use(forwardMessageFeature);
  protectedBot.use(setBusinessConnectionFeature);
  protectedBot.use(detectChangeFeature);
  protectedBot.use(setReplayFeature);
  if (isMultipleLocales) {
    protectedBot.use(languageFeature);
  }

  // must be the last handler
  protectedBot.use(unhandledFeature);

  return bot;
}

export type Bot = ReturnType<typeof createBot>;

import { Composer } from "grammy";
import type { Context } from "#root/bot/context.js";
import { logHandle } from "#root/bot/helpers/logging.js";

const composer = new Composer<Context>();

const feature = composer.chatType("private");

feature.command("start", logHandle("command-start"), async (ctx) => {
  await ctx.prisma.user.upsert({
    where: { telegramId: ctx.from.id },
    update: {},
    create: {
      telegramId: ctx.from.id,
    },
  });
  await ctx.reply(ctx.t("welcome", { botUsername: ctx.me.username }));
});

export { composer as welcomeFeature };

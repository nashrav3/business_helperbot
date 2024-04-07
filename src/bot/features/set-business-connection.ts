/* eslint-disable unicorn/no-null */
import { Composer } from "grammy";
import { type Context } from "#root/bot/context.js";
import { logHandle } from "#root/bot/helpers/logging.js";

const composer = new Composer<Context>();
const feature = composer;

feature.on(
  "business_connection",
  logHandle("set-business-connection-feature"),
  async (ctx) => {
    await ctx.prisma.user.upsert({
      where: { telegramId: ctx.businessConnection.user_chat_id },
      update: {
        businessConnectionId: ctx.businessConnection.id,
      },
      create: {
        businessConnectionId: ctx.businessConnection.id,
        telegramId: ctx.businessConnection.user_chat_id,
      },
    });
    await (ctx.businessConnection.is_enabled
      ? ctx.api.sendMessage(
          ctx.businessConnection.user_chat_id,
          ctx.t("set-connection.connection-is-set-plesae-set-group"),
        )
      : ctx.api.sendMessage(
          ctx.businessConnection.user_chat_id,
          ctx.t("set-connection.connection-is-disabled"),
        ));
  },
);

export { composer as setBusinessConnectionFeature };

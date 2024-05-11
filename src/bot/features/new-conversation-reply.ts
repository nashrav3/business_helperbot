import { Composer } from "grammy";
import type { Context } from "#root/bot/context.js";
import { logHandle } from "#root/bot/helpers/logging.js";

const composer = new Composer<Context>();

const feature = composer;

feature.on(
  "business_message",
  logHandle("business-message-newConversationReplyFeature"),
  async (ctx, next) => {
    const user = await ctx.prisma.user.findUnique({
      where: { businessConnectionId: ctx.businessConnectionId },
      include: {
        topics: {
          where: {
            customerId: ctx.chat.id,
          },
        },
      },
    });
    if (user?.topics.length === 0 && ctx.from.id !== Number(user.telegramId)) {
      await ctx.reply("test", {
        business_connection_id: ctx.businessConnectionId,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "test",
                callback_data: "test",
              },
            ],
            [
              {
                text: "test",
                url: "test.com",
              },
            ],
          ],
        },
      });
      next();
    } else {
      next();
    }
  },
);

export { composer as newConversationReplyFeature };

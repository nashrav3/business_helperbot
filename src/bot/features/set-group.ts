/* eslint-disable unicorn/no-null */
import { Composer, GrammyError } from "grammy";
import { type Context } from "#root/bot/context.js";
import { logHandle } from "#root/bot/helpers/logging.js";
import { logger } from "#root/logger.js";

const composer = new Composer<Context>();

const feature = composer.chatType(["supergroup", "group"]);

feature.on("my_chat_member", logHandle("set-group-feature"), async (ctx) => {
  await ctx.prisma.user.upsert({
    where: { telegramId: ctx.from.id },
    update: {},
    create: {
      telegramId: ctx.from.id,
    },
  });
  if (ctx.chat.type === "group") {
    await ctx.reply(
      ctx.t("group.group-should-be-upgraded-to-supergroup-with-topics"),
    );
    return;
  }
  if (ctx.myChatMember?.new_chat_member?.status === "member") {
    await ctx.reply(ctx.t("group.need-admin-rights"));
  }
  if (ctx.myChatMember?.new_chat_member?.status === "administrator") {
    const ownerId = await ctx.api
      .getChatAdministrators(ctx.chat.id)
      .then((admins) => {
        return admins.find((admin) => admin.status === "creator")?.user.id;
      })
      .catch((error) => {
        logger.error(error);
        return 0;
      });
    if (ctx.from?.id === ownerId) {
      await ctx.api
        .createForumTopic(ctx.chat.id, ctx.t("group.test-topic-title"))
        .then(async () => {
          await ctx.prisma.user.upsert({
            where: { telegramId: ownerId },
            update: {
              groupId: ctx.chat.id,
            },
            create: {
              groupId: ctx.chat.id,
              telegramId: ownerId,
            },
          });
        })
        .catch(async (error) => {
          if (
            error instanceof GrammyError &&
            error.message.includes("Bad Request: the chat is not a forum")
          ) {
            await ctx.reply(
              ctx.t("group.group-should-be-upgraded-to-supergroup-with-topics"),
            );
          } else {
            throw error;
          }
        });
    } else {
      await ctx.reply(ctx.t("group.bot-should-added-by-group-owner"));
      await ctx.leaveChat();
    }
  }
});

export { composer as setGroupFeature };

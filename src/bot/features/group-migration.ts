/* eslint-disable unicorn/no-null */
import { Composer } from "grammy";
import { type Context } from "#root/bot/context.js";
import { logHandle } from "#root/bot/helpers/logging.js";

const composer = new Composer<Context>();

const feature = composer.chatType(["group"]);

feature.on(
  [":migrate_to_chat_id"],
  logHandle("set-group-feature"),
  async (ctx) => {
    const newChatId = ctx.message.migrate_to_chat_id;
    const ownerId = await ctx.api
      .getChatAdministrators(newChatId)
      .then((admins) => {
        return admins.find((admin) => admin.status === "creator")?.user.id;
      })
      .catch(() => {
        ctx.api.sendMessage(newChatId, ctx.t("group.need-admin-rights"));
      });
    if (ctx.from?.id === ownerId) {
      await ctx.api
        .createForumTopic(newChatId, ctx.t("group.settings-topic-title"))
        .then(async () => {
          await ctx.prisma.user.upsert({
            where: { telegramId: ownerId },
            update: {
              groupId: newChatId,
            },
            create: {
              groupId: newChatId,
              telegramId: ownerId,
            },
          });
        });
    } else {
      await ctx.api.sendMessage(
        newChatId,
        ctx.t("group.bot-should-added-by-group-owner"),
      );
      await ctx.api.leaveChat(newChatId);
    }
  },
);

export { composer as groupMigrationFeature };

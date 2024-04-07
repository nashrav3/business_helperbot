import { Composer } from "grammy";
import type { Context } from "#root/bot/context.js";
import { logHandle } from "#root/bot/helpers/logging.js";
import { copyMessage } from "../helpers/copy-message.js";

const composer = new Composer<Context>();

const feature = composer.filter((ctx) => !!ctx.businessConnectionId);

feature.on(
  "edited_business_message",
  logHandle("edited-business-message"),
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
    if (!user) {
      return next();
    }
    const editedMessage = await ctx.prisma.businessMessage.findFirst({
      where: {
        messageId: ctx.editedBusinessMessage.message_id,
        groupId: Number(user.groupId),
        threadId: user.topics[0].threadId,
      },
    });
    const isFromBusinessOwner = ctx.from.id === Number(user.telegramId);
    if (user.groupId) {
      if (user.topics.length > 0 && editedMessage) {
        await ctx.api.sendMessage(
          Number(user.groupId),
          ctx.t("group.edited-message"),
          {
            message_thread_id: user.topics[0].threadId,
            reply_to_message_id: editedMessage.topicMessageId,
          },
        );
        await copyMessage({
          ctx,
          chatId: Number(user.groupId),
          messageThreadId: user.topics[0].threadId,
          replyToMessageId: editedMessage?.topicMessageId,
          isFromBusinessOwner,
        });
      }
    } else {
      await ctx.api.sendMessage(
        Number(user.telegramId),
        ctx.t("pv.group-not-set"),
      );
    }
  },
);

feature.on(
  "deleted_business_messages",
  logHandle("deleted-business-message"),
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
    if (!user) {
      return next();
    }
    const deletedMessages = await ctx.prisma.businessMessage.findMany({
      where: {
        messageId: {
          in: ctx.deletedBusinessMessages.message_ids,
        },
        groupId: Number(user.groupId),
        threadId: user.topics[0].threadId,
      },
    });
    if (user.groupId) {
      if (user.topics.length > 0 && deletedMessages) {
        for (const message of deletedMessages) {
          ctx.api.sendMessage(
            Number(user.groupId),
            ctx.t("group.deleted-message"),
            {
              message_thread_id: user.topics[0].threadId,
              reply_to_message_id: message.topicMessageId,
            },
          );
          // Wait for 0.5 seconds
          // eslint-disable-next-line no-await-in-loop, no-promise-executor-return
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    } else {
      await ctx.api.sendMessage(
        Number(user.telegramId),
        ctx.t("pv.group-not-set"),
      );
    }
  },
);
export { composer as detectChangeFeature };

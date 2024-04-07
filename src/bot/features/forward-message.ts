import { Composer } from "grammy";
import type { Context } from "#root/bot/context.js";
import { logHandle } from "#root/bot/helpers/logging.js";

interface CopyMessageParameters {
  ctx: Context;
  chatId: number | string;
  messageThreadId: number;
  replyToMessageId?: number;
}

const composer = new Composer<Context>();

const feature = composer;

async function copyMessage(parameters: CopyMessageParameters) {
  const { ctx, chatId, messageThreadId, replyToMessageId } = parameters;
  if (ctx.businessMessage?.text) {
    return ctx.api.sendMessage(chatId, ctx.businessMessage.text, {
      message_thread_id: messageThreadId,
      reply_to_message_id: replyToMessageId,
      entities: ctx.businessMessage.entities,
    });
  }
}

feature.on(
  "business_message",
  logHandle("business-message"),
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
    let copiedMessageId;
    let topicMessageThreadId;
    if (user.groupId) {
      if (user.topics.length > 0) {
        topicMessageThreadId = user.topics[0].threadId;
        copiedMessageId = await copyMessage({
          ctx,
          chatId: Number(user.groupId),
          messageThreadId: user.topics[0].threadId,
        });
      } else {
        const topic = await ctx.api.createForumTopic(
          Number(user.groupId),
          ctx.t(`${ctx.from.first_name} ${ctx.from.last_name}`),
        );
        topicMessageThreadId = topic.message_thread_id;
        await ctx.prisma.topic.create({
          data: {
            customerId: ctx.chat.id,
            groupId: Number(user.groupId),
            threadId: topic.message_thread_id,
            ownerId: Number(user.telegramId),
          },
        });
        await ctx.api.sendMessage(
          Number(user.groupId),
          `${ctx.from.first_name} ${ctx.from.last_name} ${ctx.from.username}`,
          {
            message_thread_id: topic.message_thread_id,
          },
        );
        copiedMessageId = await copyMessage({
          ctx,
          chatId: Number(user.groupId),
          messageThreadId: topic.message_thread_id,
        });
      }
    } else {
      await ctx.api.sendMessage(
        Number(user.telegramId),
        ctx.t("pv.group-not-set"),
      );
    }

    await (copiedMessageId && topicMessageThreadId
      ? ctx.prisma.businessMessage.create({
          data: {
            userId: Number(user.telegramId),
            costumerId: ctx.chat.id,
            groupId: Number(user.groupId),
            threadId: topicMessageThreadId,
            messageId: ctx.businessMessage.message_id,
            topicMessageId: copiedMessageId.message_id,
          },
        })
      : ctx.api.sendMessage(
          Number(user.telegramId),
          ctx.t("pv.group-something-went-wrong"),
        ));
  },
);

export { composer as forwardMessageFeature };

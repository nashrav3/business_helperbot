import { Composer } from "grammy";
import type { Context } from "#root/bot/context.js";
import { logHandle } from "#root/bot/helpers/logging.js";
import { copyMessage } from "../helpers/copy-message.js";

const composer = new Composer<Context>();

const feature = composer;

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
    const isReply = Boolean(ctx.businessMessage.reply_to_message);
    let copiedMessageId;
    let topicMessageThreadId;
    const isFromBusinessOwner = ctx.from.id === Number(user.telegramId);
    if (user.groupId) {
      if (user.topics.length > 0) {
        topicMessageThreadId = user.topics[0].threadId;
        if (isReply) {
          const replyToMessage = await ctx.prisma.businessMessage.findFirst({
            where: {
              messageId: ctx.businessMessage.reply_to_message?.message_id,
              groupId: Number(user.groupId),
              threadId: topicMessageThreadId,
            },
          });
          let isMessageCopied = false;

          try {
            copiedMessageId = await copyMessage({
              ctx,
              chatId: Number(user.groupId),
              messageThreadId: topicMessageThreadId,
              replyToMessageId: replyToMessage?.topicMessageId,
              isFromBusinessOwner,
            });
            isMessageCopied = true;
          } catch (error) {
            throw new Error(String(error));
          }

          if (!isMessageCopied) {
            copiedMessageId = await copyMessage({
              ctx,
              chatId: Number(user.groupId),
              messageThreadId: user.topics[0].threadId,
              isFromBusinessOwner,
            });
          }
        } else if (!isReply) {
          copiedMessageId = await copyMessage({
            ctx,
            chatId: Number(user.groupId),
            messageThreadId: user.topics[0].threadId,
            isFromBusinessOwner,
          });
        }
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
          isFromBusinessOwner,
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

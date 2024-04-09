/* eslint-disable unicorn/no-null */
import { ErrorHandler, GrammyError } from "grammy";
import type { Context } from "#root/bot/context.js";
import { getUpdateInfo } from "#root/bot/helpers/logging.js";
import { prisma } from "#root/prisma/index.js";

export const errorHandler: ErrorHandler<Context> = async (error) => {
  const { ctx } = error;
  if (
    error.error instanceof GrammyError &&
    error.message.includes("Bad Request: message thread not found")
  ) {
    await prisma.topic.delete({
      where: {
        groupId_threadId: {
          groupId: Number(error.error.payload.chat_id),
          threadId: Number(error.error.payload.message_thread_id),
        },
      },
    });
  }

  if (
    error.error instanceof GrammyError &&
    error.message.includes("not enough rights")
  ) {
    await prisma.user.update({
      where: {
        businessConnectionId: ctx.businessConnectionId,
      },
      data: {
        groupId: null,
      },
    });
    await ctx.api.leaveChat(Number(error.error.payload.chat_id));
  }

  if (
    error.error instanceof GrammyError &&
    error.message.includes("bot was kicked from the supergroup chat")
  ) {
    await prisma.user.update({
      where: {
        businessConnectionId: ctx.businessConnectionId,
      },
      data: {
        groupId: null,
      },
    });
  }

  ctx.logger.error({
    err: error.error,
    update: getUpdateInfo(ctx),
  });
};

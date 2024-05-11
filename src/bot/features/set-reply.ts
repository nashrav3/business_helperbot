/* eslint-disable unicorn/no-null */
import { Composer } from "grammy";
import type { Context } from "#root/bot/context.js";
import { logHandle } from "#root/bot/helpers/logging.js";

import { InlineKeyboardMarkup, MessageEntity } from "@grammyjs/types";
import { ReplyType, Prisma } from "@prisma/client";
import { arabicNumeralsToEnglish } from "../helpers/arabic-numbers-to-english.js";

const composer = new Composer<Context>();

const feature = composer.chatType("private");

interface ReplyOptions {
  reply_markup?: InlineKeyboardMarkup;
  caption?: string;
  caption_entities?: MessageEntity[];
  entities?: MessageEntity[];
  has_spoiler?: boolean;
}
type ReplyDataInput = Prisma.ReplyCreateInput;

feature
  .filter((ctx) => ctx.session.state === "awaiting_reply")
  .on("message", logHandle("createingReply"), async (ctx) => {
    const { msg } = ctx;
    if (msg.media_group_id)
      return ctx.reply(ctx.t(`create-Reply.media-group-not-supported`));

    let fileId: string | undefined;
    const replyType: ReplyType | undefined = [
      "animation",
      "audio",
      "document",
      "photo",
      "sticker",
      "video",
      "video_note",
      "voice",
      "text",
    ].find((type) => type in msg) as ReplyType | undefined;

    if (!replyType) return ctx.reply(ctx.t(`create-Reply.not-supported`));

    if (replyType === "photo") fileId = msg.photo?.[0].file_id;
    else if (replyType === "text") fileId = undefined;
    else fileId = msg[replyType]?.file_id;

    const replyOptions: ReplyOptions = {};
    if (msg.reply_markup) replyOptions.reply_markup = msg.reply_markup;
    if (msg.caption) replyOptions.caption = msg.caption;
    if (msg.caption_entities)
      replyOptions.caption_entities = msg.caption_entities;

    if (msg.entities) replyOptions.entities = msg.entities;
    if (msg.has_media_spoiler) replyOptions.has_spoiler = true;

    const replyData: ReplyDataInput = {
      owner: {
        connect: {
          telegramId: ctx.from.id,
        },
      },
      isWelcome: false,
      type: replyType,
      replyOptions: JSON.stringify(replyOptions),
    };
    if (msg.text) replyData.text = msg.text;
    if (fileId) replyData.fileId = fileId;

    const _reply = await ctx.prisma.reply.create({
      data: {
        ...replyData,
      },
    });
    await ctx.reply(ctx.t("set-reply.reply-saved"));
    ctx.session.state = "idle";
    ctx.session.triggerText = "NULL";
  });

feature.command(
  ["set_reply", "setreply", "set-reply", "sr"],
  logHandle("set-reply-command"),
  async (ctx, _next) => {
    ctx.session.state = "awaiting_trigger_text";
    ctx.session.triggerText = "NULL";
    await ctx.reply(ctx.t("set-reply.please-send-trigger-text"));
  },
);
feature
  .filter((ctx) => ctx.session.state === "awaiting_trigger_text")
  .on("message", async (ctx, _next) => {
    const messageText = ctx.message?.text?.toLowerCase();
    if (!messageText) {
      return ctx.reply(ctx.t("set-reply.trigger-should-be-text"));
    }
    const triggerText = arabicNumeralsToEnglish(messageText);

    await ctx.reply(ctx.t("set-reply.please-send-reply"));
    ctx.session.triggerText = triggerText;
    ctx.session.state = "awaiting_reply";
  });

export { composer as setReplayFeature };

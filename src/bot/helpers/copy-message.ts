import { Context } from "../context.js";

interface CopyMessageParameters {
  ctx: Context;
  chatId: number | string;
  messageThreadId: number;
  replyToMessageId?: number;
  isFromBusinessOwner: boolean;
}

export async function copyMessage(parameters: CopyMessageParameters) {
  const {
    ctx,
    chatId,
    messageThreadId,
    replyToMessageId,
    isFromBusinessOwner,
  } = parameters;

  let sentMessage;
  if (ctx.businessMessage?.text) {
    sentMessage = await ctx.api.sendMessage(chatId, ctx.businessMessage.text, {
      message_thread_id: messageThreadId,
      reply_to_message_id: replyToMessageId,
      entities: ctx.businessMessage.entities,
    });
  } else if (ctx.businessMessage?.photo) {
    sentMessage = await ctx.api.sendPhoto(
      chatId,
      ctx.businessMessage.photo[0].file_id,
      {
        message_thread_id: messageThreadId,
        reply_to_message_id: replyToMessageId,
        caption: ctx.businessMessage.caption,
      },
    );
  } else if (ctx.businessMessage?.video) {
    sentMessage = await ctx.api.sendVideo(
      chatId,
      ctx.businessMessage.video.file_id,
      {
        message_thread_id: messageThreadId,
        reply_to_message_id: replyToMessageId,
        caption: ctx.businessMessage.caption,
      },
    );
  } else if (ctx.businessMessage?.audio) {
    sentMessage = await ctx.api.sendAudio(
      chatId,
      ctx.businessMessage.audio.file_id,
      {
        message_thread_id: messageThreadId,
        reply_to_message_id: replyToMessageId,
        caption: ctx.businessMessage.caption,
      },
    );
  } else if (ctx.businessMessage?.voice) {
    sentMessage = await ctx.api.sendVoice(
      chatId,
      ctx.businessMessage.voice.file_id,
      {
        message_thread_id: messageThreadId,
        reply_to_message_id: replyToMessageId,
        caption: ctx.businessMessage.caption,
      },
    );
  } else if (ctx.businessMessage?.document) {
    sentMessage = await ctx.api.sendDocument(
      chatId,
      ctx.businessMessage.document.file_id,
      {
        message_thread_id: messageThreadId,
        reply_to_message_id: replyToMessageId,
        caption: ctx.businessMessage.caption,
      },
    );
  } else if (ctx.businessMessage?.animation) {
    sentMessage = await ctx.api.sendAnimation(
      chatId,
      ctx.businessMessage.animation.file_id,
      {
        message_thread_id: messageThreadId,
        reply_to_message_id: replyToMessageId,
        caption: ctx.businessMessage.caption,
      },
    );
  } else if (ctx.businessMessage?.sticker) {
    sentMessage = await ctx.api.sendSticker(
      chatId,
      ctx.businessMessage.sticker.file_id,
      {
        message_thread_id: messageThreadId,
        reply_to_message_id: replyToMessageId,
      },
    );
  } else if (ctx.businessMessage?.video_note) {
    sentMessage = await ctx.api.sendVideoNote(
      chatId,
      ctx.businessMessage.video_note.file_id,
      {
        message_thread_id: messageThreadId,
        reply_to_message_id: replyToMessageId,
      },
    );
  } else if (ctx.businessMessage?.contact) {
    sentMessage = await ctx.api.sendContact(
      chatId,
      ctx.businessMessage.contact.phone_number,
      ctx.businessMessage.contact.first_name,
      {
        message_thread_id: messageThreadId,
        reply_to_message_id: replyToMessageId,
      },
    );
  } else if (ctx.businessMessage?.location) {
    sentMessage = await ctx.api.sendLocation(
      chatId,
      ctx.businessMessage.location.latitude,
      ctx.businessMessage.location.longitude,
      {
        message_thread_id: messageThreadId,
        reply_to_message_id: replyToMessageId,
      },
    );
  } else if (ctx.businessMessage?.venue) {
    sentMessage = await ctx.api.sendVenue(
      chatId,
      ctx.businessMessage.venue.location.latitude,
      ctx.businessMessage.venue.location.longitude,
      ctx.businessMessage.venue.title,
      ctx.businessMessage.venue.address,
      {
        message_thread_id: messageThreadId,
        reply_to_message_id: replyToMessageId,
      },
    );
  } else if (ctx.businessMessage?.poll) {
    const options = ctx.businessMessage.poll.options.map(
      (option) => option.text,
    );
    sentMessage = await ctx.api.sendPoll(
      chatId,
      ctx.businessMessage.poll.question,
      options,
      {
        message_thread_id: messageThreadId,
        reply_to_message_id: replyToMessageId,
      },
    );
  }
  if (isFromBusinessOwner && sentMessage) {
    await ctx.api.setMessageReaction(
      chatId,
      sentMessage.message_id,
      [{ type: "emoji", emoji: "👨‍💻" }],
      { is_big: true },
    );
  }
  return sentMessage;
}

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

  const message = ctx.businessMessage || ctx.editedBusinessMessage;

  let sentMessage;
  if (message?.text) {
    sentMessage = await ctx.api.sendMessage(chatId, message.text, {
      message_thread_id: messageThreadId,
      reply_to_message_id: replyToMessageId,
      entities: message.entities,
    });
  } else if (message?.photo) {
    sentMessage = await ctx.api.sendPhoto(chatId, message.photo[0].file_id, {
      message_thread_id: messageThreadId,
      reply_to_message_id: replyToMessageId,
      caption: message.caption,
    });
  } else if (message?.video) {
    sentMessage = await ctx.api.sendVideo(chatId, message.video.file_id, {
      message_thread_id: messageThreadId,
      reply_to_message_id: replyToMessageId,
      caption: message.caption,
    });
  } else if (message?.audio) {
    sentMessage = await ctx.api.sendAudio(chatId, message.audio.file_id, {
      message_thread_id: messageThreadId,
      reply_to_message_id: replyToMessageId,
      caption: message.caption,
    });
  } else if (message?.voice) {
    sentMessage = await ctx.api.sendVoice(chatId, message.voice.file_id, {
      message_thread_id: messageThreadId,
      reply_to_message_id: replyToMessageId,
      caption: message.caption,
    });
  } else if (message?.document) {
    sentMessage = await ctx.api.sendDocument(chatId, message.document.file_id, {
      message_thread_id: messageThreadId,
      reply_to_message_id: replyToMessageId,
      caption: message.caption,
    });
  } else if (message?.animation) {
    sentMessage = await ctx.api.sendAnimation(
      chatId,
      message.animation.file_id,
      {
        message_thread_id: messageThreadId,
        reply_to_message_id: replyToMessageId,
        caption: message.caption,
      },
    );
  } else if (message?.sticker) {
    sentMessage = await ctx.api.sendSticker(chatId, message.sticker.file_id, {
      message_thread_id: messageThreadId,
      reply_to_message_id: replyToMessageId,
    });
  } else if (message?.video_note) {
    sentMessage = await ctx.api.sendVideoNote(
      chatId,
      message.video_note.file_id,
      {
        message_thread_id: messageThreadId,
        reply_to_message_id: replyToMessageId,
      },
    );
  } else if (message?.contact) {
    sentMessage = await ctx.api.sendContact(
      chatId,
      message.contact.phone_number,
      message.contact.first_name,
      {
        message_thread_id: messageThreadId,
        reply_to_message_id: replyToMessageId,
      },
    );
  } else if (message?.location) {
    sentMessage = await ctx.api.sendLocation(
      chatId,
      message.location.latitude,
      message.location.longitude,
      {
        message_thread_id: messageThreadId,
        reply_to_message_id: replyToMessageId,
      },
    );
  } else if (message?.venue) {
    sentMessage = await ctx.api.sendVenue(
      chatId,
      message.venue.location.latitude,
      message.venue.location.longitude,
      message.venue.title,
      message.venue.address,
      {
        message_thread_id: messageThreadId,
        reply_to_message_id: replyToMessageId,
      },
    );
  } else if (message?.poll) {
    const options = message.poll.options.map((option) => option.text);
    sentMessage = await ctx.api.sendPoll(
      chatId,
      message.poll.question,
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

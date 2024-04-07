import { Composer } from "grammy";
import type { Context } from "#root/bot/context.js";
import { logHandle } from "#root/bot/helpers/logging.js";

const composer = new Composer<Context>();

const feature = composer.filter((ctx) => !!ctx.businessConnectionId);

feature.on(
  "edited_business_message",
  logHandle("edited-business-message"),
  async (ctx) => {
    await ctx.reply("You edited a business message!");
  },
);

export { composer as welcomeFeature };

import { randomUUID } from "crypto";
import { NextFunction } from "grammy";

import { Context } from "@bot/types";
import { context } from "@bot/context";
import { rawLogger } from "@bot/logger";

export const middleware = () => (ctx: Context, next: NextFunction) => {
  context.getStore()?.set(
    "logger",
    rawLogger.child({
      requestId: randomUUID(),
    })
  );

  return next();
};

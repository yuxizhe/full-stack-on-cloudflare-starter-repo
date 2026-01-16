import { initDatabase } from "@repo/data-ops/database";

export async function createContext({
  req,
  env,
  workerCtx,
}: {
  req: Request;
  env: ServiceBindings;
  workerCtx: ExecutionContext;
}) {
  // Initialize database with D1 binding
  initDatabase(env.DB);

  return {
    req,
    env,
    workerCtx,
    userInfo: {
      userId: "1234567890",
    },
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

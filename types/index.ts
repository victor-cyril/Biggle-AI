import { auth } from "@/lib/auth";

export type TSession = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>;

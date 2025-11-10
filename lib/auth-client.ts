import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { auth } from "@/lib/auth";
import { polarClient } from "@polar-sh/better-auth";

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>(), polarClient()],
});

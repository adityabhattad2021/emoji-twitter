import type { User } from "@clerk/nextjs/dist/api";
import { clerkClient } from "@clerk/nextjs/dist/api";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const filterUserforClient = (user: User) => {
  return {
    id: user.id,
    firstname: user.firstName,
    lastname: user.lastName,
    profileImageUrl: user.profileImageUrl,
  };
};

export const profileRouter = createTRPCRouter({
  getUserById: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      4;
      const [user] = await clerkClient.users.getUserList({
        userId: [input.userId],
      });

      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User not found",
        });
      }

      return filterUserforClient(user);
    }),
});

import type { User } from "@clerk/nextjs/dist/api";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const filterUserforClient = (user: User) => {
  return {
    id: user.id,
    firstname: user.firstName,
    lastname:user.lastName,
    profileImageUrl: user.profileImageUrl,
  };
};

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
    });

    const users = (
      await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId),
        limit: 100,
      })
    ).map(filterUserforClient);
    

    return posts.map((post) => {
      const author = users.find((user) => user.id === post.authorId);

      if (!author || !author.firstname || !author.lastname) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Author for the post not found.",
        });
      }

      
      return {
        post,
        author:{
            ...author,
            firstname:author.firstname,
            lastname:author.lastname,
        },
      };
    });
  }),
});

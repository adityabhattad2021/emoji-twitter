import type { User } from "@clerk/nextjs/dist/api";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { Post } from "@prisma/client";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

const filterUserforClient = (user: User) => {
  return {
    id: user.id,
    firstname: user.firstName,
    lastname: user.lastName,
    profileImageUrl: user.profileImageUrl,
  };
};

const addUserDataToPosts = async (posts: Post[]) => {
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
      author: {
        ...author,
        firstname: author.firstname,
        lastname: author.lastname,
      },
    };
  });
};

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
});

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: [{ createdAt: "desc" }],
    });

    return addUserDataToPosts(posts);
  }),

  getById: publicProcedure
    .input(
      z.object({
        postId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: {
          id: input.postId,
        },
      });
      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }
      return (await addUserDataToPosts([post]))[0];
    }),

  getPostsByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const posts = await ctx.prisma.post.findMany({
        where: {
          authorId: input.userId,
        },
        take: 100,
        orderBy: [{ createdAt: "desc" }],
      });
      return addUserDataToPosts(posts);
    }),

  create: privateProcedure
    .input(
      z.object({
        content: z.string().emoji("Only emojis are allowed😎").min(1).max(280),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const { success } = await ratelimit.limit(authorId);
      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      const post = await ctx.prisma.post.create({
        data: {
          authorId,
          content: input.content,
        },
      });
      return post;
    }),
});

import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";
import { PageLayout } from "~/components/Layout";
import Image from "next/image";
import { Post } from "@prisma/client";
import PostView from "~/components/PostView";
import { LoadingSpinner } from "~/components/Loading";

const UserFeed = ({userId}:{userId:string}) => {
    const { data, isLoading } = api.posts.getPostsByUserId.useQuery({userId,});
    if (isLoading) return <div className="w-full h-full flex justify-center items-center"><LoadingSpinner size={80} /></div>;
    if (!data || data.length===0) return <div>No Post Found😒</div>
    return (
      <div className="flex flex-col">
        {data.map((postWithAuthor) => (
          <PostView {...postWithAuthor} key={postWithAuthor.post.id} />
        ))}
      </div>
    )
  }

const ProfilePage: NextPage<{ userId: string }> = ({ userId }) => {
    const { data } = api.profile.getUserById.useQuery({
        userId
    })

    const {data:posts,isLoading} = api.posts.getPostsByUserId.useQuery({
        userId
    })

    const safePosts = posts?.map((post)=>({post,author:{firstname:(data?.firstname|| ""),lastname:(data?.lastname || ""),id:(data?.id|| ""),profileImageUrl:(data?.profileImageUrl || "")}}))
    

    if (!data) {
        return (
            <div className="w-screen h-screen flex justify-center items-center">
                User Not Found
            </div>
        )
    }


    return (
        <>
            <Head>
                <title>{`${data.firstname || ""} ${data?.lastname || ""} | Emoji Twitter`}</title>
                <meta name="description" content="Profile Page of user @ Emoji Twitter" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <PageLayout>
                <div className="relative h-36 bg-slate-600 w-full">
                    <Image
                        src={data.profileImageUrl}
                        alt={`${data.firstname || ""}'s Profile Pic`}
                        width={128}
                        height={128}
                        className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-black"
                    />
                </div>
                <div className="h-[65px]" />
                <div className="p-4 pt-2 text-2xl font-bold">{`${data.firstname || ""} ${data.lastname || ""}`}</div>
                <div className="w-full border-b border-slate-400" />
                <UserFeed userId={data.id} />
            </PageLayout>
        </>
    )
}

export const getStaticProps: GetStaticProps = async (context) => {
    const ssg = createServerSideHelpers({
        router: appRouter,
        ctx: { prisma, userId: null },
        transformer: superjson
    });

    const slug = context.params?.slug;


    if (typeof slug !== "string") {
        throw new Error("No Slug Present");
    }

    await ssg.profile.getUserById.prefetch({ userId: slug })

    return {
        props: {
            trpcState: ssg.dehydrate(),
            userId: slug
        }
    }
}

export const getStaticPaths = () => {
    return { paths: [], fallback: "blocking" }
}

export default ProfilePage;
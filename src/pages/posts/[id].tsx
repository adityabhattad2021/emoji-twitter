import { createServerSideHelpers } from "@trpc/react-query/server";
import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";
import { api } from "~/utils/api";
import { PageLayout } from "~/components/Layout";
import PostView from "~/components/PostView";
import { LoadingSpinner } from "~/components/Loading";

const PostPage: NextPage<{postId:string}> = ({postId}) => {
    const {data,isLoading}=api.posts.getById.useQuery({postId});

    if(isLoading){
        return (
            <div className="w-screen h-screen flex justify-center items-center">
                <LoadingSpinner size={52} />
            </div>
        )
    }

    if(!data){
        return (
            <div className="w-screen h-screen flex justify-center items-center">
                <h1 className="font-bold text-xl">Post Not Found</h1>
            </div>
        )
    }

    return (
        <>
            <Head>
                <title>Post | Emoji Twitter</title>
                <meta name="description" content="Awesome Post @ Emoji Twitter" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <PageLayout>
                <PostView {...data} />
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

    const id = context.params?.id;


    if (typeof id !== "string") {
        throw new Error("No Slug Present");
    }

    await ssg.posts.getById.prefetch({ postId: id })

    return {
        props: {
            trpcState: ssg.dehydrate(),
            postId:id
        }
    }
}

export const getStaticPaths = () => {
    return { paths: [], fallback: "blocking" }
}


export default PostPage;
import { NextPage } from "next";
import Head from "next/head";

const PostPage: NextPage = () => {
    return (
        <>
            <Head>
                <title>Post | Emoji Twitter</title>
                <meta name="description" content="Awesome Post @ Emoji Twitter" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div>
                Post Page
            </div>
        </>
    )
}


export default PostPage;
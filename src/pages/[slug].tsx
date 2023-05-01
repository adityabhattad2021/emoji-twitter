import { type NextPage } from "next";
import Head from "next/head";

const ProfilePage:NextPage = () => {
    return (
        <>
            <Head>
                <title>User Name | Emoji Twitter</title>
                <meta name="description" content="Profile Page of user @ Emoji Twitter" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="flex h-screen justify-center">
                <div>Profile Page</div>
            </main>
        </>
    )
}

export default ProfilePage;
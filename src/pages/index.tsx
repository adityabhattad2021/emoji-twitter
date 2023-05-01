import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { toast } from "react-hot-toast"
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LoadingSpinner } from "~/components/Loading";
import { useState } from "react";
import Link from "next/link";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();
  const [input, setInput] = useState<string>("");
  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
      toast.success("Added new post🥳")
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0])
      } else {
        toast.error("Failed to add a post, Please try again later");
      }
    }
  });

  if (!user) {
    return null;
  }

  return (
    <div className="flex gap-3 w-full">
      <Image width={56} height={56} className="h-12 w-12 rounded-full" src={user.profileImageUrl} alt="User Profile Picture" />
      <input
        type="text"
        placeholder="Type some emojis"
        className="bg-transparent grow outline-none"
        value={input} onChange={(e) => setInput(e.target.value)}
        disabled={isPosting}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") {
              mutate({ content: input })
            }
          }
        }}
      />
      {(input !== "" && !isPosting) && (
        <button onClick={() => mutate({ content: input })} disabled={isPosting}>Post</button>
      )}
      {isPosting && <div className="mt-2 h-full flex justify-center"><LoadingSpinner size={20} /></div>}
    </div>
  )
}

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div key={post.id} className="flex p-4 border-b border-slate-400 gap-3">
      <Image width={56} height={56} src={author.profileImageUrl} alt="Author Profile Image" className="h-12 w-12 rounded-full" />
      <div className="flex flex-col text-slate-400">
        <div className="flex gap-2">
          <Link href={`/${author.firstname}${author.lastname}`}>
            <span className="font-bold">{`@${author.firstname} ${author.lastname}`}</span>
          </Link>
          <Link href={`/posts/${post.id}`}>
            <span>·</span><span className="font-thin">{`${dayjs(post.createdAt).fromNow()}`}</span>
          </Link>
        </div>
        <span>{post.content}</span>
      </div>
    </div>
  )
}

const Feed = () => {
  const { data, isLoading } = api.posts.getAll.useQuery();
  if (isLoading) return <div className="w-full h-full flex justify-center items-center"><LoadingSpinner size={80} /></div>;
  if (!data) return <div>Something went wrong...</div>
  return (
    <div className="flex flex-col">
      {data.map((postWithAuthor) => (
        <PostView {...postWithAuthor} key={postWithAuthor.post.id} />
      ))}
    </div>
  )
}

const Home: NextPage = () => {
  const { isSignedIn } = useUser();
  api.posts.getAll.useQuery();

  return (
    <>
      <Head>
        <title>Emoji Twitter</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
          <div className="flex border-b border-slate-400 p-4">
            {!isSignedIn && <div className="flex justify-center"><SignInButton /></div>}
            {!!isSignedIn && <CreatePostWizard />}
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
};

export default Home;

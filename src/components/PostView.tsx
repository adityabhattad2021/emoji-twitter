import type { RouterOutputs } from "~/utils/api";
import Link from "next/link";
import Image from "next/image";
import dayjs from "dayjs";

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div key={post.id} className="flex p-4 border-b border-slate-400 gap-3">
      <Image width={56} height={56} src={author.profileImageUrl} alt="Author Profile Image" className="h-12 w-12 rounded-full" />
      <div className="flex flex-col text-slate-400">
        <div className="flex gap-2">
          <Link href={`/${author.id}`}>
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

export default PostView;
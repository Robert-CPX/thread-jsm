import { fetchUserPosts } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import ThreadCard from "../cards/ThreadCard";

interface Props {
  currentUserId: string;
  accountId: string;
  accountType: string;
}

const ThreadsTab = async ({currentUserId, accountId, accountType}: Props) => {
  let result = await fetchUserPosts(currentUserId);
  if(!result) redirect('/');

  return (
    <section className="mt-9 flex-col gap-10">
      {result.threads.map((thread: any) => (
        <ThreadCard
          id={thread._id}
          currentUserId={currentUserId}
          parentId={thread.parentId}
          author={
            accountType === "User" ?
            {name: result.name, image: result.image, id: result.id} :
            {name: thread.author.name, image: thread.author.image, id: thread.author.id}
          } //don't understand this bit
          content={thread.text}
          community={thread.community}
          createdAt={thread.createdAt}
          comments={thread.children}
        />
      ))}
    </section>
  )
}

export default ThreadsTab;
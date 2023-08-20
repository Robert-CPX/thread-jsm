import ThreadCard from "@/components/cards/ThreadCard";
import { fetchThreads } from "@/lib/actions/thread.actions";
import { currentUser } from "@clerk/nextjs";

const Home = async () => {
  const result = await fetchThreads();
  const user = await currentUser();
  
  return (
    <>
      <h1 className="head-text text-left">Home</h1>
      <section className="mt-9 flex flex-col gap-10">
        {result.posts.length === 0 ? (
          <p className="no-result">No threads found</p>
        ) : (
          <>
          {result.posts.map((post) => (
            <ThreadCard
              key={post._id}
              id={post._id}
              currentUserId={user?.id || ""}
              parentId={post.parentId}
              author={post.author}
              content={post.text}
              community={post.community}
              createdAt={post.createdAt}
              comments={post.comments}
            />
            ))}
          </>
        )}
      </section>
    </>
  )
};

export default Home
'use server'

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import Community from "../models/community.model";
import { connectToDB } from "../mongoose"

interface ThreadType {
  text: string,
  author: string,
  communityId: string | null,
  path: string,
}

export const createThread = async ({text, author, communityId, path}: ThreadType) => {
  try {
    connectToDB();

    const communityIdObject = await Community.findOne(
      { id: communityId },
      { _id: 1 }
    );

    const createdThread = await Thread.create({
      text,
      author,
      community: communityIdObject
    });
    
    //update user model
    await User.findByIdAndUpdate(author, {
      $push: {threads: createdThread._id}
    })

    if(communityIdObject) {
      await Community.findByIdAndUpdate(communityIdObject, {
        $push: { threads: createdThread._id },
      });
    }
    
    revalidatePath(path)
  } catch (error: any) {
    console.error("Error while adding comment:", error);
    throw Error(`Failed to comment at thread: ${error.message}`);
  }
}

export const fetchThreads = async (pageNumber = 1, pageSize = 20) => {

  try {
    connectToDB();
    const skipAmount = (pageNumber - 1) * pageSize;
    const postQuery = Thread.find({ parentId: { $in: [null, undefined]}})
      .sort({createdAt: 'desc'})
      .skip(skipAmount)
      .limit(pageSize)
      .populate({
        path: 'author',
        model: User
      })
      .populate({
        path: 'community',
        model: Community,
      })
      .populate({
        path: 'children',
        populate: {
          path: 'author',
          model: User,
          select: '_id name parentId image'
        }
    })

    const totalPostsCount = await Thread.countDocuments({ 
      parentId: { $in: [null, undefined] },
    });

    const posts = await postQuery.exec();

    const isNext = totalPostsCount > posts.length + skipAmount;

    return {posts, isNext};

  } catch (error: any) {
    console.error("Error while adding comment:", error);
    throw Error(`Failed to comment at thread: ${error.message}`);
  }
}

const fetchAllChildThreads = async (threadId: string):Promise<any[]> => {
  const childThreads = await Thread.find({ parentId: threadId });
   const descendantThread = [];
   for (const childThread of childThreads) {
    const descendants = await fetchAllChildThreads(childThread._id);
    descendantThread.push(childThread, ...descendants);
   }
   return descendantThread;
}

export const deleteThread = async (id: string, path: string): Promise<void> => {
  try {
    connectToDB();
    const mainThread = await Thread.findById(id).populate("author community")

    if (!mainThread) {
      throw new Error("Thread not found");
    }

    const descendantThreads = await fetchAllChildThreads(id);

    const descendantThreadIds = [
      id,
      ...descendantThreads.map((thread) => thread._id),
    ];

    const uniqueAuthorIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.author?._id?.toString()),
        mainThread.author?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    const uniqueCommunityIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.community?._id?.toString()),
        mainThread.community?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    await Thread.deleteMany({ _id: { $in: descendantThreadIds }})

    await User.updateMany(
      { _id: { $in: Array.from(uniqueAuthorIds)}},
      { $pull: { threads: {$in: descendantThreadIds}}}
    );

    await Community.updateMany(
      { _id: { $in: Array.from(uniqueCommunityIds)}},
      { $pull: { threads: { $in: descendantThreadIds}}}
    );

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to delete thread: ${error.message}`);
  }
}

export const fetchThreadById = async (id: string) => {
  try {
    connectToDB();
    // TODO: populate the community
    const thread = await Thread.findById(id)
      .populate({
        path: 'author',
        model: User,
        select: '_id id name image'
      })
      .populate({
        path: 'community',
        model: Community,
        select: '_id id name image',
      })
      .populate({
        path: 'children',
        populate: [
          {
            path: 'author',
            model: User,
            select: '_id id name parentId image',
          },
          {
            path: 'children',
            model: Thread,
            populate: {
              path: 'author',
              model: User,
              select: '_id id name parentId image'
            }
          }
        ]
      })
      .exec();
      return thread;
  } catch (error: any) {
    throw Error(`Failed fetching thread: ${error.message}`);
  }
}

export const addCommentToThread = async (
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) => {
  try {
    connectToDB();
    // Find the origin thread by id
    const originalThread = await Thread.findById(threadId);
    if(!originalThread) {
      throw new Error("Thread not found")
    }

    //create a new thread comment
    const comment = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId
    })

    //save the new comment to db
    const savedComment = await comment.save();

    //update the original thread to include the new comment
    originalThread.children.push(savedComment._id);

    //save the original thread
    await originalThread.save();

    revalidatePath(path);

  } catch (error: any) {
    console.error("Error while adding comment:", error);
    throw Error(`Failed to comment at thread: ${error.message}`);
  }
}
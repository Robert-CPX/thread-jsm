'use server'

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"

interface ThreadType {
  text: string,
  author: string,
  communityId: string | null,
  path: string,
}

export const createThread = async ({text, author, communityId, path}: ThreadType) => {
  connectToDB();

  const createdThread = await Thread.create({
    text,
    author,
    community: null
  });
  
  //update user model
  await User.findByIdAndUpdate(author, {
    $push: {threads: createdThread._id}//TODO: understand the syntax
  })
  
  revalidatePath(path)

  //update community model
}
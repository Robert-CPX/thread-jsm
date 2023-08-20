'use server'

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose"

interface UserParams {
  userId: string,
  username: string,
  name: string,
  bio: string,
  image: string,
  path: string,
}

export const updateUser = async (user: UserParams): Promise<void> => {
  connectToDB();
  try {
    await User.findOneAndUpdate(
      {id: user.userId},
      {
        username: user.username.toLowerCase(),
        name: user.name,
        bio: user.bio,
        image: user.image,
        onboarded: true,
      },
      {upsert: true},
    );
    if(user.path === 'profile/edit') {
      revalidatePath(user.path);
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}
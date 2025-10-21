import axios from 'axios';
import { User } from '@/app/types';
import { getSession } from 'next-auth/react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const publicUsersUrl = `${BASE_URL}/api/public-users`;
const privateUsersUrl = `${BASE_URL}/api/users`; // Your private users API

const getPublicUsers = async (): Promise<User[]> => {
  try {
    const response = await axios.get(publicUsersUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching public users:', error);
    throw error;
  }
};

const getPrivateUsers = async (): Promise<User[]> => {
  const session = await getSession();
  const token = session?.accessToken; // depends on how your NextAuth is configured
  
  const response = await axios.get(privateUsersUrl, {
    headers: { 
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true, // only if cookies are also needed
  });
  return response.data;
};

const getOne = async (id: string, isPublic = false): Promise<{ user: User }> => {
  try {
    const url = isPublic ? `${publicUsersUrl}/${id}` : `${privateUsersUrl}/${id}`;
    const response = await axios.get(url, {
      withCredentials: !isPublic,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    throw error;
  }
};

const update = async (id: string, newData: Partial<User>): Promise<{ user: User }> => {
  try {
    console.log(newData)
    const response = await axios.put(`${privateUsersUrl}/${id}`, newData, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    throw error;
  }
};

const userService = {
  getPublicUsers,
  getPrivateUsers,
  getOne,
  update,
};

export default userService

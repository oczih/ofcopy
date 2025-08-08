import axios from 'axios';
import { User } from '@/app/types';

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
  try {
    const response = await axios.get(privateUsersUrl, {
      // Add auth if needed, e.g. headers or withCredentials
      // headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching private users:', error);
    throw error;
  }
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

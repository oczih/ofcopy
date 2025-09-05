import axios from 'axios';
import { Creator } from '@/app/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const PUBLIC_CREATORS_ENDPOINT = `${API_BASE}/api/my-creators`;

const get = async (): Promise<{ creators: Creator[] }> => {
  try {
    const response = await axios.get(PUBLIC_CREATORS_ENDPOINT);
    return response.data;
  } catch (error) {
    console.error("Error fetching creators:", error);
    throw new Error('Failed to fetch creators');
  }
};
const COMBINED_CREATORS_ENDPOINT = `${API_BASE}/api/creators/combined`;

const getCombined = async (): Promise<{ creators: Creator[] }> => {
  try {
    const response = await axios.get(COMBINED_CREATORS_ENDPOINT, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("Error fetching combined creators:", error);
    throw new Error('Failed to fetch combined creators');
  }
};

const getById = async (id: string): Promise<{ creator: Creator }> => {
  try {
    const response = await axios.get(`${PUBLIC_CREATORS_ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching creator:', error);
    throw new Error('Failed to fetch creator');
  }
};

const followCreator = async (creatorId: string, followerId: string): Promise<void> => {
  try {
    console.log(creatorId)
    console.log(followerId)
    await axios.post(
      `${API_BASE}/api/creators/${creatorId}/follow`,
      { followerId }, // body
      { withCredentials: true } // send cookies/session if needed
    );
  } catch (error) {
    console.error("Error following creator:", error);
    throw new Error("Failed to follow creator");
  }
};

const unfollowCreator = async (creatorId: string): Promise<void> => {
  try {
    await axios.delete(`/api/creators/${creatorId}/follow`);
  } catch (error) {
    console.error('Error unfollowing creator:', error);
    throw new Error('Failed to unfollow creator');
  }
};

const update = async (id: string, newData: Partial<Creator>): Promise<{ creator: Creator }> => {
  try {
    const response = await axios.put(`${PUBLIC_CREATORS_ENDPOINT}/${id}`, newData);
    return response.data;
  } catch (error) {
    console.error('Error updating creator:', error);
    throw new Error('Failed to update creator');
  }
};

const creatorservice = {
  get,
  getById,
  followCreator,
  unfollowCreator,
  update,
  getCombined
};

export default creatorservice
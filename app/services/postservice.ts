import axios from 'axios';
import { Post } from '@/app/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// Public posts API base
const PUBLIC_POSTS_URL = `${API_BASE}/api/public-posts`;

// Private posts API base (requires auth)
const PRIVATE_POSTS_URL = `${API_BASE}/api/my-posts`;

// --------- PUBLIC POSTS ----------

const getPublicPosts = async (): Promise<Post[]> => {
  try {
    const response = await axios.get(PUBLIC_POSTS_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching public posts:', error);
    throw error;
  }
};

const getPublicPostById = async (id: string): Promise<{ post: Post }> => {
  try {
    const response = await axios.get(`${PUBLIC_POSTS_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching public post:', error);
    throw error;
  }
};

// --------- PRIVATE POSTS (requires auth) ----------

// You can optionally add auth headers here or rely on cookies/session

const getPrivatePosts = async (): Promise<Post[]> => {
  try {
    const response = await axios.get(PRIVATE_POSTS_URL, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error fetching private posts:', error);
    throw error;
  }
};

const getPrivatePostById = async (id: string): Promise<{ post: Post }> => {
  try {
    const response = await axios.get(`${PRIVATE_POSTS_URL}/${id}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error fetching private post:', error);
    throw error;
  }
};

const updatePrivatePost = async (id: string, newData: Partial<Post>): Promise<{ post: Post }> => {
  try {
    const response = await axios.put(`${PRIVATE_POSTS_URL}/${id}`, newData, { withCredentials: true });
    return response.data.post;
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
};

const deletePrivatePost = async (id: string): Promise<{ post: Post }> => {
  try {
    const response = await axios.delete(`${PRIVATE_POSTS_URL}/${id}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

const postService = {
  // Public
  getPublicPosts,
  getPublicPostById,
  
  // Private
  getPrivatePosts,
  getPrivatePostById,
  updatePrivatePost,
  deletePrivatePost,
};

export default postService;

import axios from 'axios';
import { Post } from '@/app/types';
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/posts`;

const get = async (): Promise<Post[]> => {
    try {
        const reponse = await axios.get(API_URL)
        return reponse.data
    }catch(error){
        console.error('Error fetching users:', error)
        throw error
    }
}


const getOne = async (id: string): Promise<{ post: Post }> => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
}
const update = async (id: string, newData: Partial<Post>): Promise<{ creator: Post }> => {
    try {
        console.log('Updating post:', id, newData);
        const response = await axios.put(`${API_URL}/${id}`, newData);
        return response.data.post;

    }catch(error){
        console.error('Error updating post:', error);
        throw error;
    }
}

const deletePost = async (id:string): Promise<{post: Post}> => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`)
        return response.data
    }catch(error){
        console.error('Error deleting post:', error)
        throw error;
    }
}
export default {
    get, 
    getOne,
    deletePost,
    update
}
import axios from 'axios';
import { Creator } from '@/app/types';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/creators`;

const get = async () => {
    try {
        const response = await axios.get(API_URL);
        // Transform database data to match frontend Creator type
        console.log("response:", response)
        const creators = response.data
        return creators;
    } catch (error) {
        console.error('Error fetching creators:', error);
        throw error;
    }
}

const getById = async (id: string): Promise<{ creator: Creator }> => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching creator:', error);
        throw error;
    }
}

export async function followCreator(creatorId: string) {
    return axios.post(`${API_URL}/${creatorId}/follow`);
  }
  
  export async function unfollowCreator(creatorId: string) {
    return axios.delete(`${API_URL}/${creatorId}/follow`);
  }

const update = async (id: string, newData: Partial<Creator>): Promise<{ creator: Creator }> => {
    try {
        console.log('Updating creator:', id, newData);
        const response = await axios.put(`${API_URL}/${id}`, newData);
        return response.data;

    }catch(error){
        console.error('Error updating creator:', error);
        throw error;
    }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    update,
    get,
    getById,
    followCreator,
    unfollowCreator
}
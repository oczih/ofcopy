import axios from 'axios';
import { User } from '@/app/types';
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/users`;

const get = async (id: string): Promise<{ user: User }> => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
}
const update = async (id: string, newData: Partial<User>): Promise<{ user: User }> => {
    try {
        console.log('Updating user:', id, newData);
        const response = await axios.put(`${API_URL}/${id}`, newData);
        return response.data;

    }catch(error){
        console.error('Error updating user:', error);
        throw error;
    }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
    update,
    get,
}
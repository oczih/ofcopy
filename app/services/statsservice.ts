import axios from 'axios';

export interface Stats {
  totalCreators: number;
  activeCreators: number;
  premiumCreators: number;
  totalUsers: number;
  totalSubscriptions: number;
  totalRevenue: number;
  averageSubscribers: number;
  averagePrice: number;
}

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/stats`;

const get = async (): Promise<Stats> => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    // Return default stats if API fails
    return {
      totalCreators: 0,
      activeCreators: 0,
      premiumCreators: 0,
      totalUsers: 0,
      totalSubscriptions: 0,
      totalRevenue: 0,
      averageSubscribers: 0,
      averagePrice: 0
    };
  }
};

export default {
  get
}; 
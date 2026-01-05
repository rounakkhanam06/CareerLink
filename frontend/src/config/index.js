

import axios from 'axios';

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL; 

export const clientServer = axios.create({
    baseURL: BASE_URL,
});

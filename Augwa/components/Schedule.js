import axios from "axios";
import { API_BASEPATH_DEV,X_DOMAIN } from '@env';

const api = axios.create({
    baseURL: API_BASEPATH_DEV,
    headers: {
        'Content-Type': 'application/json',
        'X_domain': X_DOMAIN
    }
});

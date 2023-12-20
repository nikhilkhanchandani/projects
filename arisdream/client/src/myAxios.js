import axios from 'axios';

const myAxios = axios.create({
  withCredentials: true,
  baseURL: 'http://localhost:4000',
});

export default myAxios;

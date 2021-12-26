import Axios from 'axios';

const axios = Axios.create({
  baseURL: '/',
  timeout: 5000,
  headers: {
    'Authorization': 'Bearer ' + window.localStorage.getItem('jwt')
  }
});

export default axios;

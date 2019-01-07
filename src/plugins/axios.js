import axios from 'axios'


export default ({ Vue }) => {
  Vue.prototype.$axios = axios.create({
    baseURL: 'https://medani.000webhostapp.com/thor/api/',
    timeout: 1000,
    headers: {
      'Accept': "*/*" 
    }
  });
}

//https://medani.000webhostapp.com/thor/api
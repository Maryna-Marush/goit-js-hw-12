import axios from 'axios';

axios.defaults.baseURL = 'https://pixabay.com/api/';


export async function getImagesByQuery(query, page = 1) {
  const API_KEY = '56406455-6dc399abae623877bee600229'; 
  
  
  const searchParams = new URLSearchParams({
    key: API_KEY,
    q: query,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
    page: page,       
    per_page: 15,    
  });

  const response = await axios.get(`?${searchParams}`);
  
  return response.data;
}

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import { getImagesByQuery } from './js/pixabay-api.js';
import { 
  createGallery, 
  clearGallery, 
  showLoader, 
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton
} from './js/render-functions.js';

const searchForm = document.querySelector('.form');
const loadMoreBtn = document.querySelector('.load-more-btn');

let query = '';
let page = 1;
let totalHits = 0;
const perPage = 15; 

searchForm.addEventListener('submit', handleSearch);
if (loadMoreBtn) {
  loadMoreBtn.addEventListener('click', handleLoadMore);
}


async function handleSearch(event) {
  event.preventDefault();

  const form = event.currentTarget;
  query = form.elements['search-text'].value.trim();

  if (query === '') {
    iziToast.warning({
      title: 'Warning',
      message: 'Please enter a search term!',
      position: 'topRight',
    });
    return;
  }

  page = 1; 
  clearGallery();
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(query, page);
    totalHits = data.totalHits;

    if (data.hits.length === 0) {
      iziToast.error({
        title: 'Error',
        message: 'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });
      return;
    }

    createGallery(data.hits);

    
    if (totalHits > perPage) {
      showLoadMoreButton();
    } else {
      
      iziToast.info({
        title: 'Info',
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    }

  } catch (error) {
    console.error(error);
    iziToast.error({
      title: 'Error',
      message: 'Something went wrong. Please try again later.',
      position: 'topRight',
    });
  } finally {
    hideLoader();
    form.reset();
  }
}


async function handleLoadMore() {
  page += 1; 
  hideLoadMoreButton(); 
  showLoader(); 

  try {
    const data = await getImagesByQuery(query, page);
    createGallery(data.hits);


    const galleryItem = document.querySelector('.gallery-item');
    if (galleryItem) {
      const { height: cardHeight } = galleryItem.getBoundingClientRect();
      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });
    }

   
    const totalLoadedImages = page * perPage;

    
    if (totalLoadedImages >= totalHits) {
      hideLoadMoreButton(); 
      iziToast.info({
        title: 'Info',
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    } else {
      showLoadMoreButton();
    }

  } catch (error) {
    console.error(error);
    iziToast.error({
      title: 'Error',
      message: 'Failed to load more images!',
      position: 'topRight',
    });
  } finally {
    hideLoader();
  }
}

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
const perPage = 15; // Количество элементов на одну страницу

searchForm.addEventListener('submit', handleSearch);
if (loadMoreBtn) {
  loadMoreBtn.addEventListener('click', handleLoadMore);
}

/**
 * Первый поиск по сабмиту
 */
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

    // ПРОВЕРКА ДЛЯ 1-й СТРАНИЦЫ: 
    // Если общее количество на бекенде (totalHits) больше, чем мы загрузили за раз (15),
    // значит, есть что загружать дальше — показываем кнопку. Иначе — кнопка остается скрытой.
    if (totalHits > perPage) {
      showLoadMoreButton();
    } else {
      // Если это конец коллекции уже на первой странице, показываем уведомление
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

/**
 * Клик на кнопку "Load more"
 */
async function handleLoadMore() {
  page += 1; 
  hideLoadMoreButton(); // Прячем кнопку, пока идет загрузка
  showLoader(); 

  try {
    const data = await getImagesByQuery(query, page);
    createGallery(data.hits);

    // Плавный скролл
    const galleryItem = document.querySelector('.gallery-item');
    if (galleryItem) {
      const { height: cardHeight } = galleryItem.getBoundingClientRect();
      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });
    }

    // ПРОВЕРКА ДЛЯ ПОСЛЕДУЮЩИХ СТРАНИЦ:
    // Считаем, сколько картинок мы уже теоретически должны были загрузить
    const totalLoadedImages = page * perPage;

    // Если то, что мы загрузили, покрывает или превышает totalHits бекенда — коллекция закончилась
    if (totalLoadedImages >= totalHits) {
      hideLoadMoreButton(); // Убеждаемся, что кнопка скрыта
      iziToast.info({
        title: 'Info',
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    } else {
      showLoadMoreButton(); // Если картинки еще есть, возвращаем кнопку
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

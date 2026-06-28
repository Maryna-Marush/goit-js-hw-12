import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

// Импортируем функции из API модуля
import { getImagesByQuery } from './js/pixabay-api.js';

// Импортируем ВСЕ необходимые функции из модуля рендеринга
import { 
  createGallery, 
  clearGallery, 
  showLoader, 
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton
} from './js/render-functions.js';

// Находим элементы DOM
const searchForm = document.querySelector('.form');
const loadMoreBtn = document.querySelector('.load-more-btn');

// Глобальные переменные для контроля состояния пагинации
let query = '';
let page = 1;
let totalHits = 0;
const perPage = 15; // Количество элементов на страницу (как в pixabay-api.js)

// Слушатели событий
searchForm.addEventListener('submit', handleSearch);
if (loadMoreBtn) {
  loadMoreBtn.addEventListener('click', handleLoadMore);
}

/**
 * Обработчик сабмита формы (первичный поиск)
 */
async function handleSearch(event) {
  event.preventDefault();

  const form = event.currentTarget;
  query = form.elements['search-text'].value.trim();

  // Проверка на пустой ввод
  if (query === '') {
    iziToast.warning({
      title: 'Warning',
      message: 'Please enter a search term!',
      position: 'topRight',
    });
    return;
  }

  // Подготовка интерфейса к новому поиску
  page = 1; // Сбрасываем счетчик страниц на 1
  clearGallery();
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(query, page);
    totalHits = data.totalHits;

    // Если ничего не найдено
    if (data.hits.length === 0) {
      iziToast.error({
        title: 'Error',
        message: 'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });
      return;
    }

    // Рендерим карточки
    createGallery(data.hits);

    // Проверяем, нужно ли показывать кнопку "Load more"
    if (totalHits > perPage) {
      showLoadMoreButton();
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
 * Обработчик клика по кнопке "Load more" (дозагрузка страниц)
 */
async function handleLoadMore() {
  page += 1; // Переходим на следующую страницу
  hideLoadMoreButton(); // Скрываем кнопку на время новой загрузки
  showLoader(); // Показываем текстовый лоадер

  try {
    const data = await getImagesByQuery(query, page);
    
    // Добавляем новые картинки в галерею
    createGallery(data.hits);

    // Логика плавного скролла страницы (Требование ДЗ-12)
    const galleryItem = document.querySelector('.gallery-item');
    if (galleryItem) {
      const { height: cardHeight } = galleryItem.getBoundingClientRect();
      window.scrollBy({
        top: cardHeight * 2, // Прокручиваем на высоту двух карточек
        behavior: 'smooth',
      });
    }

    // Проверяем, не дошли ли мы до конца коллекции картинок Pixabay
    const totalPages = Math.ceil(totalHits / perPage);
    if (page >= totalPages) {
      iziToast.info({
        title: 'Info',
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    } else {
      showLoadMoreButton(); // Если картинки еще есть, возвращаем кнопку назад
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

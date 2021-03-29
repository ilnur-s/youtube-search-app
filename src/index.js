/* eslint-disable no-alert */
import './styles/reset.scss';
import './styles/style.scss';
import 'bootstrap';
import logo from './img/logo.png';

const form = document.querySelector('.search-form');
const accordionList = document.querySelector('.accordion');
const input = document.querySelector('.search-form__input');
const wrapper = document.querySelector('.form-wrapper');
const img = document.querySelector('.search-form__img');
const searchResultsText = document.createElement('div');
searchResultsText.classList.add('search-result-text');
img.src = logo;

const database = [];

const render = (state) => {
  while (accordionList.firstChild) {
    accordionList.removeChild(accordionList.firstChild);
  }
  wrapper.style.paddingTop = '3vh';
  searchResultsText.textContent = `Результат поиска по запросу: "${input.value}"`;
  accordionList.before(searchResultsText);
  state.forEach((item, index) => {
    accordionList.insertAdjacentHTML('beforeend', `<div class="accordion-item">
    <h2 class="accordion-header" id="heading-${index}">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${index}" aria-expanded="false" aria-controls="collapse-${index}">
        ${item.videoTitle}<br>Автор: ${item.author}<br>Просмотры: ${item.viewCount}
      </button>
    </h2>
    <div id="collapse-${index}" class="accordion-collapse collapse" aria-labelledby="heading-${index}" data-bs-parent="#accordionExample">
      <div class="accordion-body">
        <iframe width="100%" height="426" src="https://www.youtube.com/embed/${item.id}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
    </div>
  </div>`);
  });
};

const addVideos = async (searchValue) => {
  try {
    const endpointSearchList = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&order=date&q=${searchValue}&key=AIzaSyBe2JUi7Yg78CHwdC5uxr_QHcfOMfYzGlg&maxResults=10&type=video`;
    const rawSearchList = await fetch(endpointSearchList);
    let searchList;

    if (rawSearchList.ok) {
      searchList = await rawSearchList.json();
    } else {
      throw new Error('Ошибка получения данных, вероятнее всего, из-за большого количества запросов. Пожалуйста, попробуйте повторить запрос позже');
    }

    const videoIdList = searchList.items.map((item) => item.id.videoId).join();
    const endpointVideoList = `https://youtube.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIdList}&maxResults=10&key=AIzaSyBe2JUi7Yg78CHwdC5uxr_QHcfOMfYzGlg`;
    const rawVideoList = await fetch(endpointVideoList);
    let videoList;

    if (rawVideoList.ok) {
      videoList = await rawVideoList.json();
    } else {
      throw new Error('Ошибка получения данных, вероятнее всего, из-за большого количества запросов. Пожалуйста, попробуйте повторить запрос позже');
    }

    const sortByViewCount = (array) => array.sort((a, b) => (a.viewCount < b.viewCount ? 1 : -1));

    const finalList = sortByViewCount(searchList.items.map((item, index) => ({
      id: item.id.videoId,
      videoTitle: item.snippet.title,
      author: item.snippet.channelTitle,
      viewCount: Number(videoList.items[index].statistics.viewCount),
    })));

    if (database) {
      database.splice(0, database.length);
    }
    database.push(...finalList);
    render(database);
  } catch (error) {
    alert(error.message);
  }
};

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const value = formData.get('search-input').trim();
  addVideos(value);
});

const $ = document.querySelector.bind(document);

const form = $('#form');
const searchInput = $('#search')
const songsContainer = $('#songs-container')
const prevAndNextContainer = $('#prev-and-next-container')

const apiURL = `https://api.lyrics.ovh`

const fetchData = async url => {
   try {
      const res = await axios.get(url);
      return res.data;
   } catch (err) {
      insertErrorMessage('Erro: Não foi possível obter o resultado da letra para esse título.');
   }
}

const insertErrorMessage = (msg) => {
   $('.popup-error').classList.add('popup-error--ativo');
   $('.error-msg').textContent = msg;
   setTimeout(() => {
      $('.popup-error')
         .classList.remove('popup-error--ativo');
   }, 2000);
}

const getMoreSongs = async url =>
   insertSongsIntoPage(await fetchData(`https://cors-anywhere.herokuapp.com/${url}`));

const insertLyricsIntoPage = ({ lyrics, artist, songTitle }) => {
   songsContainer.innerHTML = `
      <li class="lyrics-container">
         <h2><strong>${songTitle}</strong> - ${artist}</h2>
         <p class="lyrics">${lyrics}</p>
      </li>
   `
}

const fetchLyrics = async (artist, songTitle) => {
   const data = await fetchData(`${apiURL}/v1/${artist}/${songTitle}`);
   if (data === undefined) return;
   const lyrics = data.lyrics.replace(/(\r\n|\r|\n)/g, '<br>');
   insertLyricsIntoPage({ lyrics, artist, songTitle })
}

const insertNextAndPrevButtons = ({ prev, next }) => {
   prevAndNextContainer.innerHTML = `
   ${prev ? `<button class="btn hvr-sweep-to-right" onClick="getMoreSongs('${prev}')">Anteriores</button>` : ''}
   ${next ? `<button class="btn hvr-sweep-to-right" onClick="getMoreSongs('${next}')">Próximas</button>` : ''}
`
}

const insertSongsIntoPage = ({ data, prev, next }) => {
   songsContainer.innerHTML = data.map(({ artist: { name }, title, album }) => `
      <li class="song">
         <img src="${album.cover_medium}">
         <span class="song-artist"><strong>${name}</strong> - ${title}</span>
         <button class="btn hvr-sweep-to-right" data-artist="${name}" data-song-title="${title}">Ver letra</button>
      </li>
      `).join('');

   prev || next
      ? insertNextAndPrevButtons({ prev, next })
      : prevAndNextContainer.innerHTML = '';
}

const fetchSongs = async term =>
   insertSongsIntoPage(await fetchData(`${apiURL}/suggest/${term}`));

const validateTerm = term => {
   term
      ? fetchSongs(term)
      : insertErrorMessage('Erro: Insira um termo válido.');
}

const formatInput = input => input.normalize("NFD")
   .replace(/[\u0300-\u036f]/g, "");

const handleFormSubmit = event => {
   event.preventDefault();
   const inputValue = searchInput.value.trim();
   const searchTerm = formatInput(inputValue);
   searchInput.focus();
   validateTerm(searchTerm)
}

const handleSongsContainerClick = event => {
   const clickedElement = event.target;

   if (clickedElement.tagName === 'BUTTON') {
      const artist = clickedElement.getAttribute('data-artist');
      const songTitle = clickedElement.getAttribute('data-song-title');

      prevAndNextContainer.innerHTML = '';
      fetchLyrics(artist, songTitle)
   }
}

form.addEventListener('submit', handleFormSubmit);
songsContainer.addEventListener('click', handleSongsContainerClick);

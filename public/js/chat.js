const socket = io();

// Elements
const messageForm = document.querySelector('form');
const message = document.querySelector('input');
const messageButton = document.querySelector('#submit-message');
const messageOne = document.getElementById('message-1');
const sendLocationButton = document.querySelector('#send-location');
const messages = document.querySelector('#messages');
const sidebar = document.querySelector('#sidebar');

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () => {
  const newMessage = messages.lastElementChild;

  const newMessageStyles = getComputedStyle(newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

  const visibleHeight = messages.offsetHeight;

  const containerHeight = messages.scrollHeight;

  const scrollOffSet = messages.scrollTop + visibleHeight;

  if(containerHeight - newMessageHeight <= scrollOffSet) {
    messages.scrollTop = messages.scrollHeight;
  }
};

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  messageButton.setAttribute('disabled', 'disabled');

  const messageText = e.target.elements.message.value;

  if(!messageText) {
    messageButton.removeAttribute('disabled');
    return messageOne.textContent = 'Message cannot be empty!';
  }
  
  socket.emit("sendMessage", messageText, (error) => {
    messageButton.removeAttribute('disabled');
    messageOne.textContent = '';
    message.value = '';
  });
});

socket.on('message', ({ username, text, createdAt }) => {
  const html = Mustache.render(messageTemplate, {
    username,
    message: text,
    createdAt: moment(createdAt).format('h:m a')
  });
  messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

socket.on('locationMessage', ({ username, url, createdAt }) => {
  const html = Mustache.render(locationTemplate, {
    username,
    url,
    createdAt: moment(createdAt).format('h:m a')
  });
  messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

socket.on('roomData', ({room, users}) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  });
  sidebar.innerHTML = html;
});

sendLocationButton.addEventListener('click', () => {
  if(!navigator.geolocation) return alert("Geolocation is not supported by your browser version!");

  sendLocationButton.setAttribute('disabled', 'disabled');

  navigator.geolocation.getCurrentPosition(({ coords: { latitude, longitude } }) => {
    socket.emit("sendLocation", { latitude, longitude }, () => {
      sendLocationButton.removeAttribute('disabled');
    });
  });
});

socket.emit('join', { username, room }, (error) => {
  if(error) {
    alert(error);
    location.href = '/';
  }
});

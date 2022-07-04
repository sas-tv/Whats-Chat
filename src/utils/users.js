const users = [];

const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if(!username || !room) return {
    error: "Username and room are required!"
  };

  const existingUser = users.find((user) => room === user.room && username === user.username);

  if(existingUser) return {
    error: "Username is in use!"
  };

  users.push({ id, username, room });
  return { user: { id, username, room } };
};

const removeUser = (userId) => {
  const index = users.findIndex(({ id }) => id === userId);

  if(index !== -1) return users.splice(index, 1);
};

const getUser = (userId) => {
  return users.find(({ id }) => id === userId);
};

const getUsersInRoom = (userRoom) => {
  userRoom = userRoom.trim().toLowerCase()
  return users.filter(({ room }) => room === userRoom);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
};

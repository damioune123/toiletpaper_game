const rooms = {};

const addRoom = (roomId, room) =>{
  rooms[roomId] = room
};
const getRooms = ()=>{
    return rooms;
};
const getRoom = (roomId)=>{
    return rooms[roomId];
};
const isRoomNameTaken = (roomName)=>{
    const roomsPerRoomName = Object.keys(rooms).reduce((dic, key)=>{
        dic[rooms[key].roomName] = rooms[key];
        return dic;
    },{});
    return roomName in roomsPerRoomName;
};
module.exports = {
    addRoom,
    getRoom,
    getRooms,
    isRoomNameTaken,
};
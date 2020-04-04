const rooms = {};

const addRoom = (roomId, room) =>{
  rooms[roomId] = room
};
const getRooms = ()=>{
    return rooms;
};
const getRoomWithId = (roomId)=>{
    return rooms[roomId];
};
const getRoomWithName = (roomName)=>{
    return Object.keys(rooms).map((key)=>rooms[key]).find((room)=> room.roomName === roomName);
};
const getPlayerInRoomWithHisName = (room, userName)=>{
    return Object.keys(room.roomState.players).map((key)=>room.roomState.players[key]).find((player)=> player.userName=== userName);
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
    getRoomWithId,
    getPlayerInRoomWithHisName,
    getRoomWithName,
    getRooms,
    isRoomNameTaken,
};
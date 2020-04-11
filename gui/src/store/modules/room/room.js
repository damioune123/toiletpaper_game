const APP_NAME = "Room module";
const defaultState = () => {
  return {
    room: null,
    language: "en"
  };
};
const mutations = {
  setRoom(state, room) {
    state.dictionary = room;
  },
  setLanguage(state, room) {
    state.language = room;
  }
};

const actions = {
  setRoom: async (context, room) => {
    console.log(`${APP_NAME} - Setting room`);
    context.commit("setRoom", room);
  },
  setLanguage: async (context, language = "en") => {
    console.log(`${APP_NAME} - Setting room language to ${language}`);
    context.commit("setLanguage", language);
  }
};

const getters = {
  room: state => state.room,
  language: state => state.language
};
const state = defaultState();
export default {
  state,
  getters,
  actions,
  mutations
};

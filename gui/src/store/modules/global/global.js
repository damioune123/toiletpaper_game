import router from "@/router";
const defaultState = () => {
  return {};
};
const mutations = {};

const actions = {
  resetAppState: function({ dispatch }, redirectToHomePage = true) {
    dispatch("resetGameServerAppState");
    dispatch("resetClientUserAppState");
    dispatch("resetDictionaryState");
    dispatch("resetRoomState");
    if (redirectToHomePage) {
      router.push({ name: "Home" });
    }
  }
};

const getters = {};
const state = defaultState();
export default {
  state,
  getters,
  actions,
  mutations
};

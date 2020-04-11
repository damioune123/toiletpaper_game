import Vue from "vue";
import Vuex from "vuex";
import clientUserApp from "./modules/client-user-app/client-user-app";
import gameServerApp from "./modules/game-server-app/game-server-app";
import dictionary from "./modules/dictionary/dictionary";
import room from "./modules/room/room";

Vue.use(Vuex);

const modules = {
  clientUserApp,
  gameServerApp,
  dictionary,
  room
};

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules
});

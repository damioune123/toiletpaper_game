import Vue from "vue";
import Vuex from "vuex";
import clientUserApp from "./modules/client-user-app/client-user-app";
import gameServerApp from "./modules/game-server-app/game-server-app";
import dictionary from "./modules/dictionary/dictionary";
import room from "./modules/room/room";
import global from "./modules/global/global";

const modules = {
  clientUserApp,
  gameServerApp,
  dictionary,
  room,
  global
};

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  actions: {},
  modules,
});

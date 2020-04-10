import Vue from "vue";
import Vuex from "vuex";
import clientUserApp from "./modules/client-user-app/client-user-app";
import gameServerApp from "./modules/game-server-app/game-server-app";
import mainApp from "./modules/main-app/main-app";

Vue.use(Vuex);

const modules = {
  clientUserApp,
  gameServerApp,
  mainApp
};

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules
});

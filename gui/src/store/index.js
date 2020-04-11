import Vue from "vue";
import Vuex from "vuex";
import clientUserApp from "./modules/client-user-app/client-user-app";
import gameServerApp from "./modules/game-server-app/game-server-app";

Vue.use(Vuex);

const modules = {
  clientUserApp,
  gameServerApp
};

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules
});

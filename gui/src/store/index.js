import Vue from "vue";
import Vuex from "vuex";
import clientUserApp from "./modules/client-user-app/client-user-app";
import gameServerApp from "./modules/game-server-app/game-server-app";
import commonApp from "./modules/common-app/common-app";

Vue.use(Vuex);

const modules = {
  clientUserApp,
  gameServerApp,
  commonApp,
};

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules
});

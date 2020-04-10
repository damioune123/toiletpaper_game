import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import VueSocketIO from "vue-socket.io";
import { SOCKET_ACTION_PREFIX } from "./enums/global";
import $socket from './socket/socket-instance';

Vue.use(
  new VueSocketIO({
    debug: true,
    connection: $socket,
    vuex: {
      store,
      actionPrefix: SOCKET_ACTION_PREFIX
    }
  })
);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");

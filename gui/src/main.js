import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";
import VueSocketIO from "vue-socket.io";
import io from "socket.io-client";
import { SOCKET_ACTION_PREFIX } from "./enums/global";

const clientUserAppSocket = io(process.env.VUE_APP_SOCKET_URL);

Vue.use(
  new VueSocketIO({
    debug: true,
    connection: clientUserAppSocket,
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

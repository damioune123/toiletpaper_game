import Vue from "vue";
import App from "@/App.vue";
import router from "@/router";
import Requests from "@/api/requests";
import store from "@/store";

Vue.use(Requests);
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");

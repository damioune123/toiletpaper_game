import axios from "axios";
import Vuex from "vuex";

class AqAjaxRequests {
  //--------------------------------------------------------------------
  //  -- INIT ----------------------------------------------------------
  //--------------------------------------------------------------------
  init = function() {
    this.axiosRequest = axios.create({
      baseURL: process.env.VUE_APP_API_URL
    });
    this.setAxiosHeaders({
      "Content-Type": "application/json"
    });
    this.axiosRequest.interceptors.response.use(
      response => response,
      error => this.handleError(error)
    );
  };
  setAxiosHeaders = function(headers) {
    const headerKeys = Object.keys(headers);
    headerKeys.forEach(
      function(value) {
        this.axiosRequest.defaults.headers.common[value] = headers[value];
      }.bind(this)
    );
  };
  handleError = error => {
    console.log("Raw API error  - ", error);
    let formattedError = "";
    if (
      error.response &&
      error.response.data &&
      error.response.data.details &&
      error.response.data.details[0] &&
      error.response.data.details[0].message
    ) {
      formattedError = error.response.data.details[0].message;
    } else {
      formattedError = JSON.stringify(
        error.response ? error.response.data : error
      );
    }
    console.log("Formatted API error - ", formattedError);
    console.log("Request status : ", error.status);
    alert(formattedError);
  };
  //--------------------------------------------------------------------
  //  -- API REQUESTS ----------------------------------------------------------
  //--------------------------------------------------------------------
  //ROOM
  createRoom = roomData => {
    return this.axiosRequest.post(`/rooms`, roomData);
  };
  //Dictionary
  getDictionary = (language = "en") => {
    return this.axiosRequest.get(`/dictionaries`, { params: { language } });
  };
}
export default {
  install(Vue) {
    const rqObj = new AqAjaxRequests();
    rqObj.init();
    // Set app headers
    Vue.prototype.$rq = rqObj;
    // Make requests accessible from store
    Vuex.Store.prototype.$rq = rqObj;
  }
};

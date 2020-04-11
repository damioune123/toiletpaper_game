const MODULE_NAME = "Dictionary module";
const defaultState = () => {
  return {
    dictionary: null
  };
};
const mutations = {
  setDictionary(state, dictionary) {
    state.dictionary = dictionary;
  }
};

const actions = {
  fetchDictionary: async context => {
    console.log(`${MODULE_NAME} - Fetching room dictionary`);
    const { data } = await this.$rq.getDictionary(context.getters.room || "en");
    context.commit("setDictionary", data);
  }
};

const getters = {
  dictionary: state => state.dictionary
};
const state = defaultState();
export default {
  state,
  getters,
  actions,
  mutations
};

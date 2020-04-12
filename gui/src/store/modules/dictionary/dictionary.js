const MODULE_NAME = "Dictionary module";
const defaultState = () => {
  return {
    dictionary: null
  };
};
const mutations = {
  setDictionary(state, dictionary) {
    state.dictionary = dictionary;
  },
  resetDictionaryState(state) {
    Object.assign(state, defaultState());
  }
};

const actions = {
  fetchDictionary: async function(context) {
    console.log(`${MODULE_NAME} - Fetching room dictionary`);
    const { data } = await this.$rq.getDictionary(
      context.getters.language || "en"
    );
    if (data) {
      context.commit("setDictionary", data);
    }
  },
  resetDictionaryState: context => {
    context.commit("resetDictionaryState");
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

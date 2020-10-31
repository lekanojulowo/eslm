const store = new Vuex.Store({
  state: {
    setup: {},
    applicants: [],
    admins: [],
    curUser: {},
    loading: false,
    login: false,
    brandName: 'MEDA',
    brandDescription: 'Microfinance and Enterprise Development Agency',
  },
  mutations: {
    // synchronous
    setup: (state, payload) => (state.setup = {...payload }),
    applicants: (state, payload) => (state.applicants = [...payload]),
    admins: (state, payload) => (state.admins = [...payload]),
    curUser: (state, payload) => (state.curUser = {...payload }),
    loading: (state, payload) => (state.loading = payload),
    login: (state, payload) => (state.login = payload),
  },
  actions: {
    // asynchronous
    setLoading: ({ commit }, payload) => commit('loading', payload),
    setLogin: ({ commit }, payload) => commit('login', payload),
    setCurUser: ({ commit }, payload) => commit('curUser', payload),
    setSetup: ({ commit }, payload) => commit('setup', payload),
    setApplicants: ({ commit }, payload) => commit('applicants', payload),
    setAdmins: ({ commit }, payload) => commit('admins', payload),
  },
  getters: {
    getState: state => field => state[field],
    userId: state => state.curUser.id || '',
    fullName: state => {
      let fname = '';
      if (state.curUser.loan_type) {
        let loanType = state.curUser.loan_type;
        fname = state.curUser[loanType].name;
      } else {
        fname = state.curUser.name || '';
      }
      return fname;
    },
    isAdmin: state => (state.curUser.username ? state.curUser.username.toLowerCase().startsWith('admin') : false),
  },
});
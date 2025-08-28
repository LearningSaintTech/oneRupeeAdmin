export const selectGlobalData = (state) => state.global.data;
export const selectGlobalLoading = (state) => state.global.loading;
export const selectGlobalError = (state) => state.global.error;
export const selectDataByKey = (key) => (state) => state.global.data[key];
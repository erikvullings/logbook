/** During development, use this URL to access the server. */
// const apiService = `http://localhost:3030/api`;
const apiService = process.env.SERVER || window.location.origin;

/** Application state */
export const AppState = {
  isSearching: false,
  searchQuery: '',
  apiService,
};

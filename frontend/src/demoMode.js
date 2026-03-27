/** When true, the app does not call the API; use demo accounts from `src/data/users.js`. */
export const isDemoMode =
  import.meta.env.VITE_DEMO_MODE === 'true' ||
  import.meta.env.VITE_DEMO_MODE === '1'

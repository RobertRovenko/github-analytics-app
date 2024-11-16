export const autoRefreshDashboard = (callback: Function) => {
    setInterval(callback, 15 * 60 * 1000); 
  };
  
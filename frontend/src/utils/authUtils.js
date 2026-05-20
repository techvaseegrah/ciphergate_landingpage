export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const getStoredSubdomain = () => {
  const s = localStorage.getItem('tasktracker-subdomain');
  return (s && s !== 'undefined' && s !== 'null') ? s : 'main';
};

export const setStoredSubdomain = (subdomain) => {
  if (subdomain && subdomain !== 'main' && subdomain !== 'undefined' && subdomain !== 'null') {
    localStorage.setItem('tasktracker-subdomain', subdomain);
  } else {
    localStorage.removeItem('tasktracker-subdomain');
  }
};
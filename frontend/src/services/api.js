let token = localStorage.getItem('token') || null;

export const setToken = (newToken) => {
  token = newToken;
  if (newToken) {
    localStorage.setItem('token', newToken);
  } else {
    localStorage.removeItem('token');
  }
};

let onAuthError = null;
export const setOnAuthError = (callback) => {
  onAuthError = callback;
};

export const fetchWithAuth = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401) {
    if (onAuthError) {
      onAuthError();
    }
    throw new Error('Session expired. Please log in again.');
  }
  
  return response;
};

export const getToken = () => token;

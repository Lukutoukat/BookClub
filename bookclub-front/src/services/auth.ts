export const getToken = () => {
<<<<<<< HEAD
  return localStorage.getItem("loggedBookappUser");
};

export const setToken = (newToken: string) => {
  localStorage.setItem("loggedBookappUser", newToken);
};
=======
  const raw = localStorage.getItem('loggedBookappToken')
  return raw
}

export const setToken = (newToken: string) => {
  localStorage.setItem('loggedBookappToken', newToken)

}
>>>>>>> main

export const getAuthConfig = () => {
  // return getuserstoken()
  const token = getToken();

  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : null,
    },
  };
};

export const clearToken = () => {
  localStorage.removeItem("loggedBookappUser");
};

export const isLoggedIn = () => {
  return Boolean(localStorage.getItem("loggedBookappUser"));
};

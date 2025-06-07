const STORAGE = {
  set: (key, value) => {
    const data = typeof value === "string" ? value : JSON.stringify(value);
    localStorage.setItem(key, data);
  },

  get: (key) => {
    const value = localStorage.getItem(key);
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  },

  remove: (key) => {
    localStorage.removeItem(key);
  },

  clear: () => {
    localStorage.clear();
  },

  saveAuth: ({ token, refreshToken, user, doctor }) => {
    STORAGE.set("TOKEN", token);
    STORAGE.set("REFRESH_TOKEN", refreshToken);
    STORAGE.set("USER", user);
    STORAGE.set("DOCTOR", doctor);
  },

  clearAuth: () => {
    STORAGE.remove("TOKEN");
    STORAGE.remove("REFRESH_TOKEN");
    STORAGE.remove("USER");
    STORAGE.remove("DOCTOR");
  },
};

export default STORAGE;

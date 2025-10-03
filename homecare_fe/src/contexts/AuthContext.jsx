// src/contexts/GlobalAuthContext.jsx
import { createContext, useContext, useState } from "react";
import storage from "../services/storage";

const GlobalAuthContext = createContext();

export const GlobalAuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => storage.get("USER"));
  const [token, setToken] = useState(() => storage.get("TOKEN"));
  const [doctor, setDoctor] = useState(() => storage.get("DOCTOR"));
  const [templateServices, setTemplateServices] = useState([]);
  const [examParts, setExamParts] = useState([]);
  const [formVer2Names, setFormVer2Names] = useState([]);

  const handleLoginContext = ({ token, user, doctor }) => {
    storage.saveAuth({ token, user, doctor });
    setUser(user);
    setToken(token);
    setDoctor(doctor);
  };

  const handleLogoutGlobal = () => {
    storage.clearAuth();
    setUser(null);
    setToken(null);
    setDoctor(null);
  };

  const isLoggedIn = !!token;

  return (
    <GlobalAuthContext.Provider
      value={{
        user,
        token,
        doctor,
        setDoctor,
        handleLoginContext,
        handleLogoutGlobal,
        isLoggedIn,
        setTemplateServices,
        templateServices,
        setExamParts,
        examParts,
        setFormVer2Names,
        formVer2Names,
      }}
    >
      {children}
    </GlobalAuthContext.Provider>
  );
};

export const useGlobalAuth = () => useContext(GlobalAuthContext);

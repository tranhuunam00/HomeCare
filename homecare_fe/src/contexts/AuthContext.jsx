// src/contexts/GlobalAuthContext.jsx
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

import storage from "../services/storage";
import { toast } from "react-toastify";
import { TRANSLATE_LANGUAGE, USER_ROLE } from "../constant/app";
import API_CALL from "../services/axiosClient";

const GlobalAuthContext = createContext();

const SELECTED_PATIENT_STORAGE_KEY = "SELECTED_PATIENT_DIAGNOSE";

const DEFAULT_FILTER_PATIENT = {
  name: null,
  PID: null,
  SID: null,
  id_clinic: [],
  status: [],
  id_template_service: null,
  date_type: null,
  from_date: null,
  to_date: null,
};

export const GlobalAuthProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  const [user, setUser] = useState(() => storage.get("USER"));
  const [token, setToken] = useState(() => storage.get("TOKEN"));
  const [doctor, setDoctor] = useState(() => storage.get("DOCTOR"));

  const [templateServices, setTemplateServices] = useState([]);
  const [examParts, setExamParts] = useState([]);
  const [formVer2Names, setFormVer2Names] = useState([]);
  const [isReadingForm, setIsReadingForm] = useState(false);
  const [printTemplateGlobal, setPrintTemplateGlobal] = useState([{}]);

  const [userPackages, setUserPackages] = useState([
    { package_code: "BASIC", status: "active", end_date: "2030-01-01" },
  ]);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [doctors, setDoctors] = useState([]);
  const [clinicsAll, setClinicsAll] = useState([]);

  const [isOnWorkList, setIsOnWorkList] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const [totalPatient, setTotalPatient] = useState(0);

  const [previewOpen, setPreviewOpen] = useState();

  const [numberLanguageDoctorUseFormV3, setNumberLanguageDoctorUseFormV3] =
    useState(1);

  const [languageTranslate, setLanguageTransslate] = useState(
    TRANSLATE_LANGUAGE.VI,
  );

  const [selectedDoctorUseFormVer3, setSelectedDoctorUseFormVer3] =
    useState(null);

  const [counts, setCounts] = useState({ statusCounts: {}, myReceivedCount: 0 });
  const filterPatientRef = useRef(null);

  const fetchCounts = async (customFilters) => {
    console.log("=== fetchCounts triggered ===");
    try {
      const activeFilters = customFilters || filterPatientRef.current || {};
      const params = {};
      if (activeFilters.date_type) params.date_type = activeFilters.date_type;
      if (activeFilters.from_date) params.from_date = activeFilters.from_date;
      if (activeFilters.to_date) params.to_date = activeFilters.to_date;
      if (activeFilters.id_clinic && Array.isArray(activeFilters.id_clinic) && activeFilters.id_clinic.length > 0) {
        params.id_clinic = activeFilters.id_clinic;
      } else if (activeFilters.id_clinic && !Array.isArray(activeFilters.id_clinic)) {
        params.id_clinic = activeFilters.id_clinic;
      }
      if (activeFilters.id_template_service) params.id_template_service = activeFilters.id_template_service;
      if (activeFilters.name) params.name = activeFilters.name;
      if (activeFilters.PID) params.PID = activeFilters.PID;
      if (activeFilters.SID) params.SID = activeFilters.SID;

      const res = await API_CALL.get("/patient-diagnose/counts", { params });
      const responseData = res?.data?.data !== undefined ? res.data.data : res?.data;
      console.log("=== fetchCounts response ===", responseData);
      if (responseData) {
        setCounts(responseData);
      }
    } catch (err) {
      console.error("Fetch counts error:", err);
    }
  };

  // LOAD từ localStorage
  const [filterPatient, setFilterPatient] = useState(() => {
    const saved = localStorage.getItem("FILTER_PATIENT");

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error("Parse FILTER_PATIENT error:", err);
      }
    }

    return DEFAULT_FILTER_PATIENT;
  });

  const [selectedPatientDiagnose, setSelectedPatientDiagnose] = useState(() => {
    const saved = localStorage.getItem(SELECTED_PATIENT_STORAGE_KEY);

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }

    return null;
  });

  useEffect(() => {
    if (!selectedPatientDiagnose) setLanguageTransslate(TRANSLATE_LANGUAGE.VI);
  }, [selectedPatientDiagnose]);

  useEffect(() => {
    if (!user || !token) return;

    const socketInstance = io(
      import.meta.env.VITE_API_SOCKET_URL || "http://localhost:3001/socket",
      {
        auth: { token },
      },
    );

    socketInstance.on("connect", () => {
      console.log("=== Connected socket successfully! ID: ===", socketInstance.id);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("=== Socket Connection Error ===", err.message, err);
    });

    socketInstance.on("error", (err) => {
      console.error("=== Socket Generic Error ===", err);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("=== Socket disconnected! Reason: ===", reason);
    });

    socketInstance.on("notification:new", (data) => {
      toast.info(`${data.title}\n${data.message}`, {
        position: "bottom-right",
      });

      setNotifications((prev) => [data, ...prev]);

      setUnreadCount((prev) => (prev || 0) + 1);
    });

    socketInstance.on("patient-diagnose-updated", (payload) => {
      console.log("=== AuthContext received socket event: patient-diagnose-updated ===", payload);
      
      const recordClinicId = payload?.data?.id_clinic;
      const userClinicId = doctor?.id_clinic;
      const associatedClinics = doctor?.doctor_clinic_uses?.map(c => +c.id_clinic) || [];
      const belongsToMyClinics = recordClinicId && (
        +recordClinicId === +userClinicId || associatedClinics.includes(+recordClinicId)
      );
      const isAdmin = user?.id_role && +user.id_role === +USER_ROLE.ADMIN;

      console.log("=== Socket client verification ===", {
        recordClinicId,
        userClinicId,
        associatedClinics,
        belongsToMyClinics,
        isAdmin,
        userRoleId: user?.id_role,
        adminRoleId: USER_ROLE.ADMIN
      });

      if (isAdmin || belongsToMyClinics) {
        console.log("=== Event clinic ID matches user access -> fetching counts ===");
        fetchCounts(filterPatientRef.current);
      } else {
        console.log("=== Event clinic ID does not match user access -> skipping fetch ===");
      }

      if (payload?.notification) {
        setNotifications((prev) => {
          const existed = prev.some((n) => n.id === payload.notification.id);

          if (existed) return prev;

          return [payload.notification, ...prev];
        });

        setUnreadCount((prev) => prev + 1);
      }

      if (
        payload?.type === "CONSULTATION_ASSIGNED" &&
        payload?.data?.id_consulting_doctor === doctor?.id
      ) {
        toast.info(
          ` ${payload.notification.title}\n${payload.notification.message}`,
          {
            position: "top-right",
          },
        );
      }
      if (payload?.type === "CONSULTATION_REMOVED" && payload.notification) {
        toast.warning(
          ` ${payload.notification.title}\n${payload.notification.message}`,
        );
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user?.id, token]);

  useEffect(() => {
    if (!token) return;
    fetchCounts(filterPatient);
    const interval = setInterval(() => fetchCounts(filterPatientRef.current), 20000);
    return () => clearInterval(interval);
  }, [token, filterPatient]);

  useEffect(() => {
    if (selectedPatientDiagnose) {
      localStorage.setItem(
        SELECTED_PATIENT_STORAGE_KEY,
        JSON.stringify(selectedPatientDiagnose),
      );
    } else {
      localStorage.removeItem(SELECTED_PATIENT_STORAGE_KEY);
    }
  }, [selectedPatientDiagnose]);

  useEffect(() => {
    filterPatientRef.current = filterPatient;
    localStorage.setItem("FILTER_PATIENT", JSON.stringify(filterPatient));
  }, [filterPatient]);

  const handleLoginContext = ({ token, user, doctor }) => {
    storage.saveAuth({ token, user, doctor });
    setUser(user);
    setToken(token);
    setDoctor(doctor);
  };

  const handleLogoutGlobal = () => {
    storage.clearAuth();

    localStorage.removeItem("FILTER_PATIENT");

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

        isReadingForm,
        setIsReadingForm,

        printTemplateGlobal,
        setPrintTemplateGlobal,

        userPackages,
        setUserPackages,

        notifications,
        setNotifications,

        unreadCount,
        setUnreadCount,

        doctors,
        setDoctors,

        clinicsAll,
        setClinicsAll,

        isOnWorkList,
        setIsOnWorkList,

        collapsed,
        setCollapsed,

        filterPatient,
        setFilterPatient,

        totalPatient,
        setTotalPatient,

        selectedPatientDiagnose,
        setSelectedPatientDiagnose,

        socket,

        previewOpen,
        setPreviewOpen,

        numberLanguageDoctorUseFormV3,
        setNumberLanguageDoctorUseFormV3,

        languageTranslate,
        setLanguageTransslate,

        selectedDoctorUseFormVer3,
        setSelectedDoctorUseFormVer3,

        counts,
        fetchCounts,
      }}
    >
      {children}
    </GlobalAuthContext.Provider>
  );
};

export const useGlobalAuth = () => useContext(GlobalAuthContext);

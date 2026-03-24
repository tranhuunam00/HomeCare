export const T_OPTIONS = [
  { label: "T1", value: "T1" },
  { label: "T2", value: "T2" },
  { label: "T3", value: "T3" },
  { label: "T4", value: "T4" },
];

export const N_OPTIONS = [
  { label: "N0", value: "N0" },
  { label: "N1", value: "N1" },
  { label: "N2", value: "N2" },
  { label: "N3", value: "N3" },
];

export const M_OPTIONS = [
  { label: "M0", value: "M0" },
  { label: "M1a", value: "M1a" },
  { label: "M1b", value: "M1b" },
  { label: "M1c", value: "M1c" },
];

export const getStage = (T, N, M) => {
  if (M == "M1a") {
    return {
      SG: "IVA",
      SimpG: "Distant",
      range: "IVA",
      TNM: `${T}${N}${M}`,
    };
  }
  if (M == "M1b") {
    return {
      SG: "IVB",
      SimpG: "Distant",
      range: "IVB",
      TNM: `${T}${N}${M}`,
    };
  }
  if (M == "M1c") {
    return {
      SG: "IVC",
      SimpG: "Distant",
      range: "IVC",
      TNM: `${T}${N}${M}`,
    };
  }
  if (T == "TX") {
    if (M == "M0") {
      if (N == "N2b") {
        return {
          SG: "",
          SimpG: "Vùng lân cận - Chưa xác định",
          range: "IIIB - Chưa xác định",
          TNM: `${T}${N}${M}`,
        };
      }
      return {
        SG: "",
        SimpG: "Vùng lân cận - Chưa xác định",
        range: "IIIA - Chưa xác định",
        TNM: `${T}${N}${M}`,
      };
    }
  }
  if (T == "T1") {
    if (M == "M0") {
      if (N == "N2b") {
        return {
          SG: "IIIB",
          SimpG: "Vùng lân cận",
          range: "IIIB",
          TNM: `${T}${N}${M}`,
        };
      }
      return {
        SG: "IIIA",
        SimpG: "Vùng lân cận",
        range: "IIIA",
        TNM: `${T}${N}${M}`,
      };
    }
  }

  if (T == "T2") {
    if (M == "M0") {
      if (N == "N2b" || N == "N2a") {
        return {
          SG: "IIIB",
          SimpG: "Vùng lân cận",
          range: "IIIB",
          TNM: `${T}${N}${M}`,
        };
      }
      return {
        SG: "IIIA",
        SimpG: "Vùng lân cận",
        range: "IIIA",
        TNM: `${T}${N}${M}`,
      };
    }
  }
  if (T == "T3") {
    if (M == "M0") {
      if (N == "N2b") {
        return {
          SG: "IIIC",
          SimpG: "Vùng lân cận",
          range: "IIIC",
          TNM: `${T}${N}${M}`,
        };
      }
      return {
        SG: "IIIB",
        SimpG: "Vùng lân cận",
        range: "IIIB",
        TNM: `${T}${N}${M}`,
      };
    }
  }
  if (T == "T4a") {
    if (M == "M0") {
      if (N == "N2b" || N == "N2a") {
        return {
          SG: "IIIC",
          SimpG: "Vùng lân cận",
          range: "IIIC",
          TNM: `${T}${N}${M}`,
        };
      }
      return {
        SG: "IIIB",
        SimpG: "Vùng lân cận",
        range: "IIIB",
        TNM: `${T}${N}${M}`,
      };
    }
  }
  if (T == "T4b") {
    if (M == "M0") {
      return {
        SG: "IIIC",
        SimpG: "Vùng lân cận",
        range: "IIIC",
        TNM: `${T}${N}${M}`,
      };
    }
  }
  return {
    SG: "",
    SimpG: "",
    range: "",
    TNM: `${T}${N}${M}`,
  };
};

export const getT = ({ level_inv }) => {
  return level_inv || "TX";
};

export const getN = ({ pos_num, tumour_deposits }) => {
  if (!tumour_deposits) return "NX";
  if (pos_num > 0 && pos_num <= 1) {
    return "N1a";
  }

  if (pos_num > 1 && pos_num <= 3) {
    return "N1b";
  }

  if (pos_num > 3 && pos_num <= 6) {
    return "N2a";
  }
  if (pos_num > 6) return "N2b";

  return "NX";
};

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
  if (M == "M1") {
    return {
      SG: "IV",
      SimpG: "Distant",
      range: "IV",
      TNM: `${T}${N}${M}`,
    };
  }
  if (T == "TX") {
    if (N == "N1") {
      return {
        SG: "",
        SimpG: "Localised",
        range: "IIB - III",
        TNM: `${T}${N}${M}`,
      };
    }
    if (N == "N2") {
      return {
        SG: "III",
        SimpG: "Localised",
        range: "III",
        TNM: `${T}${N}${M}`,
      };
    }
  }
  if (T == "T1b") {
    if (N == "NX") {
      return {
        SG: "",
        SimpG: "Localised",
        range: "IA - III",
        TNM: `${T}${N}${M}`,
      };
    }
    if (N == "N1") {
      return {
        SG: "IIB",
        SimpG: "Localised",
        range: "IIB",
        TNM: `${T}${N}${M}`,
      };
    }
    if (N == "N2") {
      return {
        SG: "III",
        SimpG: "Localised",
        range: "III",
        TNM: `${T}${N}${M}`,
      };
    }
  }

  if (T == "T1c") {
    if (N == "NX") {
      return {
        SG: "",
        SimpG: "Localised",
        range: "IA - III",
        TNM: `${T}${N}${M}`,
      };
    }
    if (N == "N1") {
      return {
        SG: "IIB",
        SimpG: "Localised",
        range: "IIB",
        TNM: `${T}${N}${M}`,
      };
    }
    if (N == "N2") {
      return {
        SG: "III",
        SimpG: "Localised",
        range: "III",
        TNM: `${T}${N}${M}`,
      };
    }
  }
  if (T == "T2") {
    if (N == "NX") {
      return {
        SG: "",
        SimpG: "Localised",
        range: "IB - III",
        TNM: `${T}${N}${M}`,
      };
    }
    if (N == "N1") {
      return {
        SG: "IIB",
        SimpG: "Localised",
        range: "IIB",
        TNM: `${T}${N}${M}`,
      };
    }
    if (N == "N2") {
      return {
        SG: "III",
        SimpG: "Localised",
        range: "III",
        TNM: `${T}${N}${M}`,
      };
    }
  }
  if (T == "T3") {
    if (N == "NX") {
      return {
        SG: "",
        SimpG: "Localised",
        range: "IIA - III",
        TNM: `${T}${N}${M}`,
      };
    }
    if (N == "N1") {
      return {
        SG: "IIB",
        SimpG: "Localised",
        range: "IIB",
        TNM: `${T}${N}${M}`,
      };
    }
    if (N == "N2") {
      return {
        SG: "III",
        SimpG: "Localised",
        range: "III",
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

export const getT = ({ involves_coe, tumor_size }) => {
  if (involves_coe == "yes") return "T4";
  if (involves_coe == "no") {
    if (tumor_size > 0 && tumor_size <= 1) return "T1b";
    if (tumor_size > 1 && tumor_size <= 2) return "T1c";
    if (tumor_size > 2 && tumor_size <= 4) return "T2";
    if (tumor_size > 4) return "T3";
  }
};

export const getN = ({ pos_num }) => {
  if (+pos_num >= 4) {
    return "N2";
  }
  if (+pos_num > 0) return "N1";
  return "NX";
};

export const getStageFromTNM = ({ T, N, M }) => {
  // Ưu tiên M trước (di căn xa)
  if (M === "M1a" || M === "M1b" || M === "M1c") {
    return {
      SG: "IV",
      SimpG: "Metastatic",
      range: "IV",
    };
  }

  // M0 (chưa di căn xa)
  if (M === "M0") {
    // T3 bất kỳ N (NX, N0, N1, N2...)
    if (T === "T3") {
      return {
        SG: "III",
        SimpG: "Khu trú",
        range: "IIB - IIIC",
      };
    }

    if (T === "T4") {
      return {
        SG: "III",
        SimpG: "Khu trú",
        range: "IIIA - IIIC",
      };
    }

    if (T === "T1a" || T === "T1b") {
      if (N === "N0") {
        return {
          SG: "I",
          SimpG: "Khu trú",
          range: "IA - IB",
        };
      }
    }

    if (T === "T2a" || T === "T2b") {
      return {
        SG: "II",
        SimpG: "Khu trú",
        range: "IIA - IIB",
      };
    }
  }

  // Không xác định rõ
  return {
    SG: "Unknown",
    SimpG: "Unknown",
    range: "Unknown",
  };
};

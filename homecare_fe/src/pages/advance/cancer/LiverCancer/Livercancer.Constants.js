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
  if (T == "T1a") {
    if (M == "M0")
      return { SG: "IVA", SimpG: "Distant", range: "IVA", TNM: `${T}${N}${M}` };
    if (M == "M1") {
      return { SG: "IVB", SimpG: "Distant", range: "IVB", TNM: `${T}${N}${M}` };
    }
  }
  if (T == "T1b") {
    if (M == "M0")
      if (N == "NX")
        return {
          SG: "",
          SimpG: "Distant",
          range: "IB - IVA",
          TNM: `${T}${N}${M}`,
        };
    if (N == "N1")
      return {
        SG: "IVA",
        SimpG: "Distant",
        range: "IVA",
        TNM: `${T}${N}${M}`,
      };
    if (M == "M1") {
      return { SG: "IVB", SimpG: "Distant", range: "IVB", TNM: `${T}${N}${M}` };
    }
  }
  if (T == "TX") {
    if (M == "M0") {
      if (N == "N1") {
        return {
          SG: "IVA",
          SimpG: "Distant",
          range: "IVA",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (M == "M0") {
      return {
        SG: "IVB",
        SimpG: "Distant",
        range: "IVB",
        TNM: `${T}${N}${M}`,
      };
    }
  }
  if (T == "T2") {
    if (M == "M0") {
      if (N == "NX") {
        return {
          SG: "",
          SimpG: "Distant",
          range: "II - IVA",
          TNM: `${T}${N}${M}`,
        };
      }
      if (N == "N1") {
        return {
          SG: "IVB",
          SimpG: "Distant",
          range: "IVB",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (M == "M1") {
      if (N == "NX") {
        return {
          SG: "IVA",
          SimpG: "Distant",
          range: "IVA",
          TNM: `${T}${N}${M}`,
        };
      }
      if (N == "N1") {
        return {
          SG: "IVB",
          SimpG: "Distant",
          range: "IVB",
          TNM: `${T}${N}${M}`,
        };
      }
    }
  }
  if (T == "T3") {
    if (M == "M0") {
      if (N == "NX") {
        return {
          SG: "",
          SimpG: "Distant",
          range: "IIIA - IVA",
          TNM: `${T}${N}${M}`,
        };
      }
      if (N == "N1") {
        return {
          SG: "IVA",
          SimpG: "Distant",
          range: "IVA",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (M == "M1") {
      if (N == "NX") {
        return {
          SG: "IVA",
          SimpG: "Distant",
          range: "IVA",
          TNM: `${T}${N}${M}`,
        };
      }
      if (N == "N1") {
        return {
          SG: "IVB",
          SimpG: "Distant",
          range: "IVB",
          TNM: `${T}${N}${M}`,
        };
      }
    }
  }
  if (T == "T4") {
    if (M == "M0") {
      if (N == "NX") {
        return {
          SG: "",
          SimpG: "Distant",
          range: "IIIB - IVA",
          TNM: `${T}${N}${M}`,
        };
      }
      if (N == "N1") {
        return {
          SG: "IVB",
          SimpG: "Distant",
          range: "IVB",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (M == "M1") {
      if (N == "NX") {
        return {
          SG: "IVA",
          SimpG: "Distant",
          range: "IVA",
          TNM: `${T}${N}${M}`,
        };
      }
      if (N == "N1") {
        return {
          SG: "IVB",
          SimpG: "Distant",
          range: "IVB",
          TNM: `${T}${N}${M}`,
        };
      }
    }
  }
  return {
    SG: "",
    SimpG: "",
    range: "",
    TNM: `${T}${N}${M}`,
  };
};

export const getT = ({
  tumour_count,
  tumor_size,
  vascular_invasion,
  adjacent_organs_invasion,
  peritoneum_perforation,
}) => {
  if (adjacent_organs_invasion == 1 || peritoneum_perforation == 1) {
    return "T4";
  }
  if (vascular_invasion == "major") {
    return "T4";
  }
  if (adjacent_organs_invasion == 0 && peritoneum_perforation == 0) {
    if (vascular_invasion == "minor") {
      if (tumor_size <= 2) {
        if (tumour_count == "single") {
          return "T1a";
        }
        if (tumour_count == "multiple") {
          return "T2";
        }
      }
      if (tumor_size <= 5 && tumor_size > 2) {
        return "T2";
      }
      if (tumor_size > 5) {
        if (tumour_count == "single") {
          return "T2";
        }
        if (tumour_count == "multiple") {
          return "T3";
        }
      }
    }
    if (vascular_invasion == "none") {
      if (tumor_size <= 2) {
        if (tumour_count == "single") {
          return "T1a";
        }
        if (tumour_count == "multiple") {
          return "T2";
        }
      }
      if (tumor_size <= 5 && tumor_size > 2) {
        if (tumour_count == "single") {
          return "T1b";
        }
        if (tumour_count == "multiple") {
          return "T2";
        }
      }
      if (tumor_size > 5) {
        if (tumour_count == "single") {
          return "T1b";
        }
        if (tumour_count == "multiple") {
          return "T3";
        }
      }
    }
  }
  return "TX";
};

export const getN = ({ pos_num }) => {
  if (+pos_num > 0) {
    return "N1";
  }
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

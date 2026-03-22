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
  if (M == "M1a" || M == "M1b") {
    return { SG: "IVA", SimpG: "Distant", range: "IVA", TNM: `${T}${N}${M}` };
  }
  if (M == "M1c") {
    return { SG: "IVB", SimpG: "Distant", range: "IVB", TNM: `${T}${N}${M}` };
  }
  if (T == "TX") {
    if (N == "NX") {
      if (M == "M0") {
        return {
          SG: "",
          SimpG: "",
          range: "",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (N == "N0") {
      if (M == "M0") {
        return {
          SG: "",
          SimpG: "Khu trú → Lan vùng",
          range: "0 - IIIA",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (N == "N1") {
      if (M == "M0") {
        return {
          SG: "",
          SimpG: "Khu trú → Lan vùng",
          range: "IIB - IIIA",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (N == "N2") {
      if (M == "M0") {
        return {
          SG: "",
          SimpG: "Lan vùng",
          range: "IIIA - IIIB",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (N == "N3") {
      if (M == "M0") {
        return {
          SG: "",
          SimpG: "Lan vùng",
          range: "IIIB - IIIC",
          TNM: `${T}${N}${M}`,
        };
      }
    }
  }

  if (T == "T1a") {
    if (N == "NX") {
      if (M == "M0") {
        return {
          SG: "",
          SimpG: "Khu trú → Lan vùng",
          range: "IA1 - IIIB",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (N == "N0") {
      if (M == "M0") {
        return {
          SG: "IA1",
          SimpG: "Khu trú",
          range: "IA1",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (N == "N1") {
      if (M == "M0") {
        return {
          SG: "IIB",
          SimpG: "Khu trú",
          range: "IIB",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (N == "N2") {
      if (M == "M0") {
        return {
          SG: "IIIA",
          SimpG: "Lan vùng",
          range: "IIIA",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (N == "N3") {
      if (M == "M0") {
        return {
          SG: "IIIB",
          SimpG: "Lan vùng",
          range: "IIIB",
          TNM: `${T}${N}${M}`,
        };
      }
    }
  }
  if (T == "T1mi") {
    if (N == "NX" || N == "N0") {
      if (M == "M0") {
        return {
          SG: "IA1",
          SimpG: "Khu trú",
          range: "IA1",
          TNM: `${T}${N}${M}`,
        };
      }
    }

    if (N == "N1" || N == "N2" || N == "N3") {
      if (M == "M0") {
        return {
          SG: "",
          SimpG: "",
          range: "",
          TNM: `${T}${N}${M}`,
        };
      }
    }
  }
  if (T == "T1b") {
    if (N == "NX") {
      if (M == "M0") {
        return {
          SG: "",
          SimpG: "Khu trú → Lan vùng",
          range: "IA2 - IIIB",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (N == "N0") {
      if (M == "M0") {
        return {
          SG: "IA2",
          SimpG: "Khu trú",
          range: "IA2",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (N == "N1") {
      if (M == "M0") {
        return {
          SG: "IIB",
          SimpG: "Khu trú",
          range: "IIB",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (N == "N2") {
      if (M == "M0") {
        return {
          SG: "IIIA",
          SimpG: "Lan vùng",
          range: "IIIA",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (N == "N3") {
      if (M == "M0") {
        return {
          SG: "IIIB",
          SimpG: "Lan vùng",
          range: "IIIB",
          TNM: `${T}${N}${M}`,
        };
      }
    }
  }
  if (T == "T1c") {
    if (N == "NX") {
      if (M == "M0") {
        return {
          SG: "",
          SimpG: "Khu trú → Lan vùng",
          range: "IA3 - IIIB",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (N == "N0") {
      if (M == "M0") {
        return {
          SG: "IA3",
          SimpG: "Khu trú",
          range: "IA3",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (N == "N1") {
      if (M == "M0") {
        return {
          SG: "IIB",
          SimpG: "Khu trú",
          range: "IIB",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (N == "N2") {
      if (M == "M0") {
        return {
          SG: "IIIA",
          SimpG: "Lan vùng",
          range: "IIIA",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (N == "N3") {
      if (M == "M0") {
        return {
          SG: "IIIB",
          SimpG: "Lan vùng",
          range: "IIIB",
          TNM: `${T}${N}${M}`,
        };
      }
    }
  }
  if (T == "T2" || T == "T2a") {
    if (N == "NX") {
      if (M == "M0") {
        return {
          SG: "",
          SimpG: "Khu trú → Lan vùng",
          range: "IB - IIIB",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (N == "N0") {
      if (M == "M0") {
        return {
          SG: "IB",
          SimpG: "Khu trú",
          range: "IB",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (N == "N1") {
      if (M == "M0") {
        return {
          SG: "IIB",
          SimpG: "Khu trú",
          range: "IIB",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (N == "N2") {
      if (M == "M0") {
        return {
          SG: "IIIA",
          SimpG: "Lan vùng",
          range: "IIIA",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (N == "N3") {
      if (M == "M0") {
        return {
          SG: "IIIB",
          SimpG: "Lan vùng",
          range: "IIIB",
          TNM: `${T}${N}${M}`,
        };
      }
    }
  }
  if (T == "T2b") {
    if (N == "NX") {
      if (M == "M0") {
        return {
          SG: "",
          SimpG: "Khu trú → Lan vùng",
          range: "IIA - IIIB",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (N == "N0") {
      if (M == "M0") {
        return {
          SG: "IIA",
          SimpG: "Khu trú",
          range: "IIA",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (N == "N1") {
      if (M == "M0") {
        return {
          SG: "IIB",
          SimpG: "Khu trú",
          range: "IIB",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (N == "N2") {
      if (M == "M0") {
        return {
          SG: "IIIA",
          SimpG: "Lan vùng",
          range: "IIIA",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (N == "N3") {
      if (M == "M0") {
        return {
          SG: "IIIB",
          SimpG: "Lan vùng",
          range: "IIIB",
          TNM: `${T}${N}${M}`,
        };
      }
    }
  }
  if (T == "T2c" || T == "T3") {
    if (N == "NX") {
      if (M == "M0") {
        return {
          SG: "",
          SimpG: "Khu trú → Lan vùng",
          range: "IIB - IIIC",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (N == "N0") {
      if (M == "M0") {
        return {
          SG: "IIB",
          SimpG: "Khu trú",
          range: "IIB",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (N == "N1") {
      if (M == "M0") {
        return {
          SG: "IIIA",
          SimpG: "Lan vùng",
          range: "IIIA",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (N == "N2") {
      if (M == "M0") {
        return {
          SG: "IIIB",
          SimpG: "Lan vùng",
          range: "IIIB",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (N == "N3") {
      if (M == "M0") {
        return {
          SG: "IIIC",
          SimpG: "",
          range: "IIIC",
          TNM: `${T}${N}${M}`,
        };
      }
    }
  }
  if (T == "T4") {
    if (N == "NX") {
      if (M == "M0") {
        return {
          SG: "",
          SimpG: "Lan vùng",
          range: "IIIA - IIIC",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (N == "N0") {
      if (M == "M0") {
        return {
          SG: "IIIA",
          SimpG: "Lan vùng",
          range: "IIIA",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (N == "N1") {
      if (M == "M0") {
        return {
          SG: "IIIA",
          SimpG: "Lan vùng",
          range: "IIIA",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (N == "N2") {
      if (M == "M0") {
        return {
          SG: "IIIB",
          SimpG: "Lan vùng",
          range: "IIIB",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (N == "N3") {
      if (M == "M0") {
        return {
          SG: "IIIC",
          SimpG: "",
          range: "IIIC",
          TNM: `${T}${N}${M}`,
        };
      }
    }
  }
};

export const getT = ({
  mia,
  tumor_size,
  bronchial_inv,
  pleura_visceral,
  atelectasis,
  chest_wall_inv,
  same_lobe_nodules,
  diff_lobe_nodules,
  critical_struct_inv,
}) => {
  if (tumor_size >= 8) {
    return "T4";
  }
  if (diff_lobe_nodules == 1 || critical_struct_inv == 1) {
    return "T4";
  }

  if (bronchial_inv != 0 && !bronchial_inv) {
    // không có logic
  }
  if (bronchial_inv == 0) {
    if (diff_lobe_nodules == -1) {
      // không có logic
    }

    if (diff_lobe_nodules == 0) {
      if (tumor_size >= 6) {
        return "T3";
      }
      if (critical_struct_inv == 0) {
        if (same_lobe_nodules == 1 || chest_wall_inv == 1) {
          return "T3";
        }
        if (tumor_size > 0 && tumor_size <= 1) {
          if (same_lobe_nodules == 0 && chest_wall_inv == 0) {
            if (pleura_visceral == 1 || atelectasis == 1) {
              return "T2";
            }
            if (pleura_visceral == 0 && atelectasis == 0) {
              if (mia == 1) {
                return "T1mi";
              }
              if (mia == 0) {
                return "T1a";
              }
            }
          }
        }
        if (tumor_size > 1 && tumor_size <= 2) {
          if (same_lobe_nodules == 0 && chest_wall_inv == 0) {
            if (pleura_visceral == 1 || atelectasis == 1) {
              return "T2";
            }
            if (pleura_visceral == 0 && atelectasis == 0) {
              if (mia == 1) {
                return "T1mi";
              }
              if (mia == 0) {
                return "T1b";
              }
            }
          }
        }
        if (tumor_size > 2 && tumor_size <= 3) {
          if (same_lobe_nodules == 0 && chest_wall_inv == 0) {
            if (pleura_visceral == 1 || atelectasis == 1) {
              return "T2";
            }
            if (pleura_visceral == 0 && atelectasis == 0) {
              if (mia == 1) {
                return "T1mi";
              }
              if (mia == 0) {
                return "T1c";
              }
            }
          }
        }
        if (tumor_size > 3 && tumor_size <= 4) {
          if (same_lobe_nodules == 0 && chest_wall_inv == 0) {
            return "T2a";
          }
        }
        if (tumor_size > 4 && tumor_size <= 5) {
          if (same_lobe_nodules == 0 && chest_wall_inv == 0) {
            return "T2b";
          }
        }
      }
    }
  }
  if (bronchial_inv == 1) {
    if (diff_lobe_nodules == -1) {
      // không có logic
    }

    if (diff_lobe_nodules == 0) {
      if (tumor_size >= 6) {
        return "T3";
      }
      if (critical_struct_inv == 0) {
        if (same_lobe_nodules == 1 || chest_wall_inv == 1) {
          return "T3";
        }
        if (tumor_size > 0 && tumor_size <= 3) {
          if (same_lobe_nodules == 0 && chest_wall_inv == 0) {
            return "T2";
          }
        }

        if (tumor_size > 3 && tumor_size <= 4) {
          if (same_lobe_nodules == 0 && chest_wall_inv == 0) {
            return "T2a";
          }
        }
        if (tumor_size > 4 && tumor_size <= 5) {
          if (same_lobe_nodules == 0 && chest_wall_inv == 0) {
            return "T2b";
          }
        }
      }
    }
  }
  if (bronchial_inv == 2) {
    return "T4";
  }

  return "TX";
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

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
  if (M == "M1" || M == "M1b") {
    return { SG: "IV", SimpG: "Distant", range: "IV", TNM: `${T}${N}${M}` };
  }

  if (T == "TX") {
    if (N == "NX") return { SG: "", SimpG: "", range: "", TNM: `${T}${N}${M}` };
    if (N == "N0")
      return {
        SG: "",
        SimpG: "Khu trú",
        range: "I - IV",
        TNM: `${T}${N}${M}`,
      };
    if (N == "N1")
      return {
        SG: "",
        SimpG: "Khu trú",
        range: "III - IV",
        TNM: `${T}${N}${M}`,
      };
  }
  if (T == "T1a" || T == "T1b") {
    if (N == "NX")
      return {
        SG: "",
        SimpG: "Khu trú",
        range: "I - III",
        TNM: `${T}${N}${M}`,
      };
    if (N == "N0")
      return {
        SG: "I",
        SimpG: "Khu trú",
        range: "I",
        TNM: `${T}${N}${M}`,
      };
    if (N == "N1")
      return {
        SG: "III",
        SimpG: "Khu trú",
        range: "III",
        TNM: `${T}${N}${M}`,
      };
  }
  if (T == "T2a" || T == "T2b") {
    if (N == "NX")
      return {
        SG: "",
        SimpG: "Khu trú",
        range: "II - III",
        TNM: `${T}${N}${M}`,
      };
    if (N == "N0")
      return {
        SG: "II",
        SimpG: "Khu trú",
        range: "I",
        TNM: `${T}${N}${M}`,
      };
    if (N == "N1")
      return {
        SG: "III",
        SimpG: "Khu trú",
        range: "III",
        TNM: `${T}${N}${M}`,
      };
  }
  if (T == "T3a" || T == "T3b" || T == "T3c") {
    return {
      SG: "III",
      SimpG: "Khu trú",
      range: "III",
      TNM: `${T}${N}${M}`,
    };
  }
  if (T == "T4") {
    return {
      SG: "IV",
      SimpG: "Khu trú",
      range: "IV",
      TNM: `${T}${N}${M}`,
    };
  }
  return { SG: "", SimpG: "", range: "", TNM: `${T}${N}${M}` };
};

export const getT = ({
  tumor_size,
  kidney_only,
  renal_vein,
  perirenal_fat,
  ivc_below,
  ivc_above,
  beyond_gerota,
}) => {
  if (beyond_gerota == "yes") {
    if (kidney_only == "yes") return "Invalid combination";
    return "T4";
  }
  if (beyond_gerota == "no") {
    if (ivc_above == "yes") {
      if (kidney_only == "yes") return "Invalid combination";
      return "T3c";
    }
    if (ivc_above == "no") {
      if (ivc_below == "yes") {
        if (renal_vein == "no" || kidney_only == "yes")
          return "Invalid combination";
        return "T3b";
      }
      if (ivc_below == "no") {
        if (perirenal_fat == "yes") {
          if (renal_vein == "yes") {
            if (kidney_only == "yes") {
              return "Invalid combination";
            }
            if (kidney_only == "no") {
              return "T3a";
            }
            if (kidney_only == "unknown") {
              return "T3a";
            }
          }
          if (renal_vein == "no") {
            if (kidney_only == "yes") {
              return "Invalid combination";
            }
            return "T3a";
          }
          if (renal_vein == "unknown") {
            if (kidney_only == "yes") {
              return "Invalid combination";
            }
            return "T3a";
          }
        }
        if (perirenal_fat == "no") {
          if (renal_vein == "yes") {
            if (kidney_only == "yes") {
              return "Invalid combination";
            }
            if (kidney_only == "no") {
              return "T3a";
            }
            if (kidney_only == "unknown") {
              return "T3a";
            }
          }
          if (renal_vein == "no" || renal_vein == "unknown") {
            if (kidney_only == "yes") {
              if (tumor_size > 0 && tumor_size <= 4) return "T1a";
              if (tumor_size > 4 && tumor_size <= 7) return "T1b";
              if (tumor_size > 7 && tumor_size <= 10) return "T2a";
              if (tumor_size > 10) return "T2b";
              return "TX";
            }
            if (kidney_only == "no") {
              return "T3a";
            }
            if (kidney_only == "unknown") {
              return "TX";
            }
          }
        }
        if (perirenal_fat == "unknown") {
          if (renal_vein == "yes") {
            if (kidney_only == "yes") {
              return "Invalid combination";
            }
            if (kidney_only == "no") {
              return "T3a";
            }
            if (kidney_only == "unknown") {
              return "T3a";
            }
          }
          if (renal_vein == "no") {
            if (kidney_only == "yes") {
              if (tumor_size > 0 && tumor_size <= 4) return "T1a";
              if (tumor_size > 4 && tumor_size <= 7) return "T1b";
              if (tumor_size > 7 && tumor_size <= 10) return "T2a";
              if (tumor_size > 10) return "T2b";
              return "TX";
            }
            if (kidney_only == "no") {
              return "T3a";
            }
            if (kidney_only == "unknown") {
              return "TX";
            }
          }
        }
      }
      if (ivc_below == "unknown") {
        if (perirenal_fat == "yes") {
          if (renal_vein == "yes") {
            if (kidney_only == "yes") return "Invalid combination";
          }
          if (renal_vein == "no") {
            if (kidney_only == "yes") {
              return "Invalid combination";
            }
            return "T3a";
          }
          if (renal_vein == "unknown") {
            if (kidney_only == "yes") {
              return "Invalid combination";
            }
          }
        }
        if (perirenal_fat == "no") {
          if (renal_vein == "yes") {
            if (kidney_only == "yes") {
              return "Invalid combination";
            }
          }
          if (renal_vein == "no") {
            if (kidney_only == "yes") {
              if (tumor_size > 0 && tumor_size <= 4) return "T1a";
              if (tumor_size > 4 && tumor_size <= 7) return "T1b";
              if (tumor_size > 7 && tumor_size <= 10) return "T2a";
              if (tumor_size > 10) return "T2b";
              return "TX";
            }
            if (kidney_only == "no") {
              return "T3a";
            }
            if (kidney_only == "unknown") {
              return "TX";
            }
          }
          if (renal_vein == "unknown") {
            if (kidney_only == "yes") {
              if (tumor_size > 0 && tumor_size <= 4) return "T1a";
              if (tumor_size > 4 && tumor_size <= 7) return "T1b";
              if (tumor_size > 7 && tumor_size <= 10) return "T2a";
              if (tumor_size > 10) return "T2b";
              return "TX";
            }
          }
        }
        if (perirenal_fat == "unknown") {
          if (renal_vein == "yes") {
            if (kidney_only == "yes") {
              return "Invalid combination";
            }
          }
          if (renal_vein == "no") {
            if (kidney_only == "yes") {
              if (tumor_size > 0 && tumor_size <= 4) return "T1a";
              if (tumor_size > 4 && tumor_size <= 7) return "T1b";
              if (tumor_size > 7 && tumor_size <= 10) return "T2a";
              if (tumor_size > 10) return "T2b";
              return "TX";
            }
            if (kidney_only == "no") {
              return "T3a";
            }
            if (kidney_only == "unknown") {
              return "TX";
            }
          }
          if (renal_vein == "unknown") {
            if (kidney_only == "yes") {
              if (tumor_size > 0 && tumor_size <= 4) return "T1a";
              if (tumor_size > 4 && tumor_size <= 7) return "T1b";
              if (tumor_size > 7 && tumor_size <= 10) return "T2a";
              if (tumor_size > 10) return "T2b";
              return "TX";
            }
          }
        }
      }
    }
    if (ivc_above == "unknown") {
      if (ivc_below == "yes") {
        if (perirenal_fat == "yes") {
          if (renal_vein == "yes") {
            if (kidney_only == "yes") {
              return "Invalid combination.";
            }
          }
          if (renal_vein == "no") {
            if (kidney_only == "yes") {
              return "Invalid combination.";
            }
            return "T3c";
          }
          if (renal_vein == "unknown") {
            if (kidney_only == "yes") {
              return "Invalid combination.";
            }
          }
        }
        if (perirenal_fat == "no") {
          if (renal_vein == "yes") {
            if (kidney_only == "yes") {
              return "Invalid combination.";
            }
          }
          if (renal_vein == "no") {
            if (kidney_only == "yes") {
              return "Invalid combination.";
            }
            return "T3c";
          }
          if (renal_vein == "unknown") {
            if (kidney_only == "yes") {
              return "Invalid combination.";
            }
          }
        }
        if (perirenal_fat == "unknown") {
          if (renal_vein == "yes") {
            if (kidney_only == "yes") {
              return "Invalid combination.";
            }
          }
          if (renal_vein == "no") {
            if (kidney_only == "yes") {
              return "Invalid combination.";
            }
            return "T3c";
          }
          if (renal_vein == "unknown") {
            if (kidney_only == "yes") {
              return "Invalid combination.";
            }
          }
        }
      }
      if (ivc_below == "no") {
        if (perirenal_fat == "yes") {
          if (renal_vein == "yes") {
            if (kidney_only == "yes") {
              return "Invalid combination.";
            }
            return "T3a";
          }
          if (renal_vein == "no") {
            if (kidney_only == "yes") {
              return "Invalid combination.";
            }
            return "T3a";
          }
          if (renal_vein == "unknown") {
            if (kidney_only == "yes") {
              return "Invalid combination.";
            }
            return "T3a";
          }
        }
        if (perirenal_fat == "no" || perirenal_fat == "unknown") {
          if (renal_vein == "yes") {
            if (kidney_only == "yes") {
              return "Invalid combination.";
            }
            return "T3a";
          }
          if (renal_vein == "no" || renal_vein == "unknown") {
            if (kidney_only == "yes") {
              if (tumor_size > 0 && tumor_size <= 4) return "T1a";
              if (tumor_size > 4 && tumor_size <= 7) return "T1b";
              if (tumor_size > 7 && tumor_size <= 10) return "T2a";
              if (tumor_size > 10) return "T2b";
              return "TX";
            }
            if (kidney_only == "unknown") {
              return "TX";
            }
            return "T3a";
          }
        }
      }
      if (ivc_below == "unknown") {
        if (perirenal_fat == "yes") {
          if (kidney_only == "yes") {
            return "Invalid combination.";
          }
        }
        if (perirenal_fat == "no" || perirenal_fat == "unknown") {
          if (renal_vein == "yes") {
            if (kidney_only == "yes") {
              return "Invalid combination.";
            }
          }
          if (renal_vein == "no" || renal_vein == "unknown") {
            if (kidney_only == "yes") {
              if (tumor_size > 0 && tumor_size <= 4) return "T1a";
              if (tumor_size > 4 && tumor_size <= 7) return "T1b";
              if (tumor_size > 7 && tumor_size <= 10) return "T2a";
              if (tumor_size > 10) return "T2b";
              return "TX";
            }
          }
        }
      }
    }
  }
  if (beyond_gerota == "unknown") {
    if (ivc_above == "yes") {
      if (ivc_below == "yes" || ivc_below == "unknown") {
        if (kidney_only == "yes") {
          return "Invalid combination";
        }
      }
      if (ivc_below == "no") {
        if (kidney_only == "yes") {
          return "Invalid combination";
        }
        return "T4";
      }
    }
    if (ivc_above == "no") {
      if (ivc_below == "yes") {
        if (renal_vein == "yes" || renal_vein == "unknown") {
          if (kidney_only == "yes") {
            return "Invalid combination";
          }
        }
        if (renal_vein == "no") {
          if (kidney_only == "yes") {
            return "Invalid combination";
          }
          return "T4";
        }
      }
      if (ivc_below == "no" || ivc_below == "unknown") {
        if (perirenal_fat == "yes") {
          if (kidney_only == "yes") {
            return "Invalid combination";
          }
        }
        if (perirenal_fat == "no" || perirenal_fat == "unknown") {
          if (renal_vein == "yes") {
            if (kidney_only == "yes") {
              return "Invalid combination";
            }
          }
          if (renal_vein == "no" || renal_vein == "unknown") {
            if (kidney_only == "yes") {
              if (tumor_size > 0 && tumor_size <= 4) return "T1a";
              if (tumor_size > 4 && tumor_size <= 7) return "T1b";
              if (tumor_size > 7 && tumor_size <= 10) return "T2a";
              if (tumor_size > 10) return "T2b";
              return "TX";
            }
          }
        }
      }
    }
    if (ivc_above == "unknown") {
      if (ivc_below == "yes") {
        if (kidney_only == "yes") {
          return "Invalid combination";
        }
      }
      if (renal_vein == "no" || renal_vein == "unknown") {
        if (perirenal_fat == "yes") {
          if (kidney_only == "yes") {
            return "Invalid combination";
          }
        }
        if (perirenal_fat == "no" || perirenal_fat == "unknown") {
          if (renal_vein == "yes") {
            if (kidney_only == "yes") {
              return "Invalid combination";
            }
          }
          if (renal_vein == "no" || renal_vein == "unknown") {
            if (kidney_only == "yes") {
              if (tumor_size > 0 && tumor_size <= 4) return "T1a";
              if (tumor_size > 4 && tumor_size <= 7) return "T1b";
              if (tumor_size > 7 && tumor_size <= 10) return "T2a";
              if (tumor_size > 10) return "T2b";
              return "TX";
            }
          }
        }
      }
    }
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

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
  if (M == "M1b") {
    return {
      SG: "IVB",
      FIGO: "IVB",
      SimpG: "Distant",
      range: "IVB",
      TNM: `${T}${N}${M}`,
    };
  }
  if (M == "M1a") {
    return {
      SG: "IVA",
      FIGO: "IVA",
      SimpG: "Distant",
      range: "IVA",
      TNM: `${T}${N}${M}`,
    };
  }
  if (T == "TX") {
    if (N == "N0") {
      return {
        SG: "",
        FIGO: "",
        SimpG: "Localised",
        range: "	0 - IIIC",
        TNM: `${T}${N}${M}`,
      };
    }
    if (N == "N1a") {
      return {
        SG: "",
        FIGO: "	",
        SimpG: "Localised",
        range: "IIIA1 - IIIC",
        TNM: `${T}${N}${M}`,
      };
    }
    if (N == "N1b") {
      return {
        SG: "",
        FIGO: "	",
        SimpG: "Localised",
        range: "IIIA1 - IIIC",
        TNM: `${T}${N}${M}`,
      };
    }
  }
  if (T == "T1a") {
    if (N == "NX") {
      return {
        SG: "",
        FIGO: "",
        SimpG: "Localised",
        range: "IA - IIIA1",
        TNM: `${T}${N}${M}`,
      };
    }
    if (N == "N0") {
      return {
        SG: "IA",
        FIGO: "IA",
        SimpG: "Localised",
        range: "IA",
        TNM: `${T}${N}${M}`,
      };
    }
    if (N == "N1a") {
      return {
        SG: "IIIA1",
        FIGO: "IIIA1i",
        SimpG: "Localised",
        range: "IIIA1",
        TNM: `${T}${N}${M}`,
      };
    }
    if (N == "N1b") {
      return {
        SG: "IIIA1",
        FIGO: "IIIA1ii",
        SimpG: "Localised",
        range: "IIIA1",
        TNM: `${T}${N}${M}`,
      };
    }
  }
  if (T == "T1c1" || T == "T1c2" || T == "T1c3") {
    if (N == "NX") {
      return {
        SG: "",
        FIGO: "",
        SimpG: "Localised",
        range: "IC - IIIA1",
        TNM: `${T}${N}${M}`,
      };
    }
    if (N == "N0") {
      return {
        SG: "IC",
        FIGO: "IC",
        SimpG: "Localised",
        range: "IC",
        TNM: `${T}${N}${M}`,
      };
    }
    if (N == "N1a") {
      return {
        SG: "IIIA1",
        FIGO: "IIIA1i",
        SimpG: "Localised",
        range: "IIIA1",
        TNM: `${T}${N}${M}`,
      };
    }
    if (N == "N1b") {
      return {
        SG: "IIIA1",
        FIGO: "IIIA1ii",
        SimpG: "Localised",
        range: "IIIA1",
        TNM: `${T}${N}${M}`,
      };
    }
  }
  if (T == "T2a") {
    if (N == "NX") {
      return {
        SG: "",
        FIGO: "",
        SimpG: "Localised",
        range: "IIA - IIIA1",
        TNM: `${T}${N}${M}`,
      };
    }
    if (N == "N0") {
      return {
        SG: "IIA",
        FIGO: "IIA",
        SimpG: "Localised",
        range: "IIA",
        TNM: `${T}${N}${M}`,
      };
    }
    if (N == "N1a") {
      return {
        SG: "IIIA1",
        FIGO: "IIIA1i",
        SimpG: "Localised",
        range: "IIIA1",
        TNM: `${T}${N}${M}`,
      };
    }
    if (N == "N1b") {
      return {
        SG: "IIIA1",
        FIGO: "IIIA1ii",
        SimpG: "Localised",
        range: "IIIA1",
        TNM: `${T}${N}${M}`,
      };
    }
  }
  if (T == "T2b") {
    if (N == "NX") {
      return {
        SG: "",
        FIGO: "",
        SimpG: "Localised",
        range: "IIB - IIIA1",
        TNM: `${T}${N}${M}`,
      };
    }
    if (N == "N0") {
      return {
        SG: "IIB",
        FIGO: "IIB",
        SimpG: "Localised",
        range: "IIB",
        TNM: `${T}${N}${M}`,
      };
    }
    if (N == "N1a") {
      return {
        SG: "IIIA1",
        FIGO: "IIIA1i",
        SimpG: "Localised",
        range: "IIIA1",
        TNM: `${T}${N}${M}`,
      };
    }
    if (N == "N1b") {
      return {
        SG: "IIIA1",
        FIGO: "IIIA1ii",
        SimpG: "Localised",
        range: "IIIA1",
        TNM: `${T}${N}${M}`,
      };
    }
  }
  if (T == "T2") {
    if (N == "NX") {
      return {
        SG: "",
        FIGO: "",
        SimpG: "Localised",
        range: "II - IIIA1",
        TNM: `${T}${N}${M}`,
      };
    }
    if (N == "N0") {
      return {
        SG: "II",
        FIGO: "II",
        SimpG: "Localised",
        range: "II",
        TNM: `${T}${N}${M}`,
      };
    }
    if (N == "N1a") {
      return {
        SG: "IIIA1",
        FIGO: "IIIA1i",
        SimpG: "Localised",
        range: "IIIA1",
        TNM: `${T}${N}${M}`,
      };
    }
    if (N == "N1b") {
      return {
        SG: "IIIA1",
        FIGO: "IIIA1ii",
        SimpG: "Localised",
        range: "IIIA1",
        TNM: `${T}${N}${M}`,
      };
    }
  }
  if (T == "T3a") {
    return {
      SG: "IIIA2",
      FIGO: "IIIA2",
      SimpG: "Localised",
      range: "IIIA2",
      TNM: `${T}${N}${M}`,
    };
  }
  if (T == "T3b") {
    return {
      SG: "IIIB",
      FIGO: "IIIB",
      SimpG: "Localised",
      range: "IIIB",
      TNM: `${T}${N}${M}`,
    };
  }
  if (T == "T3c") {
    return {
      SG: "IIIC",
      FIGO: "IIIC",
      SimpG: "Localised",
      range: "IIIC",
      TNM: `${T}${N}${M}`,
    };
  }
  return {
    SG: "",
    FIGO: "",
    SimpG: "",
    range: "",
    TNM: `${T}${N}${M}`,
  };
};

export const getT = ({
  micro_only,
  stromal,
  clinically_visible_lesion,
  beyond_uterus,
  parametrial_involvement,
  lower_vagina,
  pelvic_wall,
  hydronephrosis,
  bladder_rectum,
}) => {
  if (bladder_rectum == "yes") {
    if (beyond_uterus == "no") {
      return "Invalid combination";
    }
    return "T4";
  }
  if (bladder_rectum == "no") {
    if (hydronephrosis == "yes") {
      if (beyond_uterus == "no") {
        return "Invalid combination";
      }
      return "T3b";
    }
    if (hydronephrosis == "no") {
      if (pelvic_wall == "yes") {
        if (beyond_uterus == "no") {
          return "Invalid combination";
        }
        return "T3b";
      }
      if (pelvic_wall == "no") {
        if (lower_vagina == "yes") {
          if (beyond_uterus == "no") {
            return "Invalid combination";
          }
          return "T3a";
        }
        if (lower_vagina == "no") {
          if (parametrial_involvement == "yes") {
            if (beyond_uterus == "no") {
              return "Invalid combination";
            }
            return "T2b";
          }
          if (parametrial_involvement == "no") {
            if (beyond_uterus == "yes") {
              if (clinically_visible_lesion == "no") {
                return "Invalid combination";
              }
              if (clinically_visible_lesion == "le_4cm") {
                return "T2a1";
              }
              if (clinically_visible_lesion == "gt_4cm") {
                return "T2a2";
              }
            }
            if (beyond_uterus == "no") {
              if (clinically_visible_lesion == null) {
                if (stromal == null) {
                }
                if (stromal == "micro_1") {
                  if (micro_only == "yes") {
                    return "T1a1";
                  }
                }
                if (stromal == "micro_2") {
                  if (micro_only == "yes") {
                    return "T1a2";
                  }
                }
                if (stromal == "macro") {
                  if (micro_only == "yes") {
                    return "T1b";
                  }
                }
              }
              if (clinically_visible_lesion == "no") {
                if (stromal == null) {
                  if (micro_only == "no") {
                    return "Invalid combination";
                  }
                }
                if (stromal == "micro_1") {
                  if (micro_only == "yes") {
                    return "T1a1";
                  }
                  if (micro_only == "no") {
                    return "Invalid combination";
                  }
                  if (micro_only == "unknown") {
                    return "T1a1";
                  }
                }
                if (stromal == "micro_2") {
                  if (micro_only == "no") {
                    return "Invalid combination";
                  }
                  return "T1a2";
                }
                if (stromal == "macro") {
                  if (micro_only == "no") {
                    return "Invalid combination";
                  }
                  return "T1b";
                }
              }
              if (clinically_visible_lesion == "le_4cm") {
                if (micro_only == "yes") {
                  return "Invalid combination";
                }
                return "T1b1";
              }
              if (clinically_visible_lesion == "gt_4cm") {
                if (micro_only == "yes") {
                  return "Invalid combination";
                }
                return "T1b2";
              }
            }
            if (beyond_uterus == "unknown") {
              if (clinically_visible_lesion == null) {
                if (stromal == null) {
                  if (micro_only == "no") {
                    return "Invalid combination";
                  }
                }
                if (stromal == "micro_1") {
                  if (micro_only == "no") {
                    return "Invalid combination";
                  }
                  return "T1a1";
                }
                if (stromal == "micro_2") {
                  if (micro_only == "no") {
                    return "Invalid combination";
                  }
                  return "T1a2";
                }
                if (stromal == "macro") {
                  if (micro_only == "no") {
                    return "Invalid combination";
                  }
                  return "T1b";
                }
              }
              if (clinically_visible_lesion == "no") {
                if (stromal == null) {
                  if (micro_only == "no") {
                    return "Invalid combination";
                  }
                }
                if (stromal == "micro_1") {
                  if (micro_only == "no") {
                    return "Invalid combination";
                  }
                  return "T1a1";
                }
                if (stromal == "micro_2") {
                  if (micro_only == "no") {
                    return "Invalid combination";
                  }
                  return "T1a2";
                }
                if (stromal == "macro") {
                  if (micro_only == "no") {
                    return "Invalid combination";
                  }
                  return "T1b";
                }
              }
              if (clinically_visible_lesion == "le_4cm") {
                if (micro_only == "yes") {
                  return "T2a1";
                }
              }
              if (clinically_visible_lesion == "gt_4cm") {
                if (micro_only == "yes") {
                  return "T2a2";
                }
              }
            }
          }

          if (parametrial_involvement == "unknown") {
            if (beyond_uterus == "yes") {
              return "TX";
            }
            if (beyond_uterus == "no") {
              if (clinically_visible_lesion == null) {
                if (stromal == null) {
                }
                if (stromal == "micro_1") {
                  if (micro_only == "yes") {
                    return "T1a1";
                  }
                }
                if (stromal == "micro_2") {
                  if (micro_only == "yes") {
                    return "T1a2";
                  }
                }
                if (stromal == "macro") {
                  if (micro_only == "yes") {
                    return "T1b";
                  }
                }
              }
              if (clinically_visible_lesion == "no") {
                if (micro_only == "no") {
                  return "Invalid combination";
                }
                if (stromal == null) {
                  if (micro_only == "yes") {
                    return "T1a1";
                  }
                }
                if (stromal == null) {
                  if (micro_only == "yes") {
                    return "T1a2";
                  }
                }
                if (stromal == null) {
                  if (micro_only == "yes") {
                    return "T1b";
                  }
                }
              }
              if (clinically_visible_lesion == "le_4cm") {
                if (micro_only == "yes") {
                  return "Invalid combination";
                }
                return "T1b1";
              }
              if (clinically_visible_lesion == "gt_4cm") {
                if (micro_only == "yes") {
                  return "Invalid combination";
                }
                return "T1b2";
              }
            }
            if (beyond_uterus == "unknown") {
              return "TX";
            }
          }
        }
        if (lower_vagina == "unknown") {
          if (parametrial_involvement == "yes") {
            if (beyond_uterus == "no") {
              return "Invalid combination";
            }
          }
          if (parametrial_involvement == "no") {
            if (beyond_uterus == "yes") {
              if (clinically_visible_lesion == "no") {
                return "T3a";
              }
            }
            if (beyond_uterus == "no") {
              if (clinically_visible_lesion == null) {
                if (stromal == "micro_1") {
                  if (micro_only == "yes") {
                    return "T1a1";
                  }
                }
                if (stromal == "micro_2") {
                  if (micro_only == "yes") {
                    return "T1a2";
                  }
                }
                if (stromal == "macro") {
                  if (micro_only == "yes") {
                    return "T1b";
                  }
                }
              }
              if (clinically_visible_lesion == "no") {
                if (micro_only == "no") {
                  return "Invalid combination";
                }
                if (stromal == "micro_1") {
                  return "T1a1";
                }
                if (stromal == "micro_2") {
                  return "T1a2";
                }
                if (stromal == "macro") {
                  return "T1b";
                }
              }
              if (clinically_visible_lesion == "le_4cm") {
                if (micro_only == "yes") {
                  return "Invalid combination";
                }
                return "T1b1";
              }
              if (clinically_visible_lesion == "gt_4cm") {
                if (micro_only == "yes") {
                  return "Invalid combination";
                }
                return "T1b2";
              }
            }
            if (beyond_uterus == "unknown") {
              return "TX";
            }
          }
          if (parametrial_involvement == "unknown") {
            if (beyond_uterus == "yes") {
              // processing
              if (clinically_visible_lesion == null) {
              }
              if (clinically_visible_lesion == "no") {
              }
              if (clinically_visible_lesion == "le_4cm") {
              }
              if (clinically_visible_lesion == "gt_4cm") {
              }
            }
            if (beyond_uterus == "no") {
            }
            if (beyond_uterus == "unknown") {
            }
          }
        }
      }
    }
    if (hydronephrosis == "unknown") {
    }
  }

  return "TX";
};

export const getN = ({ meta_size, regional_nodes }) => {
  if (regional_nodes == "no") {
    if (meta_size > 0) return "Invalid combination.";
    return "N0";
  }
  if (regional_nodes == "yes" || regional_nodes == "no") {
    if (meta_size >= 11) return "N1b";
    if (meta_size > 0) return "N1a";
  }
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

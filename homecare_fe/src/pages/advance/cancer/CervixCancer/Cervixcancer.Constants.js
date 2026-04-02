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
      SG: "IVB",
      FIGO: "IVB",
      SimpG: "Distant",
      range: "IVB",
      TNM: `${T}${N}${M}`,
    };
  }
  if (T == "TX") {
    if (N == "N1") {
      return {
        SG: "",
        FIGO: "",
        SimpG: "Regional",
        range: "IIIB - IVA",
        TNM: `${T}${N}${M}`,
      };
    }
  }

  if (T == "T4") {
    return {
      SG: "IVA",
      FIGO: "IVA",
      SimpG: "Regional",
      range: "IVA",
      TNM: `${T}${N}${M}`,
    };
  }
  if (T == "T3b") {
    return {
      SG: "IIIB",
      FIGO: "IIIB",
      SimpG: "Regional",
      range: "IIIB",
      TNM: `${T}${N}${M}`,
    };
  }
  if (T == "T3a") {
    if (N == "N1") {
      return {
        SG: "IIIB",
        FIGO: "IIIA",
        SimpG: "Regional",
        range: "IIIB",
        TNM: `${T}${N}${M}`,
      };
    }

    if (N == "NX") {
      return {
        SG: "",
        FIGO: "",
        SimpG: "Regional",
        range: "III - IIIB",
        TNM: `${T}${N}${M}`,
      };
    }
  }

  if (T == "T2b") {
    if (N == "N1") {
      return {
        SG: "IIIB",
        FIGO: "IIB",
        SimpG: "Regional",
        range: "IIIB",
        TNM: `${T}${N}${M}`,
      };
    }

    if (N == "NX") {
      return {
        SG: "",
        FIGO: "",
        SimpG: "Localised - Regional",
        range: "IIB - IIIB",
        TNM: `${T}${N}${M}`,
      };
    }
  }

  if (T == "T2a2") {
    if (N == "N1") {
      return {
        SG: "IIIB",
        FIGO: "IIA2",
        SimpG: "Regional",
        range: "IIIB",
        TNM: `${T}${N}${M}`,
      };
    }

    if (N == "NX") {
      return {
        SG: "",
        FIGO: "",
        SimpG: "Localised - Regional",
        range: "IIA2 - IIIB",
        TNM: `${T}${N}${M}`,
      };
    }
  }

  if (T == "T2a1") {
    if (N == "N1") {
      return {
        SG: "IIIB",
        FIGO: "IIA1",
        SimpG: "Regional",
        range: "IIIB",
        TNM: `${T}${N}${M}`,
      };
    }

    if (N == "NX") {
      return {
        SG: "",
        FIGO: "",
        SimpG: "Localised - Regional",
        range: "IIA1 - IIIB",
        TNM: `${T}${N}${M}`,
      };
    }
  }
  if (T == "T1b2") {
    if (N == "N1") {
      return {
        SG: "IIIB",
        FIGO: "IB2",
        SimpG: "Regional",
        range: "IIIB",
        TNM: `${T}${N}${M}`,
      };
    }

    if (N == "NX") {
      return {
        SG: "",
        FIGO: "",
        SimpG: "Localised - Regional",
        range: "IB2 - IIIB",
        TNM: `${T}${N}${M}`,
      };
    }
  }

  if (T == "T1b1") {
    if (N == "N1") {
      return {
        SG: "IIIB",
        FIGO: "IB1",
        SimpG: "Regional",
        range: "IIIB",
        TNM: `${T}${N}${M}`,
      };
    }

    if (N == "NX") {
      return {
        SG: "",
        FIGO: "",
        SimpG: "Localised - Regional",
        range: "IB1 - IIIB",
        TNM: `${T}${N}${M}`,
      };
    }
  }

  if (T == "T1b") {
    if (N == "N1") {
      return {
        SG: "IIIB",
        FIGO: "IIIB",
        SimpG: "Regional",
        range: "IIIB",
        TNM: `${T}${N}${M}`,
      };
    }

    if (N == "NX") {
      return {
        SG: "",
        FIGO: "",
        SimpG: "Localised - Regional",
        range: "IB - IIIB",
        TNM: `${T}${N}${M}`,
      };
    }
  }

  if (T == "T1a2") {
    if (N == "N1") {
      return {
        SG: "IIIB",
        FIGO: "IA2",
        SimpG: "Regional",
        range: "IIIB",
        TNM: `${T}${N}${M}`,
      };
    }

    if (N == "NX") {
      return {
        SG: "",
        FIGO: "",
        SimpG: "Localised - Regional",
        range: "IA2 - IIIB",
        TNM: `${T}${N}${M}`,
      };
    }
  }

  if (T == "T1a1") {
    if (N == "N1") {
      return {
        SG: "IIIB",
        FIGO: "IA1",
        SimpG: "Regional",
        range: "IIIB",
        TNM: `${T}${N}${M}`,
      };
    }

    if (N == "NX") {
      return {
        SG: "",
        FIGO: "",
        SimpG: "Localised - Regional",
        range: "IA1 - IIIB",
        TNM: `${T}${N}${M}`,
      };
    }
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
  if (bladder_rectum == "no" || bladder_rectum == "unknown") {
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
              return "Invalid combination";
            }
            if (beyond_uterus == "unknown") {
            }
          }
        }
      }
      if (pelvic_wall == "unknown") {
        if (lower_vagina == "yes") {
          if (beyond_uterus == "no") {
            return "Invalid combination";
          }
        }
        if (lower_vagina == "no") {
          if (parametrial_involvement == "yes") {
            if (beyond_uterus == "no") {
              return "Invalid combination";
            }
          }
          if (parametrial_involvement == "no") {
            if (beyond_uterus == "yes") {
              if (clinically_visible_lesion == "no") {
                return "T3b";
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
                if (micro_only == "no") {
                  return "Invalid combination";
                }
                if (stromal == null) {
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
              if (clinically_visible_lesion == "no" && micro_only == "no") {
                return "T3b";
              }
            }
          }
          if (parametrial_involvement == "unknown") {
            if (beyond_uterus == "yes") {
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
                    return "T1b2";
                  }
                }
              }
              if (clinically_visible_lesion == "no") {
                if (micro_only == "no") {
                  return "Invalid combination";
                }
                if (stromal == null) {
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
            if (beyond_uterus == "yes") {
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
            }
          }
          if (parametrial_involvement == "unknown") {
            if (beyond_uterus == "yes") {
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
            }
          }
        }
      }
    }
    if (hydronephrosis == "unknown") {
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
          return "TX";
        }
        if (lower_vagina == "no") {
          if (parametrial_involvement == "yes") {
            if (beyond_uterus == "no") {
              return "Invalid combination";
            }
          }
          if (parametrial_involvement == "no") {
            if (beyond_uterus == "yes") {
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
              if (clinically_visible_lesion == "no" && micro_only == "no") {
                return "T3b";
              }
            }
          }

          if (parametrial_involvement == "unknown") {
            if (beyond_uterus == "yes") {
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
            }
          }
        }
        if (lower_vagina == "unknown") {
          if (parametrial_involvement == "yes") {
            if (beyond_uterus == "no") {
              return "Invalid combination";
            }
          }
          if (
            parametrial_involvement == "no" ||
            parametrial_involvement == "unknown"
          ) {
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
          }
        }
      }
      if (pelvic_wall == "unknown") {
        if (lower_vagina == "yes") {
          if (beyond_uterus == "no") {
            return "Invalid combination";
          }
        }
        if (lower_vagina == "no") {
          if (parametrial_involvement == "yes") {
            if (beyond_uterus == "no") {
              return "Invalid combination";
            }
          }
          if (parametrial_involvement == "no") {
            if (beyond_uterus == "yes") {
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
              if (clinically_visible_lesion == "no" && micro_only == "no") {
                return "T3b";
              }
            }
          }

          if (parametrial_involvement == "unknown") {
            if (beyond_uterus == "yes") {
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
            }
          }
        }
        if (lower_vagina == "unknown") {
          if (parametrial_involvement == "yes") {
            if (beyond_uterus == "no") {
              return "Invalid combination";
            }
          }
          if (
            parametrial_involvement == "no" ||
            parametrial_involvement == "unknown"
          ) {
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
          }
        }
      }
    }
  }
  if (bladder_rectum == "unknown") {
  }

  return "TX";
};

export const getN = ({ pos_num }) => {
  if (pos_num > 0) return "N1";
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

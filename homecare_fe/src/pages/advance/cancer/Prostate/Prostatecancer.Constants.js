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
  appearance,
  extension,
  capsule_extension,
  bladder_neck_invasion,
  seminal_vesicles_invasion,
  bladder_invasion,
  external_sphincter_invasion,
  rectum_or_levator_invasion,
  pelvic_wall_invasion,
}) => {
  console.log({
    appearance,
    extension,
    capsule_extension,
    bladder_neck_invasion,
    seminal_vesicles_invasion,
    bladder_invasion,
    external_sphincter_invasion,
    rectum_or_levator_invasion,
    pelvic_wall_invasion,
  });
  if (
    pelvic_wall_invasion == "yes" ||
    rectum_or_levator_invasion == "yes" ||
    external_sphincter_invasion == "yes" ||
    bladder_invasion == "yes"
  ) {
    return "T4";
  }
  if (pelvic_wall_invasion == "no") {
    if (rectum_or_levator_invasion == "no") {
      if (external_sphincter_invasion == "no") {
        if (bladder_invasion == "no") {
          if (seminal_vesicles_invasion == "yes") {
            return "T3b";
          }
          if (seminal_vesicles_invasion == "no") {
            if (bladder_neck_invasion == "yes") {
              return "T3a";
            }

            if (bladder_neck_invasion == "no") {
              if (capsule_extension == "yes") {
                return "T3a";
              }
              if (capsule_extension == "no") {
                if (extension == "1") {
                  if (appearance == null) {
                    return "T1a";
                  }
                  if (appearance == "no") {
                    return "T1a";
                  }
                  if (appearance == "yes") {
                    return "Invalid combination";
                  }
                }
                if (extension == "2") {
                  if (appearance == null) {
                    return "T1b";
                  }
                  if (appearance == "no") {
                    return "T1b";
                  }
                  if (appearance == "yes") {
                    return "Invalid combination";
                  }
                }
                if (extension == "3") {
                  if (appearance == null) {
                    return "T1c";
                  }
                  if (appearance == "no") {
                    return "T1c";
                  }
                  if (appearance == "yes") {
                    return "Invalid combination";
                  }
                }
                if (extension == "4") {
                  if (appearance == "no") {
                    return "Invalid combination";
                  }
                  return "T2a";
                }
                if (extension == "5") {
                  if (appearance == "no") {
                    return "Invalid combination";
                  }
                  return "T2b";
                }
                if (extension == "6") {
                  if (appearance == "no") {
                    return "Invalid combination";
                  }
                  return "T2c";
                }
              }
              if (capsule_extension == "unknown") {
                if (extension == "1" || extension == "2" || extension == "3") {
                  if (appearance == "yes") {
                    return "T3a";
                  }
                }
                if (extension == "4" || extension == "5" || extension == "6") {
                  if (appearance == "no") {
                    return "T3a";
                  }
                }
              }
            }
            if (bladder_neck_invasion == "unknown") {
              if (capsule_extension == "yes") {
                return "T3a";
              }
              if (capsule_extension == "no" || capsule_extension == "unknown") {
                if (extension == "1" || extension == "2" || extension == "3") {
                  if (appearance == "yes") {
                    return "T3a";
                  }
                }
                if (extension == "4" || extension == "5" || extension == "6") {
                  if (appearance == "no") {
                    return "T3a";
                  }
                }
              }
            }
          }
          if (seminal_vesicles_invasion == "unknown") {
            if (bladder_neck_invasion == "yes") {
              return "TX";
            }
            if (bladder_neck_invasion == "no") {
              if (capsule_extension == "yes") {
              }
              if (capsule_extension == "no") {
                if (extension == "1" || extension == "2" || extension == "3") {
                  if (appearance == "yes") {
                    return "T3b";
                  }
                }
                if (extension == "4" || extension == "5" || extension == "6") {
                  if (appearance == "no") {
                    return "T3b";
                  }
                }
              }
              if (capsule_extension == "unknown") {
              }
            }
          }
        }
        if (bladder_invasion == "unknown") {
          if (seminal_vesicles_invasion == "yes") {
            return "TX";
          }

          if (seminal_vesicles_invasion == "no") {
            if (bladder_neck_invasion == "yes") {
              return "TX";
            }
            if (bladder_neck_invasion == "no") {
              if (capsule_extension == "no") {
                if (extension == "1" || extension == "2" || extension == "3") {
                  if (appearance == "yes") {
                    return "T4";
                  }
                }
                if (extension == "4" || extension == "5" || extension == "6") {
                  if (appearance == "no") {
                    return "T4";
                  }
                }
              }
            }
            if (bladder_neck_invasion == "unknown") {
              return "TX";
            }
          }

          if (seminal_vesicles_invasion == "unknown") {
            return "TX";
          }
        }
      }
      if (external_sphincter_invasion == "unknown") {
        if (bladder_invasion == "yes") {
          return "T4";
        }
        if (bladder_invasion == "no" || bladder_invasion == "unknown") {
          if (seminal_vesicles_invasion == "yes") {
            return "TX";
          }
          if (seminal_vesicles_invasion == "no") {
            if (bladder_neck_invasion == "no") {
              if (capsule_extension == "no") {
                if (extension == "1" || extension == "2" || extension == "3") {
                  if (appearance == "yes") {
                    return "T4";
                  }
                }
                if (extension == "4" || extension == "5" || extension == "6") {
                  if (appearance == "no") {
                    return "T4";
                  }
                }
              }
            }
          }
        }
      }
    }
    if (rectum_or_levator_invasion == "unknown") {
      if (seminal_vesicles_invasion == "no") {
        if (bladder_neck_invasion == "no") {
          if (capsule_extension == "no") {
            if (extension == "1" || extension == "2" || extension == "3") {
              if (appearance == "yes") {
                return "T4";
              }
            }
            if (extension == "4" || extension == "5" || extension == "6") {
              if (appearance == "no") {
                return "T4";
              }
            }
          }
        }
      }
    }
  }
  if (pelvic_wall_invasion == "unknown") {
    if (seminal_vesicles_invasion == "no") {
      if (bladder_neck_invasion == "no") {
        if (capsule_extension == "no") {
          if (extension == "1" || extension == "2" || extension == "3") {
            if (appearance == "yes") {
              return "T4";
            }
          }
          if (extension == "4" || extension == "5" || extension == "6") {
            if (appearance == "no") {
              return "T4";
            }
          }
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

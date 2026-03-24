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

export const getStage = (T, N, M, morphology, assessment_type) => {
  if (M == "M1") {
    return {
      SG: "IVB",
      SimpG: "Distant",
      range: "IVB",
      TNM: `${T}${N}${M}`,
    };
  }

  if (T == "TX") {
    if (N == "N1") {
      if (!morphology) {
        if (!assessment_type || assessment_type == "clinical")
          return {
            SG: "",
            SimpG: "Localised",
            range: "I - Not Known",
            TNM: `${T}${N}${M}`,
          };
        if (assessment_type == "pathological") {
          return {
            SG: "",
            SimpG: "Localised",
            range: "IIB - Not Known",
            TNM: `${T}${N}${M}`,
          };
        }
      }
      if (morphology == "adenocarcinoma") {
        if (assessment_type == "pathological") {
          return {
            SG: "",
            SimpG: "Localised",
            range: "IIB - Not Known",
            TNM: `${T}${N}${M}`,
          };
        }
        return {
          SG: "",
          SimpG: "Localised",
          range: "IIA - Not Known",
          TNM: `${T}${N}${M}`,
        };
      }
      if (morphology == "squamous") {
        if (assessment_type == "pathological") {
          return {
            SG: "",
            SimpG: "Localised",
            range: "IIB - Not Known",
            TNM: `${T}${N}${M}`,
          };
        }
        return {
          SG: "",
          SimpG: "Localised",
          range: "I - Not Known",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (N == "N2") {
      if (!morphology || morphology == "squamous") {
        if (assessment_type == "pathological") {
          return {
            SG: "",
            SimpG: "Localised",
            range: "IIIA - Not Known",
            TNM: `${T}${N}${M}`,
          };
        }
        return {
          SG: "",
          SimpG: "Localised",
          range: "III - Not Known",
          TNM: `${T}${N}${M}`,
        };
      }
      if (morphology == "adenocarcinoma") {
        if (assessment_type == "clinical") {
          return {
            SG: "",
            SimpG: "Localised",
            range: "IVA - Not Known",
            TNM: `${T}${N}${M}`,
          };
        }
        return {
          SG: "",
          SimpG: "Localised",
          range: "IIIA - Not Known",
          TNM: `${T}${N}${M}`,
        };
      }
    }
    if (N == "N3") {
      return {
        SG: "",
        SimpG: "Localised",
        range: "IVA - Not Known",
        TNM: `${T}${N}${M}`,
      };
    }
  }
  if (T == "T0") {
    if (N == "NX") {
      if (assessment_type == "pathological") {
        return {
          SG: "",
          SimpG: "Localised",
          range: "IVA - Not Known",
          TNM: `${T}${N}${M}`,
        };
      }
      return {
        SG: "",
        SimpG: "Localised",
        range: "0 - Not Known",
        TNM: `${T}${N}${M}`,
      };
    }
    if (N == "N3") {
      return {
        SG: "IVA",
        SimpG: "Localised",
        range: "IVA ",
        TNM: `${T}${N}${M}`,
      };
    }
  }
  if (T == "T1a") {
    if (N == "NX") {
      if (assessment_type == "pathological") {
        return {
          SG: "",
          SimpG: "Localised",
          range: "IA - Not Known",
          TNM: `${T}${N}${M}`,
        };
      }
      return {
        SG: "",
        SimpG: "Localised",
        range: "I - Not Known",
        TNM: `${T}${N}${M}`,
      };
    }
    if (N == "N1") {
      if (!morphology) {
        if (!assessment_type) {
          return {
            SG: "",
            SimpG: "Localised",
            range: "I - IIB",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "pathological") {
          return {
            SG: "IIB",
            SimpG: "Localised",
            range: "IIB",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "clinical") {
          return {
            SG: "",
            SimpG: "Localised",
            range: "I - IIA",
            TNM: `${T}${N}${M}`,
          };
        }
      }
      if (morphology == "adenocarcinoma") {
        if (!assessment_type) {
          return {
            SG: "",
            SimpG: "Localised",
            range: "IIA - IIB",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "pathological") {
          return {
            SG: "IIB",
            SimpG: "Localised",
            range: "IIB",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "clinical") {
          return {
            SG: "IIA",
            SimpG: "Localised",
            range: "IIA",
            TNM: `${T}${N}${M}`,
          };
        }
      }
      if (morphology == "squamous") {
        if (!assessment_type) {
          return {
            SG: "",
            SimpG: "Localised",
            range: "I - IIB",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "pathological") {
          return {
            SG: "IIB",
            SimpG: "Localised",
            range: "IIB",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "clinical") {
          return {
            SG: "I",
            SimpG: "Localised",
            range: "I",
            TNM: `${T}${N}${M}`,
          };
        }
      }
    }
    if (N == "N2") {
      if (!morphology) {
        if (!assessment_type) {
          return {
            SG: "",
            SimpG: "Localised",
            range: "III - IVA",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "pathological") {
          return {
            SG: "IIIA",
            SimpG: "Localised",
            range: "IIIA",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "clinical") {
          return {
            SG: "",
            SimpG: "Localised",
            range: "III - IVA",
            TNM: `${T}${N}${M}`,
          };
        }
      }
      if (morphology == "adenocarcinoma") {
        if (!assessment_type) {
          return {
            SG: "",
            SimpG: "Localised",
            range: "IIIA - IVA",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "pathological") {
          return {
            SG: "IIIA",
            SimpG: "Localised",
            range: "IIIA",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "clinical") {
          return {
            SG: "IVA",
            SimpG: "Localised",
            range: "IVA",
            TNM: `${T}${N}${M}`,
          };
        }
      }
      if (morphology == "squamous") {
        if (!assessment_type) {
          return {
            SG: "",
            SimpG: "Localised",
            range: "III - IIIA",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "pathological") {
          return {
            SG: "IIIA",
            SimpG: "Localised",
            range: "IIIA",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "clinical") {
          return {
            SG: "III",
            SimpG: "Localised",
            range: "III",
            TNM: `${T}${N}${M}`,
          };
        }
      }
    }
    if (N == "N3") {
      return {
        SG: "IVA",
        SimpG: "Localised",
        range: "IVA",
        TNM: `${T}${N}${M}`,
      };
    }
  }
  if (T == "T1b") {
    if (N == "NX") {
      if (assessment_type == "pathological") {
        return {
          SG: "",
          SimpG: "Localised",
          range: "IB - Not Known",
          TNM: `${T}${N}${M}`,
        };
      }
      return {
        SG: "",
        SimpG: "Localised",
        range: "I - Not Known",
        TNM: `${T}${N}${M}`,
      };
    }
    if (N == "N1") {
      if (!morphology) {
        if (!assessment_type) {
          return {
            SG: "",
            SimpG: "Localised",
            range: "I - IIB",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "pathological") {
          return {
            SG: "IIB",
            SimpG: "Localised",
            range: "IIB",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "clinical") {
          return {
            SG: "",
            SimpG: "Localised",
            range: "I - IIA",
            TNM: `${T}${N}${M}`,
          };
        }
      }
      if (morphology == "adenocarcinoma") {
        if (!assessment_type) {
          return {
            SG: "",
            SimpG: "Localised",
            range: "IIA - IIB",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "pathological") {
          return {
            SG: "IIB",
            SimpG: "Localised",
            range: "IIB",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "clinical") {
          return {
            SG: "IIA",
            SimpG: "Localised",
            range: "IIA",
            TNM: `${T}${N}${M}`,
          };
        }
      }
      if (morphology == "squamous") {
        if (!assessment_type) {
          return {
            SG: "",
            SimpG: "Localised",
            range: "I - IIB",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "pathological") {
          return {
            SG: "IIB",
            SimpG: "Localised",
            range: "IIB",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "clinical") {
          return {
            SG: "I",
            SimpG: "Localised",
            range: "I",
            TNM: `${T}${N}${M}`,
          };
        }
      }
    }
    if (N == "N2") {
      if (!morphology) {
        if (!assessment_type) {
          return {
            SG: "",
            SimpG: "Localised",
            range: "III - IVA",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "pathological") {
          return {
            SG: "IIIA",
            SimpG: "Localised",
            range: "IIIA",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "clinical") {
          return {
            SG: "III",
            SimpG: "Localised",
            range: "III",
            TNM: `${T}${N}${M}`,
          };
        }
      }
      if (morphology == "adenocarcinoma") {
        if (!assessment_type) {
          return {
            SG: "IIIA",
            SimpG: "Localised",
            range: "IIIA",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "pathological") {
          return {
            SG: "IIIA",
            SimpG: "Localised",
            range: "IIIA",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "clinical") {
          return {
            SG: "",
            SimpG: "",
            range: "",
            TNM: `${T}${N}${M}`,
          };
        }
      }
      if (morphology == "squamous") {
        if (!assessment_type) {
          return {
            SG: "",
            SimpG: "Localised",
            range: "III - IIIA",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "pathological") {
          return {
            SG: "IIIA",
            SimpG: "Localised",
            range: "IIIA",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "clinical") {
          return {
            SG: "III",
            SimpG: "Localised",
            range: "III",
            TNM: `${T}${N}${M}`,
          };
        }
      }
    }
    if (N == "N3") {
      return {
        SG: "IVA",
        SimpG: "Localised",
        range: "IVA",
        TNM: `${T}${N}${M}`,
      };
    }
  }
  if (T == "T2") {
    if (N == "NX") {
      if (!morphology) {
        if (!assessment_type) {
          return {
            SG: "",
            SimpG: "Localised",
            range: "II - Not Known",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "pathological") {
          return {
            SG: "",
            SimpG: "Localised",
            range: "IIA - Not Known",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "clinical") {
          return {
            SG: "",
            SimpG: "Localised",
            range: "II - Not Known",
            TNM: `${T}${N}${M}`,
          };
        }
      }
      if (morphology == "adenocarcinoma") {
        if (!assessment_type) {
          return {
            SG: "",
            SimpG: "Localised",
            range: "IIA - Not Known",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "pathological") {
          return {
            SG: "",
            SimpG: "Localised",
            range: "IIA - Not Known",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "clinical") {
          return {
            SG: "",
            SimpG: "Localised",
            range: "IIB - Not Known",
            TNM: `${T}${N}${M}`,
          };
        }
      }
      if (morphology == "squamous") {
        if (!assessment_type) {
          return {
            SG: "",
            SimpG: "Localised",
            range: "II - Not Known",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "pathological") {
          return {
            SG: "",
            SimpG: "Localised",
            range: "IIA - Not Known",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "clinical") {
          return {
            SG: "",
            SimpG: "Localised",
            range: "II - Not Known",
            TNM: `${T}${N}${M}`,
          };
        }
      }
    }
    if (N == "N1") {
      if (!morphology) {
        if (!assessment_type) {
          return {
            SG: "",
            SimpG: "Localised",
            range: "II - IIIA",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "pathological") {
          return {
            SG: "IIIA",
            SimpG: "Localised",
            range: "IIIA",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "clinical") {
          return {
            SG: "",
            SimpG: "Localised",
            range: "II - III",
            TNM: `${T}${N}${M}`,
          };
        }
      }
      if (morphology == "adenocarcinoma") {
        if (!assessment_type) {
          return {
            SG: "",
            SimpG: "Localised",
            range: "III - IIIA",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "pathological") {
          return {
            SG: "IIIA",
            SimpG: "Localised",
            range: "IIIA",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "clinical") {
          return {
            SG: "III",
            SimpG: "Localised",
            range: "III",
            TNM: `${T}${N}${M}`,
          };
        }
      }
      if (morphology == "squamous") {
        if (!assessment_type) {
          return {
            SG: "",
            SimpG: "Localised",
            range: "II - IIIA",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "pathological") {
          return {
            SG: "IIIA",
            SimpG: "Localised",
            range: "IIIA",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "clinical") {
          return {
            SG: "II",
            SimpG: "Localised",
            range: "II",
            TNM: `${T}${N}${M}`,
          };
        }
      }
    }
    if (N == "N2") {
      if (!morphology) {
        if (!assessment_type) {
          return {
            SG: "",
            SimpG: "Localised",
            range: "III - IVA",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "pathological") {
          return {
            SG: "IIIB",
            SimpG: "Localised",
            range: "IIIB",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "clinical") {
          return {
            SG: "III - IVA",
            SimpG: "Localised",
            range: "III - IVA",
            TNM: `${T}${N}${M}`,
          };
        }
      }
      if (morphology == "adenocarcinoma") {
        if (!assessment_type) {
          return {
            SG: "",
            SimpG: "Localised",
            range: "IIIB - IVA",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "pathological") {
          return {
            SG: "IIIB",
            SimpG: "Localised",
            range: "IIIB",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "clinical") {
          return {
            SG: "IVA",
            SimpG: "Localised",
            range: "IVA",
            TNM: `${T}${N}${M}`,
          };
        }
      }
      if (morphology == "squamous") {
        if (!assessment_type) {
          return {
            SG: "",
            SimpG: "Localised",
            range: "III - IIIB",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "pathological") {
          return {
            SG: "IIIB",
            SimpG: "Localised",
            range: "IIIB",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "clinical") {
          return {
            SG: "III",
            SimpG: "Localised",
            range: "III",
            TNM: `${T}${N}${M}`,
          };
        }
      }
    }
    if (N == "N3") {
      return {
        SG: "IVA",
        SimpG: "Localised",
        range: "IVA",
        TNM: `${T}${N}${M}`,
      };
    }
  }
  if (T == "T3") {
    if (N == "NX") {
      if (!morphology) {
        if (!assessment_type) {
          return {
            SG: "",
            SimpG: "Localised",
            range: "II - Not Known",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "pathological") {
          return {
            SG: "",
            SimpG: "Localised",
            range: "IIB - Not Known",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "clinical") {
          return {
            SG: "",
            SimpG: "Localised",
            range: "II - Not Known",
            TNM: `${T}${N}${M}`,
          };
        }
      }
      if (morphology == "adenocarcinoma") {
        if (!assessment_type) {
          return {
            SG: "",
            SimpG: "Localised",
            range: "IIB - Not Known",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "pathological") {
          return {
            SG: "",
            SimpG: "Localised",
            range: "IIB - Not Known",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "clinical") {
          return {
            SG: "",
            SimpG: "Localised",
            range: "III - Not Known",
            TNM: `${T}${N}${M}`,
          };
        }
      }
      if (morphology == "squamous") {
        if (!assessment_type) {
          return {
            SG: "",
            SimpG: "Localised",
            range: "II - Not Known",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "pathological") {
          return {
            SG: "",
            SimpG: "Localised",
            range: "IIB - Not Known",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "clinical") {
          return {
            SG: "",
            SimpG: "Localised",
            range: "II - Not Known",
            TNM: `${T}${N}${M}`,
          };
        }
      }
    }
    if (N == "N1") {
      if (!morphology) {
        if (!assessment_type) {
          return {
            SG: "",
            SimpG: "Localised",
            range: "II - IIIB",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "pathological") {
          return {
            SG: "IIIB",
            SimpG: "Localised",
            range: "IIIB",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "clinical") {
          return {
            SG: "III",
            SimpG: "Localised",
            range: "III",
            TNM: `${T}${N}${M}`,
          };
        }
      }
      if (morphology == "adenocarcinoma") {
        if (!assessment_type) {
          return {
            SG: "",
            SimpG: "Localised",
            range: "III - IIIB",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "pathological") {
          return {
            SG: "IIIB",
            SimpG: "Localised",
            range: "IIIB",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "clinical") {
          return {
            SG: "III",
            SimpG: "Localised",
            range: "III",
            TNM: `${T}${N}${M}`,
          };
        }
      }
      if (morphology == "squamous") {
        if (!assessment_type) {
          return {
            SG: "IIIB",
            SimpG: "Localised",
            range: "IIIB",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "pathological") {
          return {
            SG: "IIIB",
            SimpG: "Localised",
            range: "IIIB",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "clinical") {
          return {
            SG: "",
            SimpG: "",
            range: "",
            TNM: `${T}${N}${M}`,
          };
        }
      }
    }
    if (N == "N2") {
      if (!morphology) {
        if (!assessment_type) {
          return {
            SG: "",
            SimpG: "Localised",
            range: "IIIB - IVA",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "pathological") {
          return {
            SG: "IIIB",
            SimpG: "Localised",
            range: "IIIB",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "clinical") {
          return {
            SG: "IVA",
            SimpG: "Localised",
            range: "IVA",
            TNM: `${T}${N}${M}`,
          };
        }
      }
      if (morphology == "adenocarcinoma") {
        if (!assessment_type) {
          return {
            SG: "",
            SimpG: "Localised",
            range: "IIIB - IVA",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "pathological") {
          return {
            SG: "IIIB",
            SimpG: "Localised",
            range: "IIIB",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "clinical") {
          return {
            SG: "IVA",
            SimpG: "Localised",
            range: "IVA",
            TNM: `${T}${N}${M}`,
          };
        }
      }
      if (morphology == "squamous") {
        if (!assessment_type) {
          return {
            SG: "IIIB",
            SimpG: "Localised",
            range: "IIIB",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "pathological") {
          return {
            SG: "IIIB",
            SimpG: "Localised",
            range: "IIIB",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "clinical") {
          return {
            SG: "",
            SimpG: "",
            range: "",
            TNM: `${T}${N}${M}`,
          };
        }
      }
    }
    if (N == "N3") {
      return {
        SG: "IVA",
        SimpG: "Localised",
        range: "IVA",
        TNM: `${T}${N}${M}`,
      };
    }
  }
  if (T == "T4a") {
    if (N == "NX") {
      if (!morphology) {
        if (!assessment_type) {
          return {
            SG: "",
            SimpG: "Localised",
            range: "III - Not Known",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "pathological") {
          return {
            SG: "",
            SimpG: "Localised",
            range: "IIIB - Not Known",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "clinical") {
          return {
            SG: "",
            SimpG: "Localised",
            range: "III - Not Known",
            TNM: `${T}${N}${M}`,
          };
        }
      }
      if (morphology == "adenocarcinoma") {
        if (!assessment_type) {
          return {
            SG: "",
            SimpG: "Localised",
            range: "III - Not Known",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "pathological") {
          return {
            SG: "",
            SimpG: "Localised",
            range: "IIIB - Not Known",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "clinical") {
          return {
            SG: "",
            SimpG: "Localised",
            range: "III - Not Known",
            TNM: `${T}${N}${M}`,
          };
        }
      }
      if (morphology == "squamous") {
        if (!assessment_type) {
          return {
            SG: "",
            SimpG: "Localised",
            range: "IIIB - Not Known",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "pathological") {
          return {
            SG: "",
            SimpG: "Localised",
            range: "IIIB - Not Known",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "clinical") {
          return {
            SG: "",
            SimpG: "Localised",
            range: "IVA - Not Known",
            TNM: `${T}${N}${M}`,
          };
        }
      }
    }
    if (N == "N1") {
      if (!morphology) {
        if (!assessment_type) {
          return {
            SG: "",
            SimpG: "Localised",
            range: "III - IVA",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "pathological") {
          return {
            SG: "IIIB",
            SimpG: "Localised",
            range: "IIIB",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "clinical") {
          return {
            SG: "",
            SimpG: "Localised",
            range: "III - IVA",
            TNM: `${T}${N}${M}`,
          };
        }
      }
      if (morphology == "adenocarcinoma") {
        if (!assessment_type) {
          return {
            SG: "",
            SimpG: "Localised",
            range: "III - IIIB",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "pathological") {
          return {
            SG: "IIIB",
            SimpG: "Localised",
            range: "IIIB",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "clinical") {
          return {
            SG: "III",
            SimpG: "Localised",
            range: "III",
            TNM: `${T}${N}${M}`,
          };
        }
      }
      if (morphology == "squamous") {
        if (!assessment_type) {
          return {
            SG: "",
            SimpG: "Localised",
            range: "IIIB - IVA",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "pathological") {
          return {
            SG: "IIIB",
            SimpG: "Localised",
            range: "IIIB",
            TNM: `${T}${N}${M}`,
          };
        }
        if (assessment_type == "clinical") {
          return {
            SG: "IVA",
            SimpG: "Localised",
            range: "IVA",
            TNM: `${T}${N}${M}`,
          };
        }
      }
    }
    if (N == "N2") {
      return {
        SG: "IVA",
        SimpG: "Localised",
        range: "IVA",
        TNM: `${T}${N}${M}`,
      };
    }
    if (N == "N3") {
      return {
        SG: "IVA",
        SimpG: "Localised",
        range: "IVA",
        TNM: `${T}${N}${M}`,
      };
    }
  }
  if (T == "T4b") {
    if (N == "NX") {
      return {
        SG: "",
        SimpG: "Localised",
        range: "IVA - Not Known",
        TNM: `${T}${N}${M}`,
      };
    }

    return {
      SG: "IVA",
      SimpG: "Localised",
      range: "IVA",
      TNM: `${T}${N}${M}`,
    };
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

export const getN = ({ pos_num }) => {
  if (pos_num > 0 && pos_num <= 2) {
    return "N1";
  }

  if (pos_num > 2 && pos_num <= 6) {
    return "N2";
  }

  if (pos_num > 6) {
    return "N3";
  }

  return "NX";
};

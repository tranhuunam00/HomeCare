export const LIRADS_APPLICABILITY_RULES = [
  {
    id: "case_1",
    condition: (form) =>
      form.age && !form.cirrhosis && form.hepatitisB && form.priorHCC,
  },

  {
    id: "case_2",
    condition: (form) =>
      form.age && !form.cirrhosis && !form.hepatitisB && form.priorHCC,
  },

  {
    id: "case_3",
    condition: (form) =>
      form.age &&
      form.cirrhosis &&
      form.cirrhosisCause == "other" &&
      form.hepatitisB &&
      !form.priorHCC,
  },

  {
    id: "case_4",
    condition: (form) =>
      form.age &&
      form.cirrhosis &&
      form.cirrhosisCause == "other" &&
      !form.hepatitisB &&
      form.priorHCC,
  },
];

export const YES_NO_OPTIONS = [
  { label: "Có", value: true },
  { label: "Không", value: false },
];

export const GROWTH_OPTIONS = [
  { label: "Có", value: "yes" },
  { label: "Không", value: "no" },
  { label: "Không xác định", value: "na" },
];

export const MAJOR_FEATURES = [
  {
    key: "aphe",
    label: "Tăng quang thì động mạch (không dạng viền)",
    required: true,
  },
  {
    key: "washout",
    label: "Rửa thuốc không ở ngoại vi",
    required: true,
  },
  {
    key: "capsule",
    label: "Bao giả tăng quang",
    required: true,
  },
];

// lirads.logic.js

export const calculateScore = (form) => {
  const { aphe, washout, capsule, growth, size } = form;
  if (!aphe) {
    if (!washout) {
      if (!capsule) {
        if (growth == "no") {
          if (size < 10) {
            return "LI-RADS Category: LR-2 LR-2: Probably benign (16% HCC; 18% malignant).";
          }
          if (size >= 10) {
            return "LI-RADS Category: LR-3 LR-3: Intermediate probability of HCC (37% HCC; 39% malignant)";
          }
        }

        if (growth == "yes") {
          if (size < 10) {
            return "LI-RADS Category: LR-NC LR-NC: Not categorizable";
          }
          if (size >= 10) {
            return "LI-RADS Category: LR-5 LR-5: Definitely HCC";
          }
        }
        if (growth == "na") {
          return "LI-RADS Category: LR-NC LR-NC: Not categorizable";
        }
      } else {
        if (growth == "no") {
          if (size < 10) {
            return "LI-RADS Category: LR-NC LR-NC: Not categorizable";
          }
          if (size >= 10) {
            return "LI-RADS Category: LR-5 LR-5: Definitely HCC";
          }
        }

        if (growth == "yes") {
          if (size < 10) {
            return "LI-RADS Category: LR-4 LR-4: Probable HCC (74% HCC; 81% malignant)";
          }
          if (size >= 10) {
            return "LI-RADS Category: LR-5 LR-5: Definitely HCC";
          }
        }
        if (growth == "na") {
          if (size < 10) {
            return "LI-RADS Category: LR-NC LR-NC: Not categorizable";
          }
          if (size >= 10) {
            return "LI-RADS Category: LR-5 LR-5: Definitely HCC";
          }
        }
      }
    } else {
      if (!capsule) {
        if (growth == "no") {
          if (size < 10) {
            return "LI-RADS Category: LR-NC LR-NC: Not categorizable";
          }
          if (size >= 10) {
            return "LI-RADS Category: LR-5 LR-5: Definitely HCC";
          }
        }

        if (growth == "yes") {
          if (size < 10) {
            return "LI-RADS Category: LR-4 LR-4: Probable HCC (74% HCC; 81% malignant)";
          }
          if (size >= 10) {
            return "LI-RADS Category: LR-5 LR-5: Definitely HCC";
          }
        }
        if (growth == "na") {
          if (size < 10) {
            return "LI-RADS Category: LR-NC LR-NC: Not categorizable";
          }
          if (size >= 10) {
            return "LI-RADS Category: LR-5 LR-5: Definitely HCC";
          }
        }
      } else {
        if (size < 10) {
          return "LI-RADS Category: LR-4 LR-4: Probable HCC (74% HCC; 81% malignant)";
        }
        if (size >= 10) {
          return "LI-RADS Category: LR-5 LR-5: Definitely HCC";
        }
      }
    }
  } else {
    if (!washout) {
      if (!capsule) {
        if (growth == "no") {
          if (size < 10) {
            return "LI-RADS Category: LR-3 LR-3: Intermediate probability of HCC (37% HCC; 39% malignant)";
          }
          if (size >= 10) {
            return "LI-RADS Category: LR-4 LR-4: Probable HCC (74% HCC; 81% malignant)";
          }
        }

        if (growth == "yes") {
          if (size < 10) {
            return "LI-RADS Category: LR-4 LR-4: Probable HCC (74% HCC; 81% malignant)";
          }
          if (size >= 10) {
            return "LI-RADS Category: LR-5 LR-5: Definitely HCC";
          }
        }
        if (growth == "na") {
          if (size < 10) {
            return "LI-RADS Category: LR-NC LR-NC: Not categorizable";
          }
          if (size >= 10) {
            return "LI-RADS Category: LR-4 LR-4: Probable HCC (74% HCC; 81% malignant)";
          }
        }
      } else {
        if (size < 10) {
          return "LI-RADS Category: LR-4 LR-4: Probable HCC (74% HCC; 81% malignant)";
        }
        if (size >= 10) {
          return "LI-RADS Category: LR-5 LR-5: Definitely HCC";
        }
      }
    } else {
      if (size < 10) {
        return "LI-RADS Category: LR-4 LR-4: Probable HCC (74% HCC; 81% malignant)";
      }
      if (size >= 10) {
        return "LI-RADS Category: LR-5 LR-5: Definitely HCC";
      }
    }
  }
};

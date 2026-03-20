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

export const calculateScore = (form) => {
  const { aphe, washout, capsule, growth, size } = form;

  const build = (lirads, description) => ({
    lirads,
    description,
  });

  if (!aphe) {
    if (!washout) {
      if (!capsule) {
        if (growth === "no") {
          if (size < 10) {
            return build(
              "LR-2",
              "Có khả năng lành tính (16% là HCC; 18% là ác tính)",
            );
          }
          if (size >= 10) {
            return build(
              "LR-3",
              "Nguy cơ trung bình đối với HCC (37% nguy cơ HCC; 39% nguy cơ ác tính)",
            );
          }
        }

        if (growth === "yes") {
          if (size < 10) {
            return build("LR-NC", "Không thể phân loại");
          }
          if (size >= 10) {
            return build("LR-5", "Chẩn đoán xác định HCC");
          }
        }

        if (growth === "na") {
          return build("LR-NC", "Không thể phân loại");
        }
      } else {
        if (growth === "no") {
          if (size < 10) {
            return build("LR-NC", "Không thể phân loại");
          }
          if (size >= 10) {
            return build("LR-5", "Chẩn đoán xác định HCC");
          }
        }

        if (growth === "yes") {
          if (size < 10) {
            return build(
              "LR-4",
              "Nguy cơ cao đối với HCC (74% nguy cơ HCC; 81% nguy cơ ác tính)",
            );
          }
          if (size >= 10) {
            return build("LR-5", "Chẩn đoán xác định HCC");
          }
        }

        if (growth === "na") {
          if (size < 10) {
            return build("LR-NC", "Không thể phân loại");
          }
          if (size >= 10) {
            return build("LR-5", "Chẩn đoán xác định HCC");
          }
        }
      }
    } else {
      if (!capsule) {
        if (growth === "no") {
          if (size < 10) {
            return build("LR-NC", "Không thể phân loại");
          }
          if (size >= 10) {
            return build("LR-5", "Chẩn đoán xác định HCC");
          }
        }

        if (growth === "yes") {
          if (size < 10) {
            return build(
              "LR-4",
              "Nguy cơ cao đối với HCC (74% nguy cơ HCC; 81% nguy cơ ác tính)",
            );
          }
          if (size >= 10) {
            return build("LR-5", "Chẩn đoán xác định HCC");
          }
        }

        if (growth === "na") {
          if (size < 10) {
            return build("LR-NC", "Không thể phân loại");
          }
          if (size >= 10) {
            return build("LR-5", "Chẩn đoán xác định HCC");
          }
        }
      } else {
        if (size < 10) {
          return build(
            "LR-4",
            "Nguy cơ cao đối với HCC (74% nguy cơ HCC; 81% nguy cơ ác tính)",
          );
        }
        if (size >= 10) {
          return build("LR-5", "Chẩn đoán xác định HCC");
        }
      }
    }
  } else {
    if (!washout) {
      if (!capsule) {
        if (growth === "no") {
          if (size < 10) {
            return build(
              "LR-3",
              "Nguy cơ trung bình đối với HCC (37% nguy cơ HCC; 39% nguy cơ ác tính)",
            );
          }
          if (size >= 10) {
            return build(
              "LR-4",
              "Nguy cơ cao đối với HCC (74% nguy cơ HCC; 81% nguy cơ ác tính)",
            );
          }
        }

        if (growth === "yes") {
          if (size < 10) {
            return build(
              "LR-4",
              "Nguy cơ cao đối với HCC (74% nguy cơ HCC; 81% nguy cơ ác tính)",
            );
          }
          if (size >= 10) {
            return build("LR-5", "Chẩn đoán xác định HCC");
          }
        }

        if (growth === "na") {
          if (size < 10) {
            return build("LR-NC", "Không thể phân loại");
          }
          if (size >= 10) {
            return build(
              "LR-4",
              "Nguy cơ cao đối với HCC (74% nguy cơ HCC; 81% nguy cơ ác tính)",
            );
          }
        }
      } else {
        if (size < 10) {
          return build(
            "LR-4",
            "Nguy cơ cao đối với HCC (74% nguy cơ HCC; 81% nguy cơ ác tính)",
          );
        }
        if (size >= 10) {
          return build("LR-5", "Chẩn đoán xác định HCC");
        }
      }
    } else {
      if (size < 10) {
        return build(
          "LR-4",
          "Nguy cơ cao đối với HCC (74% nguy cơ HCC; 81% nguy cơ ác tính)",
        );
      }
      if (size >= 10) {
        return build("LR-5", "Chẩn đoán xác định HCC");
      }
    }
  }

  return build("LR-NC", "Không thể phân loại");
};

export const formatToList = (text) => {
  const items = text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .split("\n")
    .filter((line) => line.trim() !== "");

  return `
    <ul style="padding-left:20px; margin:0;">
      ${items.map((item) => `<li>${item.replace(/^[-•*]\s*/, "")}</li>`).join("")}
    </ul>
  `;
};

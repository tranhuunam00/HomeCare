// ======= Options & Helpers cho O-RADS (MRI) =======

export const CYST_STRUCT_WITH_SOLID_VALUE = "with_solid"; // nhớ dùng đúng value này trong CYST_STRUCTURE

export const MODALITY = [
  { label: "MRI", value: "mri" },
  { label: "Ultrasound", value: "us" }, // để sẵn, chưa triển khai
];

export const ABN_OPTIONS = [
  {
    value: "cystic",
    label: "Cystic lesion",
    img: "/product/orads/O-RADS-Unilocular-cyst-RadAide.jpg",
  },
  {
    value: "cystic_solid",
    label: "Cystic lesion with a solid* component",
    img: "/product/orads/O-RADS-solid-cystic-RadAide.jpg",
    note: "*",
  },
  {
    value: "solid",
    label: "Solid lesion **",
    img: "/product/orads/O-RADS-solid-RadAide.jpg",
    note: "**",
  },
  {
    value: "dilated_tube",
    label: "Dilated fallopian tube (without a solid lesion)",
    img: "/product/orads/radaide-orads-fallopiantube2.jpg",
  },
  {
    value: "para_ovarian",
    label: "Para-ovarian cyst",
    img: "/product/orads/radaide-orads-paraovariancyst.jpg",
  },
  {
    value: "none",
    label: "None of the above have been identified",
    img: "/product/orads/cancel-no-center-256.webp",
  },
];

export const CYST_STRUCTURE = [
  { value: "uni_no_enh", label: "Unilocular, without wall enhancement" },
  {
    value: "uni_smooth_enh",
    label: "Unilocular, with smooth wall enhancement",
  },
  { value: "multilocular", label: "Multilocular" },
];

// 5 loại dịch trong nang (đổi path ảnh theo dự án của bạn)
export const CYST_CONTENTS = [
  {
    value: "simple",
    label: "Simple fluid *",
    img: "/product/orads/O-RADS-simple-fluid-radaide.jpg",
  },
  {
    value: "hemorrhagic",
    label: "Hemorrhagic fluid **",
    img: "/product/orads/O-RADS-hemorrhagic-fluid-radaide.jpg",
  },
  {
    value: "endometrial",
    label: "Endometrial fluid †",
    img: "/product/orads/O-RADS-endometrial-fluid-radaide.jpg",
  },
  {
    value: "protein_mucin",
    label: "Proteinaceous or mucinous fluid ††",
    img: "/product/orads/O-RADS-protein-fluid-radaide.jpg",
  },
  {
    value: "lipid",
    label: "Lipid/fat §",
    img: "/product/orads/O-RADS-fat-radaide.jpg",
  },
];

export const RISK_LABEL = {
  1: "Normal Ovaries",
  2: "Almost certainly benign",
  3: "Low risk",
  4: "Intermediate risk",
  5: "High risk",
};

// === THÊM MỚI: solid component flow ===

export const DARK_T2_DWI_OPTIONS = [
  { label: "Yes", value: true },
  { label: "No", value: false },
];

export const DCE_RISK_CURVE = [
  {
    value: "low",
    label: "Low risk time* intensity curve",
    img: "/product/orads/radaide-orads-riskcurve-low.jpg", // đặt đúng đường dẫn ảnh bạn có
    note: "* Minimal/gradual increase; no plateau/shoulder",
  },
  {
    value: "intermediate",
    label: "Intermediate risk time** intensity curve",
    img: "/product/orads/radaide-orads-riskcurve-intermediate.jpg",
    note: "** Initial slope < myometrium; moderate ↑ with plateau",
  },
  {
    value: "high",
    label: "High risk time*** intensity curve",
    img: "/product/orads/radaide-orads-riskcurve-high.jpg",
    note: "*** Initial slope > myometrium; marked ↑ with plateau",
  },
  {
    value: "not_available",
    label: "DCE MRI is not available",
    img: "/product/orads/cancel-no-center-256.webp",
  },
];

export const LARGE_VOL_LIPID_OPTIONS = [
  {
    value: true,
    label: "Yes",
    img: "/product/orads/radaide-orads-solidlesion-fat.jpg",
  },
  {
    value: false,
    label: "No",
    img: "/product/orads/cancel-no-center-256.webp",
  },
];

export const NON_DCE_ENH_AT_30S = [
  {
    value: "lte_myometrium",
    label: "Less than or equal to the outer myometrium",
    img: "/product/orads/radaide-orads-lowdce.jpg",
  },
  {
    value: "gt_myometrium",
    label: "Greater than the outer myometrium",
    img: "/product/orads/radaide-orads-highdce.jpg",
  },
];

// --- Dilated fallopian tube (without a solid lesion)
export const DILATED_TUBE_WALLS = [
  { label: "Thin (<3mm)", value: "thin" },
  { label: "Thick (>3mm)", value: "thick" },
];

export const DILATED_TUBE_CONTENTS = [
  {
    value: "simple_fluid",
    label: "Simple fluid*",
    img: "/product/orads/radaide-orads-fallopian-simple.jpg", // đặt đúng path ảnh của bạn
    note: "* Fluid content that follows CSF or urine on all sequences: hyperintense on T2WI and hypointense on T1WI.",
  },
  {
    value: "non_simple_fluid",
    label: "Non-simple fluid",
    img: "/product/orads/radaide-orads-fallopian-complex.jpg", // đặt đúng path ảnh của bạn
  },
];

export const US_MODES = [
  { label: "MRI", value: "mri" },
  { label: "Ultrasound", value: "us" },
];

// Loại tổn thương ở US
export const US_LESION_TYPES = [
  {
    value: "no_lesions",
    label: "No lesions",
    img: "/product/orads/us-no-lesion.png",
  },
  {
    value: "physiologic_cyst",
    label: "Physiologic cyst: follicle* or corpus luteum**",
    img: "/product/orads/us-physiologic.png",
  },
  {
    value: "typical_extraovarian",
    label:
      "Typical benign extra-ovarian lesion: Paraovarian cyst / PIC †† / Hydrosalpinx §",
    img: "/product/orads/us-extraovarian.png",
  },
  {
    value: "typical_benign_ovarian",
    label:
      "Typical benign ovarian lesions: Typical Hemorrhagic / Dermoid / Endometrioma",
    img: "/product/orads/us-benign-ovarian.png",
  },
  {
    value: "other_ovarian",
    label: "Other ovarian lesions",
    img: "/product/orads/us-other.png",
  },
];

// 3 lựa chọn “benign ovarian”
export const US_BENIGN_OVARIAN_OPTIONS = [
  {
    value: "hemorrhagic",
    label: "Typical hemorrhagic cyst *",
    img: "/product/orads/orads-2-us-typical-hemorrhagic-cyst.webp",
  },
  {
    value: "dermoid",
    label: "Typical dermoid cyst **",
    img: "/product/orads/orads-2-us-typical-dermoid-cyst.webp",
  },
  {
    value: "endometrioma",
    label: "Typical endometrioma §",
    img: "/product/orads/orads-2-us-typical-endometrioma.webp",
  },
];

// Nhớ đảm bảo ABN_OPTIONS đã có:
// { value: "dilated_tube", label: "Dilated fallopian tube (without a solid lesion)", img: "...", note: "" },
// { value: "para_ovarian", label: "Para-ovarian cyst", img: "..."},
// { value: "none", label: "None of the above have been identified", img: "..."},

// ==== US: Other ovarian lesions ====
export const US_OTHER_COMPOSITION = [
  {
    value: "cystic_no_solid",
    label: "Cystic* lesion WITHOUT solid component(s)",
    img: "/product/orads/Cyst_1.webp",
    note: "Cystic* = with or without internal echoes or incomplete septations",
  },
  {
    value: "cystic_with_solid",
    label: "Cystic* lesion WITH solid component(s)",
    img: "/product/orads/O-RADS-cyst-with-solid-component_1.webp",
  },
  {
    value: "solid_or_solid_appearing",
    label: "Solid/Solid-appearing lesion (≥ 80% solid)",
    img: "/product/orads/o-rads-solid-lesion-1.webp",
  },
];

export const US_OTHER_CHAMBERS = [
  { value: "uni", label: "1 (i.e., unilocular)" },
  { value: "bi", label: "2 (i.e., bilocular)" },
  { value: "multi", label: "3 or more (i.e., multilocular)" },
];

export const US_OTHER_CONTOUR = [
  {
    value: "smooth",
    label: "Smooth",
    img: "/product/orads/orads-3-us-smooth-walls.webp",
  },
  {
    value: "irregular",
    label: "Irregular (i.e., not smooth)",
    img: "/product/orads/orads-4-us-irregular-walls.webp",
  },
];

export const US_OTHER_ECHO_SEPT = [
  { value: "internal_echoes", label: "Internal echoes" },
  { value: "incomplete_septations", label: "Incomplete septations" },
  { value: "both", label: "Both internal echoes and incomplete septations" },
  { value: "neither", label: "Neither" },
];

export const US_MENOPAUSAL = [
  { value: "pre", label: "Pre-menopausal" },
  { value: "post", label: "Post-menopausal" },
];

export const US_COLOR_SCORE = [
  {
    value: 1,
    label: "1 (i.e., no flow)",
    img: "/product/orads/color-doppler-1.jpg",
  },
  {
    value: 2,
    label: "2 (i.e., minimal flow)",
    img: "/product/orads/color-doppler-2.jpg",
  },
  {
    value: 3,
    label: "3 (i.e., moderate flow)",
    img: "/product/orads/color-doppler-3.jpg",
  },
  {
    value: 4,
    label: "4 (i.e., very strong flow)",
    img: "/product/orads/color-doppler-4.jpg",
  },
];

// ===== US: Other ovarian (bổ sung cho WITH solid & SOLID-appearing) =====
export const US_PAPILLARY_COUNT = [
  { value: "1_3", label: "1, 2, or 3" },
  { value: "ge4", label: "4 or more" },
  { value: "non_papillary", label: "There are non-papillary solid components" },
];

export const US_YES_NO = [
  { value: true, label: "Yes" },
  { value: false, label: "No" },
];

export const getLabelFromValue = (options, value) =>
  options.find((o) => o.value === value)?.label || "";

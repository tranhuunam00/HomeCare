// ======= Tuỳ chọn & Helper cho O-RADS (MRI/US) =======

export const CYST_STRUCT_WITH_SOLID_VALUE = "with_solid"; // giữ đúng value này nếu dùng trong CYST_STRUCTURE

export const MODALITY = [
  { label: "MRI", value: "mri" },
  { label: "Siêu âm", value: "us" },
];

export const ABN_OPTIONS = [
  {
    value: "cystic",
    label: "Tổn thương dạng nang",
    img: "/product/orads/O-RADS-Unilocular-cyst-RadAide.jpg",
  },
  {
    value: "cystic_solid",
    label: "Nang có thành phần đặc*",
    img: "/product/orads/O-RADS-solid-cystic-RadAide.jpg",
    note: "*",
  },
  {
    value: "solid",
    label: "Tổn thương đặc **",
    img: "/product/orads/O-RADS-solid-RadAide.jpg",
    note: "**",
  },
  {
    value: "dilated_tube",
    label: "Ống dẫn trứng giãn (không có thành phần đặc)",
    img: "/product/orads/radaide-orads-fallopiantube2.jpg",
  },
  {
    value: "para_ovarian",
    label: "Nang cạnh buồng trứng",
    img: "/product/orads/radaide-orads-paraovariancyst.jpg",
  },
  {
    value: "none",
    label: "Không có lựa chọn nào ở trên",
    img: "/product/orads/cancel-no-center-256.webp",
  },
];

export const CYST_STRUCTURE = [
  { value: "uni_no_enh", label: "Nang đơn thùy, KHÔNG tăng bắt thuốc thành" },
  {
    value: "uni_smooth_enh",
    label: "Nang đơn thùy, thành tăng bắt thuốc trơn láng",
  },
  { value: "multilocular", label: "Nang đa thùy" },
];

// 5 loại dịch trong nang
export const CYST_CONTENTS = [
  {
    value: "simple",
    label: "Dịch đơn thuần *",
    img: "/product/orads/O-RADS-simple-fluid-radaide.jpg",
  },
  {
    value: "hemorrhagic",
    label: "Dịch xuất huyết **",
    img: "/product/orads/O-RADS-hemorrhagic-fluid-radaide.jpg",
  },
  {
    value: "endometrial",
    label: "Dịch nội mạc tử cung †",
    img: "/product/orads/O-RADS-endometrial-fluid-radaide.jpg",
  },
  {
    value: "protein_mucin",
    label: "Dịch giàu protein hoặc nhầy ††",
    img: "/product/orads/O-RADS-protein-fluid-radaide.jpg",
  },
  {
    value: "lipid",
    label: "Mỡ §",
    img: "/product/orads/O-RADS-fat-radaide.jpg",
  },
];

export const RISK_LABEL = {
  1: "Buồng trứng bình thường",
  2: "Gần như chắc chắn lành tính",
  3: "Nguy cơ thấp",
  4: "Nguy cơ trung gian",
  5: "Nguy cơ cao",
};

// === Dòng chảy cho thành phần đặc (solid) ===
export const DARK_T2_DWI_OPTIONS = [
  { label: "Có", value: true },
  { label: "Không", value: false },
];

export const DCE_RISK_CURVE = [
  {
    value: "low",
    label: "Đường cong cường độ theo thời gian – nguy cơ thấp*",
    img: "/product/orads/radaide-orads-riskcurve-low.jpg",
    note: "* Tăng tín hiệu nhẹ/từ từ; không có vai/không plateau.",
  },
  {
    value: "intermediate",
    label: "Đường cong cường độ theo thời gian – nguy cơ trung gian**",
    img: "/product/orads/radaide-orads-riskcurve-intermediate.jpg",
    note: "** Độ dốc ban đầu < cơ tử cung; tăng vừa, có plateau.",
  },
  {
    value: "high",
    label: "Đường cong cường độ theo thời gian – nguy cơ cao***",
    img: "/product/orads/radaide-orads-riskcurve-high.jpg",
    note: "*** Độ dốc ban đầu > cơ tử cung; tăng mạnh, có plateau.",
  },
  {
    value: "not_available",
    label: "Không có DCE MRI",
    img: "/product/orads/cancel-no-center-256.webp",
  },
];

export const LARGE_VOL_LIPID_OPTIONS = [
  {
    value: true,
    label: "Có",
    img: "/product/orads/radaide-orads-solidlesion-fat.jpg",
  },
  {
    value: false,
    label: "Không",
    img: "/product/orads/cancel-no-center-256.webp",
  },
];

export const NON_DCE_ENH_AT_30S = [
  {
    value: "lte_myometrium",
    label: "≤ lớp cơ tử cung ngoài",
    img: "/product/orads/radaide-orads-lowdce.jpg",
  },
  {
    value: "gt_myometrium",
    label: "> lớp cơ tử cung ngoài",
    img: "/product/orads/radaide-orads-highdce.jpg",
  },
];

// --- Ống dẫn trứng giãn (không có thành phần đặc)
export const DILATED_TUBE_WALLS = [
  { label: "Thành mỏng (<3 mm)", value: "thin" },
  { label: "Thành dày (>3 mm)", value: "thick" },
];

export const DILATED_TUBE_CONTENTS = [
  {
    value: "simple_fluid",
    label: "Dịch đơn thuần*",
    img: "/product/orads/radaide-orads-fallopian-simple.jpg",
    note: "* Dịch giống DNT hoặc nước tiểu trên mọi chuỗi: tăng tín hiệu T2WI và giảm tín hiệu T1WI.",
  },
  {
    value: "non_simple_fluid",
    label: "Dịch không đơn thuần",
    img: "/product/orads/radaide-orads-fallopian-complex.jpg",
  },
];

// (Tuỳ chọn) Nhãn cho chế độ
export const US_MODES = [
  { label: "MRI", value: "mri" },
  { label: "Siêu âm", value: "us" },
];

// Loại tổn thương trên siêu âm
export const US_LESION_TYPES = [
  {
    value: "no_lesions",
    label: "Không có tổn thương",
    img: "/product/orads/us-no-lesion.png",
  },
  {
    value: "physiologic_cyst",
    label: "Nang sinh lý: nang noãn* hoặc hoàng thể**",
    img: "/product/orads/us-physiologic.png",
  },
  {
    value: "typical_extraovarian",
    label:
      "Lành tính ngoài buồng trứng điển hình: nang cạnh buồng trứng / nang dính phúc mạc†† / ứ dịch vòi trứng §",
    img: "/product/orads/us-extraovarian.png",
  },
  {
    value: "typical_benign_ovarian",
    label:
      "Lành tính buồng trứng điển hình: nang xuất huyết / u bì (dermoid) / endometrioma",
    img: "/product/orads/us-benign-ovarian.png",
  },
  {
    value: "other_ovarian",
    label: "Tổn thương buồng trứng khác",
    img: "/product/orads/us-other.png",
  },
];

// 3 lựa chọn “benign ovarian”
export const US_BENIGN_OVARIAN_OPTIONS = [
  {
    value: "hemorrhagic",
    label: "Nang xuất huyết điển hình *",
    img: "/product/orads/orads-2-us-typical-hemorrhagic-cyst.webp",
  },
  {
    value: "dermoid",
    label: "Nang bì (dermoid) điển hình **",
    img: "/product/orads/orads-2-us-typical-dermoid-cyst.webp",
  },
  {
    value: "endometrioma",
    label: "Endometrioma điển hình §",
    img: "/product/orads/orads-2-us-typical-endometrioma.webp",
  },
];

// ==== US: Tổn thương buồng trứng khác ====
export const US_OTHER_COMPOSITION = [
  {
    value: "cystic_no_solid",
    label: "Tổn thương dạng nang* KHÔNG có thành phần đặc",
    img: "/product/orads/Cyst_1.webp",
    note: "Nang* = có hoặc không có hồi âm trong lòng hay vách không hoàn toàn",
  },
  {
    value: "cystic_with_solid",
    label: "Tổn thương dạng nang* CÓ thành phần đặc",
    img: "/product/orads/O-RADS-cyst-with-solid-component_1.webp",
  },
  {
    value: "solid_or_solid_appearing",
    label: "Tổn thương đặc/giống đặc (≥80% đặc)",
    img: "/product/orads/o-rads-solid-lesion-1.webp",
  },
];

export const US_OTHER_CHAMBERS = [
  { value: "uni", label: "1 (tức đơn thùy)" },
  { value: "bi", label: "2 (tức hai thùy)" },
  { value: "multi", label: "3 trở lên (tức đa thùy)" },
];

export const US_OTHER_CONTOUR = [
  {
    value: "smooth",
    label: "Trơn láng",
    img: "/product/orads/orads-3-us-smooth-walls.webp",
  },
  {
    value: "irregular",
    label: "Không đều (không trơn láng)",
    img: "/product/orads/orads-4-us-irregular-walls.webp",
  },
];

export const US_OTHER_ECHO_SEPT = [
  { value: "internal_echoes", label: "Có hồi âm trong lòng" },
  { value: "incomplete_septations", label: "Vách không hoàn toàn" },
  { value: "both", label: "Cả hồi âm trong lòng và vách không hoàn toàn" },
  { value: "neither", label: "Không có" },
];

export const US_MENOPAUSAL = [
  { value: "pre", label: "Tiền mãn kinh" },
  { value: "post", label: "Hậu mãn kinh" },
];

export const US_COLOR_SCORE = [
  {
    value: 1,
    label: "1 (không tưới máu)",
    img: "/product/orads/color-doppler-1.jpg",
  },
  {
    value: 2,
    label: "2 (tưới máu tối thiểu)",
    img: "/product/orads/color-doppler-2.jpg",
  },
  {
    value: 3,
    label: "3 (tưới máu trung bình)",
    img: "/product/orads/color-doppler-3.jpg",
  },
  {
    value: 4,
    label: "4 (tưới máu rất mạnh)",
    img: "/product/orads/color-doppler-4.jpg",
  },
];

// ===== US: bổ sung cho nhánh CÓ thành phần đặc & GIỐNG đặc =====
export const US_PAPILLARY_COUNT = [
  { value: "1_3", label: "1, 2 hoặc 3" },
  { value: "ge4", label: "≥ 4" },
  { value: "non_papillary", label: "Có thành phần đặc không phải nhú" },
];

export const US_YES_NO = [
  { value: true, label: "Có" },
  { value: false, label: "Không" },
];

// Helper
export const getLabelFromValue = (options, value) =>
  options.find((o) => o.value === value)?.label || "";

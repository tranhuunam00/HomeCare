export const YES_NO_OPTIONS = [
  { label: "Yes", value: true },
  { label: "No", value: false },
];

export const DWI_ADC_OPTIONS = [
  {
    value: 1,
    label: "Normal on ADC and high b-value DWI",
    image: "/product/pirads/DWI_ADC_OPTIONS/1.png",
  },
  {
    value: 2,
    label:
      "Linear/wedge shaped hypointense on ADC and/or linear/wedge shaped hyperintense on high b-value DWI",
    image: "/product/pirads/DWI_ADC_OPTIONS/2.png",
  },
  {
    value: 3,
    label:
      "Focal (discrete and different from the background) hypointense on ADC and/or focal hyperintense on high b-value DWI (may be markedly hypointense on ADC or markedly hyperintense on high b-value DWI, but not both)",
    image: "/product/pirads/DWI_ADC_OPTIONS/3.png",
  },
  {
    value: 4,
    label:
      "Focal markedly hypontense on ADC AND markedly hyperintense on high b-value DWI AND <1.5cm in greatest dimension",
    image: "/product/pirads/DWI_ADC_OPTIONS/4.png",
  },
  {
    value: 5,
    label:
      "Focal markedly hypontense on ADC AND markedly hyperintense on high b-value DWI AND ≥1.5cm in greatest dimension or definite extraprostatic extension/invasive behavior",
    image: "/product/pirads/DWI_ADC_OPTIONS/5.png",
  },
];

export const T2w_OPTIONS = [
  {
    value: 1,
    label: "Uniform hyperintense signal intensity (i.e. normal)",
    image: "/product/pirads/T2w_OPTIONS/1.png",
  },
  {
    value: 2,
    label: "Linear or wedge-shaped hypointensity",
    image: "/product/pirads/T2w_OPTIONS/2.png",
  },
  {
    value: 3,
    label: "Diffuse mild hypointensity",
    image: "/product/pirads/T2w_OPTIONS/3.png",
  },
  {
    value: 4,
    label: "Heterogeneous signal intensity",
    image: "/product/pirads/T2w_OPTIONS/4.png",
  },
  {
    value: 5,
    label: "Non-circumscribed, rounded, moderate hypointensity",
    image: "/product/pirads/T2w_OPTIONS/5.png",
  },
  {
    value: 6,
    label:
      "Circumscribed, homogenous moderate hypointensity confined to prostate AND <1.5 cm in greatest dimension",
    image: "/product/pirads/T2w_OPTIONS/6.png",
  },
  {
    value: 7,
    label:
      "Circumscribed, homogenous moderate hypointensity confined to prostate AND ≥1.5cm in greatest dimension or definite extraprostatic extension/invasive behavior",
    image: "/product/pirads/T2w_OPTIONS/7.png",
  },
  {
    value: 8,
    label: "None of the above",
    image: "/product/pirads/none.png",
  },
];

export const getPiradsScore = (values) => {
  const { zone, dwiScore } = values;

  if (zone === "pz") {
    return dwiScore;
  }

  return null;
};

export const PIRADS_RESULT = {
  1: {
    title: "PI-RADS 1",
    desc: "Clinically significant cancer is highly unlikely to be present.",
  },
  2: {
    title: "PI-RADS 2",
    desc: "Clinically significant cancer is unlikely to be present.",
  },
  3: {
    title: "PI-RADS 3",
    desc: "The presence of clinically significant cancer is equivocal.",
  },
  4: {
    title: "PI-RADS 4",
    desc: "Clinically significant cancer is likely to be present.",
  },
  5: {
    title: "PI-RADS 5",
    desc: "Clinically significant cancer is highly likely to be present.",
  },
};

// hooks/useVietnamAddress.js
import { useEffect, useState } from "react";
import vietnamData from "../dataJson/full_json_generated_data_vn_units.json";

export default function useVietnamAddress() {
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState(null);

  // Load danh sách tỉnh
  useEffect(() => {
    const provs = vietnamData.map((item) => ({
      code: item.Code,
      name: item.Name,
    }));
    setProvinces(provs);
  }, []);

  // Load danh sách xã/phường khi chọn tỉnh
  useEffect(() => {
    if (!selectedProvince) return;
    const province = vietnamData.find((p) => p.Code === selectedProvince);
    const wardsList = province?.Wards || [];

    setWards(
      wardsList.map((w) => ({
        code: w.Code,
        name: w.Name,
      }))
    );
  }, [selectedProvince]);

  return {
    provinces,
    wards,
    selectedProvince,
    setSelectedProvince,
  };
}

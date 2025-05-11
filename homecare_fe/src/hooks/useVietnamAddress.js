// hooks/useVietnamAddress.js
import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "https://provinces.open-api.vn/api";

export default function useVietnamAddress() {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  // Load Tỉnh
  useEffect(() => {
    axios.get(`${API_BASE}/p/`).then((res) => {
      setProvinces(res.data);
    });
  }, []);

  // Load Quận khi chọn Tỉnh
  useEffect(() => {
    if (selectedProvince) {
      axios.get(`${API_BASE}/p/${selectedProvince}?depth=2`).then((res) => {
        setDistricts(res.data.districts || []);
        setWards([]); // reset xã
      });
    }
  }, [selectedProvince]);

  // Load Xã khi chọn Quận
  useEffect(() => {
    if (selectedDistrict) {
      axios.get(`${API_BASE}/d/${selectedDistrict}?depth=2`).then((res) => {
        setWards(res.data.wards || []);
      });
    }
  }, [selectedDistrict]);

  return {
    provinces,
    districts,
    wards,
    setSelectedProvince,
    setSelectedDistrict,
  };
}

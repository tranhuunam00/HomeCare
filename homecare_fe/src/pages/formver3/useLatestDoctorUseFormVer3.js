import { useEffect, useState } from "react";
import API_CALL from "../../services/axiosClient";
import { useGlobalAuth } from "../../contexts/AuthContext";

export default function useLatestDoctorUseFormVer3(
  id_patient_diagnose,
  language = null,
) {
  const { setNumberLanguageDoctorUseFormV3 } = useGlobalAuth();
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState(null);

  useEffect(() => {
    if (!id_patient_diagnose) return;

    const fetchLatest = async () => {
      try {
        setLoading(true);

        const params = {
          id_patient_diagnose,
          orderBy: "id",
          orderDir: "DESC",
          page: 1,
          limit: 20,
        };

        const res = await API_CALL.get("/doctorUseFormVer3", {
          params,
        });

        const rows = res?.data?.data?.data || [];

        const uniqueLanguages = [...new Set(rows.map((item) => item.language))];
        setNumberLanguageDoctorUseFormV3(uniqueLanguages.length);

        const filteredRows = language
          ? rows.filter((item) => item.language === language)
          : rows;

        setRecord(filteredRows.length ? filteredRows[0] : null);
      } catch (e) {
        console.error("fetch latest doctorUseFormVer3 error", e);
        setRecord(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLatest();
  }, [id_patient_diagnose, language]);

  return { loading, record };
}

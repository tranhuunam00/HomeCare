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
        if (language) {
          params.language = language;
        }

        const res = await API_CALL.get("/doctorUseFormVer3", {
          params,
        });

        const rows = res?.data?.data?.data || [];
        setRecord(rows.length ? rows[0] : null);

        const uniqueLanguages = [...new Set(rows.map((item) => item.language))];
        setNumberLanguageDoctorUseFormV3(uniqueLanguages.length);
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

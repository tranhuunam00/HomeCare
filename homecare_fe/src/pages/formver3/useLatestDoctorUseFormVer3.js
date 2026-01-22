import { useEffect, useState } from "react";
import API_CALL from "../../services/axiosClient";

export default function useLatestDoctorUseFormVer3(id_patient_diagnose) {
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState(null);

  useEffect(() => {
    if (!id_patient_diagnose) return;

    const fetchLatest = async () => {
      try {
        setLoading(true);

        const res = await API_CALL.get("/doctorUseFormVer3", {
          params: {
            id_patient_diagnose,
            orderBy: "id",
            orderDir: "DESC",
            page: 1,
            limit: 1,
          },
        });

        const rows = res?.data?.data?.data || [];
        setRecord(rows.length ? rows[0] : null);
      } catch (e) {
        console.error("fetch latest doctorUseFormVer3 error", e);
        setRecord(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLatest();
  }, [id_patient_diagnose]);

  return { loading, record };
}

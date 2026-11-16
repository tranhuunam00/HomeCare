import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { dataURLtoFile } from "../doctorUseFormVer3.utils";

export default function usePacsKeyImageReceiver({
  patientDiagnoseId,
  selectedPatientDiagnoseId,
  doctorUseFormVer3Id,
  isEditRef,
  setImageList,
}) {
  const processedKeyEventIdsRef = useRef(new Set());

  useEffect(() => {
    const handleKeyImageMessage = (data) => {
      if (!data || data.type !== "KEY_IMAGE_CAPTURED" || !isEditRef?.current) return;
      const eventKey =
        data.eventId ||
        `${data.timestamp || ""}_${data.caption || ""}_${data.dataUrl?.slice(-32) || ""}`;
      if (processedKeyEventIdsRef.current.has(eventKey)) return;
      processedKeyEventIdsRef.current.add(eventKey);
      if (processedKeyEventIdsRef.current.size > 50) {
        const firstKey = processedKeyEventIdsRef.current.values().next().value;
        processedKeyEventIdsRef.current.delete(firstKey);
      }

      const incomingId = data.patient_diagnose_id || data.patientDiagnoseId;
      const currentId = patientDiagnoseId || selectedPatientDiagnoseId || doctorUseFormVer3Id;
      if (incomingId && currentId && String(incomingId) !== String(currentId)) return;

      if (data.dataUrl) {
        try {
          const fileName = `pacs_key_${Date.now()}.png`;
          const fileObj = dataURLtoFile(data.dataUrl, fileName);
          setImageList((prev) => {
            const currentList = Array.isArray(prev) ? [...prev] : [];
            const emptyIdx = currentList.findIndex((item) => !item.url && !item.rawUrl && !item.file);
            const newItem = {
              file: fileObj,
              url: data.dataUrl,
              rawUrl: data.dataUrl,
              caption: data.caption || "Ảnh chụp PACS Viewer",
            };
            if (emptyIdx !== -1) {
              currentList[emptyIdx] = newItem;
              return [...currentList];
            }
            return [...currentList, newItem];
          });
          toast.success("Đã đồng bộ ảnh chụp từ PACS Viewer vào Hình ảnh minh họa!");
        } catch (err) {}
      }
    };

    let bc;
    try {
      bc = new BroadcastChannel("homecare_pacs_channel");
      bc.onmessage = (event) => handleKeyImageMessage(event.data);
    } catch (e) {}

    const onWindowMessage = (event) => handleKeyImageMessage(event.data);
    window.addEventListener("message", onWindowMessage);

    const onStorageChange = (e) => {
      if (e.key === "homecare_pacs_latest_key_image" && e.newValue) {
        try {
          handleKeyImageMessage(JSON.parse(e.newValue));
        } catch (err) {}
      }
    };
    window.addEventListener("storage", onStorageChange);

    return () => {
      if (bc) bc.close();
      window.removeEventListener("message", onWindowMessage);
      window.removeEventListener("storage", onStorageChange);
    };
  }, [patientDiagnoseId, selectedPatientDiagnoseId, doctorUseFormVer3Id, isEditRef, setImageList]);
}

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Form,
  Button,
  Spin,
  Alert,
  Grid,
} from "antd";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./DoctorIUseFormVer3.module.scss";
import { useGlobalAuth } from "../../../../contexts/AuthContext";
import API_CALL from "../../../../services/axiosClient";
import useVietnamAddress from "../../../../hooks/useVietnamAddress";
import usePatientDiagnoseStatus from "../../../../hooks/usePatientDiagnoseStatus";
import useConfirmAction from "../../../../hooks/useConfirmAction";
import {
  PATIENT_DIAGNOSE_STATUS_CODE,
  USER_ROLE,
} from "../../../../constant/app";
import FormActionBar, {
  KEY_ACTION_BUTTON,
} from "../../../formver2/component/FormActionBar.jsx";
import {
  buildFormDataDoctorUseFormVer3,
  LANGUAGE_OPTIONS,
} from "../../formver3.constant";
import { translateLabel } from "../../../../constant/translate.report";
import AdvancedSampleSection from "../../components/AdvancedSampleSection";
import ImagingDiagnosisSection from "../../components/ImagingDiagnosisSection";
import { handlePrint } from "../../../formver2/utils.js";
import useLatestDoctorUseFormVer3 from "../../useLatestDoctorUseFormVer3.js";

import CaseDoctorsSection from "../components/CaseDoctorsSection";
import ProcedureSection from "../components/ProcedureSection";
import ImagingFindingsSection from "../components/ImagingFindingsSection";
import IllustrativeImagesSection from "../components/IllustrativeImagesSection";
import DoctorFormModals from "../components/DoctorFormModals";
import useDoctorFormHotkeys from "../hooks/useDoctorFormHotkeys";
import useDoctorFormData from "../hooks/useDoctorFormData";
import usePacsKeyImageReceiver from "../hooks/usePacsKeyImageReceiver";

export default function DoctorUseDFormVer3({
  onFormChange,
  isUse = false,
  doctorUseFormVer3Id,
  onStatusChange,
  onOpenConsultation,
  initEditMode = false,
}) {
  const [form] = Form.useForm();
  const {
    examParts,
    templateServices,
    doctor,
    user,
    setExamParts,
    setTemplateServices,
    selectedPatientDiagnose,
    setSelectedPatientDiagnose,
    previewOpen,
    setPreviewOpen,
    languageTranslate,
    setLanguageTransslate,
  } = useGlobalAuth();

  const printSourceRef = useRef(null);
  const printRef = useRef(null);
  const { transitionStatus } = usePatientDiagnoseStatus();
  const { confirmState, openConfirm } = useConfirmAction();
  const screens = Grid.useBreakpoint();
  const isMobile = screens.md === false;

  const [reloading, setReloading] = useState(false);
  const [signModalOpen, setSignModalOpen] = useState(false);
  const { setSelectedProvince } = useVietnamAddress();
  const { is_print } = useParams();

  const {
    loading,
    setLoading,
    idEdit,
    setIdEdit,
    patientDiagnose,
    setPatientDiagnose,
    imageList,
    setImageList,
    filteredFormVer3Names,
    imagingRows,
    setImagingRows,
    imagingMode,
    setImagingMode,
    fastSonoData,
    setFastSonoData,
    isFreeText,
    setIsFreeText,
    freeTextContent,
    setFreeTextContent,
    formVer3,
    setFormVer3,
    printTemplateList,
    setPrintTemplateList,
    printTemplate,
    setPrintTemplate,
    selectedIDs,
    setSelectedIDs,
    initialSnap,
    setInitialSnap,
    handleFormVer3Select,
  } = useDoctorFormData({
    form,
    selectedPatientDiagnose,
    doctorUseFormVer3Id,
    languageTranslate,
    setLanguageTransslate,
    setSelectedProvince,
  });

  const [diagnosisSummary, setDiagnosisSummary] = useState(
    form.getFieldValue("imagingDiagnosisSummary")
  );

  // BE (GET /patient-diagnose/:id) trả về association theo alias Sequelize
  const readingDoctor =
    patientDiagnose?.id_doctor_in_processing_doctor || patientDiagnose?.reading_doctor || null;
  const consultingDoctor =
    patientDiagnose?.id_consulting_doctor_doctor || patientDiagnose?.consulting_doctor || null;
  const verifyDoctor =
    patientDiagnose?.id_verify_doctor_doctor || patientDiagnose?.verify_doctor || null;

  const inProcessingDoctorId =
    readingDoctor?.id || patientDiagnose?.id_doctor_in_processing || null;
  const inProcessingDoctorName = readingDoctor?.full_name || readingDoctor?.username || "khác";

  const isCurrentDoctorInProcessing = useMemo(() => {
    if (!inProcessingDoctorId) return true;
    const currentDocId = doctor?.id || user?.id_doctor;
    return Boolean(currentDocId && Number(currentDocId) === Number(inProcessingDoctorId));
  }, [inProcessingDoctorId, doctor?.id, user?.id_doctor]);

  const isAdminOrSuper = useMemo(() => {
    const roleId = user?.id_role || user?.role_id;
    return roleId === USER_ROLE.ADMIN || roleId === USER_ROLE.SUPER_ADMIN;
  }, [user]);

  const hasReadingPermission = isCurrentDoctorInProcessing || isAdminOrSuper;

  const { record } = useLatestDoctorUseFormVer3(
    selectedPatientDiagnose?.id,
    languageTranslate
  );

  useEffect(() => {
    if (record?.id && record?.id != idEdit) {
      setIdEdit(record.id);
    }
  }, [record?.id, idEdit, setIdEdit]);

  const isEditRef = useRef(false);
  const pendingAction = useRef(null);
  const [isEdit, setIsEdit] = useState(hasReadingPermission ? initEditMode || !idEdit : false);

  useEffect(() => {
    isEditRef.current = isEdit;
  }, [isEdit]);

  useEffect(() => {
    if (!hasReadingPermission) {
      setIsEdit(false);
    } else {
      setIsEdit(initEditMode || !idEdit);
    }
  }, [initEditMode, idEdit, hasReadingPermission]);

  usePacsKeyImageReceiver({
    patientDiagnoseId: patientDiagnose?.id,
    selectedPatientDiagnoseId: selectedPatientDiagnose?.id,
    doctorUseFormVer3Id,
    isEditRef,
    setImageList,
  });

  const handleDocXong = () => {
    if (!patientDiagnose?.id) return;
    if (!hasReadingPermission) {
      toast.error(`Bạn không có quyền chuyển trạng thái ca này vì do Bác sĩ ${inProcessingDoctorName} phụ trách đọc.`);
      return;
    }

    if (isEdit) {
      openConfirm({
        title: "Xác nhận đọc xong [Alt+D]",
        message: "Hệ thống sẽ TỰ ĐỘNG LƯU kết quả chẩn đoán và chuyển sang trạng thái ĐỌC XONG. Bạn có muốn tiếp tục?",
        onConfirm: () => {
          pendingAction.current = "SAVE_THEN_READ_DONE";
          form.submit();
        },
      });
    } else {
      openConfirm({
        title: "Xác nhận đọc xong [Alt+D]",
        message: "Bạn có chắc muốn chuyển ca này sang trạng thái ĐỌC XONG?",
        onConfirm: () =>
          transitionStatus({
            patientDiagnoseId: patientDiagnose.id,
            newStatus: PATIENT_DIAGNOSE_STATUS_CODE.READ_DONE,
            successMessage: "Đã chuyển sang trạng thái ĐỌC XONG",
            localSetState: setPatientDiagnose,
            onStatusChange,
          }),
      });
    }
  };

  useDoctorFormHotkeys({
    onSave: () => {
      if (!hasReadingPermission) {
        toast.error(`Bạn không có quyền chỉnh sửa ca này vì do Bác sĩ ${inProcessingDoctorName} phụ trách đọc.`);
        return;
      }
      if (!isEditRef.current) {
        setIsEdit(true);
        toast.info("Đã bật chế độ chỉnh sửa");
        return;
      }
      pendingAction.current = KEY_ACTION_BUTTON.save;
      form.submit();
    },
    onReadDone: () => {
      if (!hasReadingPermission) {
        toast.error(`Bạn không có quyền chuyển trạng thái ca này vì do Bác sĩ ${inProcessingDoctorName} phụ trách đọc.`);
        return;
      }
      handleDocXong();
    },
    onTogglePreview: () => setPreviewOpen((prev) => !prev),
    onClosePreview: () => setPreviewOpen(false),
    isPreviewOpen: previewOpen,
  });

  const filteredExamParts = useMemo(() => {
    if (!selectedIDs.id_template_service) return [];
    return (examParts || []).filter((p) => Number(p.id_template_service) === Number(selectedIDs.id_template_service));
  }, [examParts, selectedIDs]);

  const onFinish = async (values) => {
    try {
      let imageDescriptionJson = undefined;
      if (imagingMode === "FAST_SONO") {
        imageDescriptionJson = JSON.stringify({
          isFreeText: true,
          isFastSono: true,
          text: freeTextContent,
          fastSonoData: {
            ...fastSonoData,
            isManualEdited: Boolean(fastSonoData?.isManualEdited),
            plainNarrative: fastSonoData?.plainNarrative || "",
            abnormalCodes: fastSonoData?.abnormalCodes || [],
            conclusionSummary: diagnosisSummary || form.getFieldValue("imagingDiagnosisSummary") || "",
          },
        });
      } else if (imagingMode === "FREE_TEXT") {
        imageDescriptionJson = JSON.stringify({ isFreeText: true, text: freeTextContent });
      }

      const formPayload = buildFormDataDoctorUseFormVer3(values, {
        id_patient_diagnose: patientDiagnose?.id,
        imageList,
        formVer3,
        imagingRows: isFreeText ? undefined : imagingRows,
        abnormalFindings: [],
        imageDescriptionJson,
      });

      const currentAction = pendingAction.current;
      if (
        currentAction === KEY_ACTION_BUTTON.save ||
        currentAction === KEY_ACTION_BUTTON.save_duyet ||
        currentAction === "SAVE_THEN_READ_DONE"
      ) {
        const res = await API_CALL.postForm(`/doctorUseFormVer3`, formPayload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const newData = res?.data?.data || res?.data;

        if (newData?.id) {
          toast.success("Lưu thành công");
          setIdEdit(newData.id);
          setIsEdit(false);
          setInitialSnap({ formValues: form.getFieldsValue(), apiData: newData });

          if (currentAction === "SAVE_THEN_READ_DONE") {
            await transitionStatus({
              patientDiagnoseId: patientDiagnose.id,
              newStatus: PATIENT_DIAGNOSE_STATUS_CODE.READ_DONE,
              successMessage: "Đã lưu kết quả và chuyển sang trạng thái ĐỌC XONG thành công!",
              localSetState: setPatientDiagnose,
              onStatusChange,
            });
          }
        } else {
          toast.warning("Lưu thành công nhưng không nhận được ID");
        }
      }
    } catch (error) {
      toast.error(error.message || error);
    } finally {
      setLoading(false);
      pendingAction.current = null;
    }
  };

  const onApprove = async () => {
    if (isEdit) {
      toast.warning("Vui lòng lưu lại trước khi phê duyệt");
      return;
    }
    await transitionStatus({
      patientDiagnoseId: patientDiagnose.id,
      newStatus: PATIENT_DIAGNOSE_STATUS_CODE.VERIFIED,
      confirmMessage: "Bạn có chắc chắn muốn phê duyệt kết quả này không?",
      successMessage: "Phê duyệt kết quả thành công",
      localSetState: setPatientDiagnose,
      onStatusChange,
    });
  };

  return (
    <div
      className={styles.doctorFormWrap}
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: isMobile ? "4px 4px 100px" : "30px 0 250px",
      }}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin />
        </div>
      ) : (
        <Form
          form={form}
          size="small"
          layout="vertical"
          colon={false}
          onFinish={onFinish}
          scrollToFirstError={{ behavior: "smooth", block: "center" }}
          onFinishFailed={({ errorFields }) => {
            pendingAction.current = null;
            const msgs = (errorFields || [])
              .map((f) => f.errors?.[0])
              .filter(Boolean);
            toast.error(
              msgs.length
                ? `Chưa lưu được, thiếu thông tin: ${msgs.join("; ")}`
                : "Chưa lưu được, vui lòng kiểm tra lại các trường bắt buộc"
            );
          }}
          requiredMark={(label, { required }) =>
            required ? (
              <span>
                {label}
                <span style={{ color: "red", marginLeft: 4 }}>*</span>
              </span>
            ) : (
              label
            )
          }
          initialValues={{
            language: "vi",
            doctor_name: doctor?.full_name,
            benh_nhan_quoc_tich: "Việt Nam",
          }}
          onValuesChange={(_, allValues) => onFormChange?.(allValues)}
        >
          {!hasReadingPermission && inProcessingDoctorId && (
            <Alert
              type="warning"
              showIcon
              banner
              message={
                <span style={{ fontWeight: 600, fontSize: 13 }}>
                  CHẾ ĐỘ XEM: Ca bệnh này đang được phụ trách bởi {inProcessingDoctorName}
                </span>
              }
              description={
                <span style={{ fontSize: 12 }}>
                  Theo quy định chuyên môn, chỉ Bác sĩ được phân công phụ trách đọc (<strong>{inProcessingDoctorName}</strong>) hoặc Quản trị viên mới có quyền nhập kết quả, sửa đọc hoặc chuyển trạng thái của ca này.
                </span>
              }
              style={{ marginBottom: 16, borderRadius: 8, border: "1px solid #ffd591", background: "#fffbe6" }}
            />
          )}

          <CaseDoctorsSection
            readingDoctor={readingDoctor}
            consultingDoctor={consultingDoctor}
            verifyDoctor={verifyDoctor}
          />

          <ProcedureSection
            form={form}
            isEdit={isEdit}
            patientDiagnose={selectedPatientDiagnose}
            templateServices={templateServices}
            filteredExamParts={filteredExamParts}
            filteredFormVer3Names={filteredFormVer3Names}
            selectedIDs={selectedIDs}
            setSelectedIDs={setSelectedIDs}
            printTemplateList={printTemplateList}
            setPrintTemplate={setPrintTemplate}
            languageTranslate={languageTranslate}
            translateLabel={translateLabel}
            idEdit={idEdit}
            LANGUAGE_OPTIONS={LANGUAGE_OPTIONS}
            onReloadTemplateAndExamPart={async () => {
              try {
                setReloading(true);
                const [tsRes, epRes] = await Promise.all([
                  API_CALL.get("/ts", { params: { page: 1, limit: 1000 } }),
                  API_CALL.get("/ts/exam-parts", { params: { page: 1, limit: 1000 } }),
                ]);
                setTemplateServices(tsRes.data.data.data || []);
                setExamParts(epRes.data.data.data || []);
                toast.success("Đã tải lại Phân hệ & Bộ phận");
              } catch (e) {
                toast.error("Không thể tải lại");
              } finally {
                setReloading(false);
              }
            }}
            reloading={reloading}
            onFormVer3Select={handleFormVer3Select}
          />

          {/* Tiêm thuốc đối quang đặt trên phần mô tả hình ảnh */}
          <AdvancedSampleSection
            form={form}
            isEdit={isEdit}
            selectedPatientDiagnose={selectedPatientDiagnose}
          />

          <ImagingFindingsSection
            isEdit={isEdit}
            imagingMode={imagingMode}
            setImagingMode={setImagingMode}
            fastSonoData={fastSonoData}
            setFastSonoData={setFastSonoData}
            isFreeText={isFreeText}
            setIsFreeText={setIsFreeText}
            freeTextContent={freeTextContent}
            setFreeTextContent={setFreeTextContent}
            imagingRows={imagingRows}
            setImagingRows={setImagingRows}
            form={form}
            setDiagnosisSummary={setDiagnosisSummary}
          />

          <ImagingDiagnosisSection
            form={form}
            isEdit={isEdit}
            languageTranslate={languageTranslate}
            diagnosisSummary={diagnosisSummary}
            setDiagnosisSummary={setDiagnosisSummary}
          />

          {/* Hình ảnh minh họa đặt ở cuối form */}
          <IllustrativeImagesSection
            imageList={imageList}
            setImageList={setImageList}
            isEdit={isEdit}
            isMobile={isMobile}
            patientDiagnose={patientDiagnose}
            selectedPatientDiagnose={selectedPatientDiagnose}
            languageTranslate={languageTranslate}
            translateLabel={translateLabel}
          />

          <FormActionBar
            isEdit={isEdit}
            onEdit={() => {
              if (!hasReadingPermission) {
                toast.error(`Bạn không có quyền sửa ca này vì do Bác sĩ ${inProcessingDoctorName} phụ trách đọc.`);
                return;
              }
              setIsEdit(true);
            }}
            onCancel={() => setIsEdit(false)}
            onSave={() => {
              pendingAction.current = KEY_ACTION_BUTTON.save;
              form.submit();
            }}
            onReadDone={handleDocXong}
            onApprove={onApprove}
            patientDiagnose={patientDiagnose}
            doctor={doctor}
            onOpenSignModal={() => setSignModalOpen(true)}
            onOpenConsultation={onOpenConsultation}
            onStatusChange={onStatusChange}
            setPatientDiagnose={setPatientDiagnose}
            onOpenPreview={() => setPreviewOpen(true)}
          />
        </Form>
      )}

      <DoctorFormModals
        patientDiagnose={patientDiagnose}
        idEdit={idEdit}
        formValues={form.getFieldsValue()}
        imageList={imageList}
        imagingRows={imagingRows}
        isFreeText={isFreeText}
        freeTextContent={freeTextContent}
        printTemplate={printTemplate}
        printTemplateList={printTemplateList}
        setPrintTemplate={setPrintTemplate}
        previewOpen={previewOpen}
        setPreviewOpen={setPreviewOpen}
        onPrint={() => handlePrint(printSourceRef.current)}
        signModalOpen={signModalOpen}
        setSignModalOpen={setSignModalOpen}
        confirmState={confirmState}
        openConfirm={openConfirm}
        languageTranslate={languageTranslate}
        printSourceRef={printSourceRef}
        printRef={printRef}
        handlePrint={handlePrint}
        form={form}
        initialSnap={initialSnap}
        examParts={examParts}
        templateServices={templateServices}
        isMobile={isMobile}
        is_print={is_print}
      />
    </div>
  );
}

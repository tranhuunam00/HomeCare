import React, { useState, useRef, useEffect } from "react";
import {
  Select,
  InputNumber,
  Button,
  Card,
  Row,
  Col,
  Radio,
  Divider,
  Form,
  Spin,
  Modal,
} from "antd";
import { BUNG_STRUCTURE_OPTIONS } from "./bung.constants";
import API_CALL from "../../../../services/axiosClient";
import { toast } from "react-toastify";
import { TUYEN_GIAP_STRUCTURE_OPTIONS } from "../tuyengiap/tuyengiap.constants";
import { TUYEN_VU_STRUCTURE_OPTIONS } from "../tuyenvu/tuyenvu.constants";
import {
  TRANSLATE_LANGUAGE,
  translateLabel,
  USER_ROLE,
} from "../../../../constant/app";
import useVietnamAddress from "../../../../hooks/useVietnamAddress";
import PatientInfoSection from "../../../doctor_use_form_ver2/use/items/PatientInfoForm";
import FormActionBar, {
  KEY_ACTION_BUTTON,
} from "../../../formver2/component/FormActionBar";
import { useGlobalAuth } from "../../../../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import PreviewSono from "../../preview/PreviewSono";

export const SONO_STATUS = {
  PENDING: "draft",
  APPROVED: "approved",
};

const FIELD1_OPTIONS = [
  "Bụng tổng quát",
  "Tuyến giáp và vùng cổ",
  "Tuyến vú và hố nách",
];

const UltrasoundBungForm = () => {
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const { doctor, user, printTemplateGlobal } = useGlobalAuth();

  const { id } = useParams();

  const [idEdit, setIdEdit] = useState(id);

  const [field1, setField1] = useState(null);
  const [rows, setRows] = useState([]);

  const [loadingAI, setLoadingAI] = useState(false);
  const [list, setList] = useState([]);
  const [voiceList, setVoiceList] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const [openPreview, setOpenPreview] = useState(false);

  const [isEdit, setIsEdit] = useState(true);

  const [languageTranslate, setLanguageTransslate] = useState(
    TRANSLATE_LANGUAGE.VI
  );

  const [printTemplate, setPrintTemplate] = useState(null);

  const { provinces, wards, setSelectedProvince } = useVietnamAddress();

  const [initialSnap, setInitialSnap] = useState({});

  const mapSonoDataToForm = (data) => {
    let parsed = {};
    try {
      parsed = JSON.parse(data.ket_qua_chan_doan || "{}");
    } catch (e) {
      console.error("Không parse được JSON ket_qua_chan_doan:", e);
    }

    if (!data || Object.keys(data).length == 0) {
      form.resetFields();
    }
    // Gán dữ liệu vào form
    form.setFieldsValue({
      ...data,
      id_print_template: data.id_print_template,
    });

    const printT = printTemplateGlobal.find(
      (t) => t.id == data.id_print_template
    );
    console.log("printTemplateGlobal", printTemplateGlobal);
    console.log("data.id_print_template", data.id_print_template);
    console.log("first", printT);
    // Update state
    setList(parsed.list || []);
    setField1(parsed.field1 || null);
    setRows(parsed.rows || []);
    setPrintTemplate(printT);
  };
  useEffect(() => {
    const printT = printTemplateGlobal.find(
      (t) => t.id == initialSnap.id_print_template
    );
    setPrintTemplate(printT);
  }, [printTemplateGlobal]);

  useEffect(() => {
    if (!id) return; // không có id thì bỏ qua

    const fetchDetail = async () => {
      try {
        setLoadingAI(true);

        const res = await API_CALL.get(`/sono/${id}`);
        const data = res.data.data.data;

        setInitialSnap(data);

        mapSonoDataToForm(data);
      } catch (error) {
        console.error(error);
        toast.error("Không tải được chi tiết phiếu siêu âm!");
      } finally {
        setLoadingAI(false);
      }
    };

    fetchDetail();
  }, [idEdit]);

  if (!recognitionRef.current && "webkitSpeechRecognition" in window) {
    const recog = new window.webkitSpeechRecognition();
    recog.continuous = true;
    recog.interimResults = false;
    recog.lang = "vi-VN";
    recognitionRef.current = recog;
  }

  // ---------- VOICE ----------
  const startVoice = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      toast.error("Trình duyệt không hỗ trợ giọng nói");
      return;
    }
    setIsRecording(true);
    setVoiceList([]);
    recognition.start();

    recognition.onresult = (event) => {
      const text = event.results[event.results.length - 1][0].transcript;
      setVoiceList((prev) => [...prev, text]);
    };
  };

  const stopVoice = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    recognition.stop();
    setIsRecording(false);
  };

  const analyzeVoice = async () => {
    if (voiceList.length === 0) return toast.warning("Chưa có nội dung!");

    const finalText = voiceList.join(". ");

    try {
      setLoadingAI(true);
      toast.loading("Đang phân tích giọng nói...", 1);

      const res = await API_CALL.post(
        "/sono/analyze",
        { text: finalText },
        { timeout: 120000 }
      );

      const aiData = res.data?.data?.data || res.data?.data;

      const mapped = aiData.map((item) => ({
        structure: item.structure,
        status: item.status,
        position: item.position,
        size: item.size ? `${item.size} mm` : null,
        text: `${item.structure} – ${item.status} – ${item.position}${
          item.size ? ` – (${item.size} mm)` : ""
        }`,
      }));

      setList((prev) => [...prev, ...mapped]);
      toast.success("Phân tích AI thành công!");
    } catch {
      toast.error("AI không phân tích được!");
    } finally {
      setLoadingAI(false);
    }
  };

  // ⭐ Khi chọn Field1 → auto tạo một hàng cho mỗi cấu trúc
  const handleField1Change = (val) => {
    setField1(val);

    const STRUCT =
      val === FIELD1_OPTIONS[0]
        ? BUNG_STRUCTURE_OPTIONS
        : val === FIELD1_OPTIONS[1]
        ? TUYEN_GIAP_STRUCTURE_OPTIONS
        : TUYEN_VU_STRUCTURE_OPTIONS;

    // auto create: mỗi cấu trúc 1 hàng
    const baseRows = Object.keys(STRUCT).map((k) => ({
      structure: k,
      status: "Không thấy bất thường",
      position: null,
      size: null,
    }));

    setRows(baseRows);
  };

  // ⭐ Thêm hàng mới (field2 = chọn thủ công)
  const addRow = () => {
    setRows([
      ...rows,
      {
        structure: null,
        status: "Không thấy bất thường",
        position: null,
        size: null,
      },
    ]);
  };

  // ⭐ Thêm từng hàng vào danh sách
  const handleAddItem = (row) => {
    if (!row.structure) return toast.warning("Chọn cấu trúc!");

    if (row.status !== "Không thấy bất thường" && !row.position)
      return toast.warning("Thiếu vị trí!");

    const item = {
      field1,
      structure: row.structure,
      status: row.status,
      position: row.position,
      size: row.size ? `${row.size} mm` : null,
      text: `${field1} – ${row.structure} – ${row.status}${
        row.position ? " – " + row.position : ""
      }${row.size ? ` – (${row.size} mm)` : ""}`,
    };

    setList((prev) => [...prev, item]);
    toast.success("Đã thêm!");
  };

  const handleSave = async (status = SONO_STATUS.PENDING) => {
    try {
      console.log("status", status);
      if (list.length === 0) {
        toast.warning("Bạn chưa thêm mô tả siêu âm nào!");
        return;
      }
      setLoadingAI(true);
      const values = await form.validateFields();

      // ⭐ Lấy toàn bộ thông tin bệnh nhân
      const payload = {
        ...values,
        status: status,
        ket_qua_chan_doan: JSON.stringify({
          list,
          field1,
          rows,
        }),
        id: idEdit,
      };
      console.log("payload", payload);

      const res = await API_CALL.post("/sono", payload);

      if (status == SONO_STATUS.APPROVED) {
        setInitialSnap({});
        setIdEdit(null);
        navigate(`/home/sono/bung`);

        return;
      }
      setInitialSnap(res.data.data.data);
      const newId = +res.data.data.data.id;
      setIdEdit(newId);
      toast.success("Lưu thành công!");
      navigate(`/home/sono/bung/${newId}`);
    } catch (err) {
      console.error(err);
      toast.error("Lưu thất bại!");
    } finally {
      setLoadingAI(false);
    }
  };

  const STRUCT =
    field1 === FIELD1_OPTIONS[0]
      ? BUNG_STRUCTURE_OPTIONS
      : field1 === FIELD1_OPTIONS[1]
      ? TUYEN_GIAP_STRUCTURE_OPTIONS
      : TUYEN_VU_STRUCTURE_OPTIONS;

  return (
    <Form
      form={form}
      layout="horizontal"
      labelAlign="left"
      labelCol={{ flex: "0 0 180px" }}
      wrapperCol={{ flex: "1 0 0" }}
      colon={false}
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
    >
      <Card title="Mô tả hình ảnh siêu âm">
        <PatientInfoSection
          form={form}
          isEdit={isEdit}
          languageTranslate={languageTranslate}
          provinces={provinces}
          wards={wards}
          setSelectedProvince={setSelectedProvince}
          translateLabel={translateLabel}
        />

        <Row gutter={16} style={{ marginBottom: 24 }}>
          {/* Cột 1: Mẫu in */}

          {/* Cột 2: Field 1 */}
          <Col span={12}>
            <label
              style={{ fontWeight: 600, display: "block", marginBottom: 6 }}
            >
              Field 1 – Vùng khảo sát
            </label>

            <Radio.Group
              value={field1}
              onChange={(e) => handleField1Change(e.target.value)}
              style={{ marginLeft: 0 }}
            >
              {FIELD1_OPTIONS.map((o) => (
                <Radio.Button key={o} value={o}>
                  {o}
                </Radio.Button>
              ))}
            </Radio.Group>
          </Col>
          <Col span={12}>
            <Form.Item
              label={translateLabel(languageTranslate, "resultPrint", false)}
              name="id_print_template"
              rules={[{ required: true, message: "Chọn mẫu in" }]}
              labelCol={{ flex: "0 0 150px" }} // thu nhỏ label để vừa hàng
            >
              <Select
                disabled={!isEdit}
                showSearch
                allowClear
                style={{ width: "100%" }}
                placeholder="Chọn mẫu in"
                optionFilterProp="children"
                onChange={(val) => {
                  const printT = printTemplateGlobal.find((t) => t.id == val);
                  setPrintTemplate(printT);
                  form.setFieldsValue({ id_print_template: printT?.id });
                }}
                filterOption={(input, option) =>
                  option?.children?.toLowerCase()?.includes(input.toLowerCase())
                }
              >
                {printTemplateGlobal.map((tpl) => (
                  <Option key={tpl.id} value={tpl.id}>
                    {tpl.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {!field1 && (
          <div style={{ marginTop: 32, textAlign: "center" }}>
            <img
              src="/images/sono_start.png"
              style={{ maxWidth: 260, opacity: 0.7 }}
            />
            <p>
              <i>Vui lòng chọn vùng khảo sát để bắt đầu.</i>
            </p>
          </div>
        )}

        {field1 && (
          <>
            {/* ⭐ LIST ROWS */}
            {rows.map((row, index) => {
              const statusOptions = row.structure
                ? STRUCT[row.structure].status
                : [];

              const positionOptions = row.structure
                ? STRUCT[row.structure].position
                : [];

              const needSize =
                row.structure &&
                STRUCT[row.structure].needSize.includes(row.status);

              return (
                <Spin spinning={loadingAI}>
                  <Card
                    key={index}
                    size="small"
                    style={{ marginBottom: 16, background: "#fafafa" }}
                  >
                    <Row gutter={12}>
                      {/* FIELD 2 */}
                      <Col xs={24} md={5}>
                        {index === 0 && <b>Cấu trúc</b>}
                        <Select
                          style={{ width: "100%", marginTop: 4 }}
                          placeholder="Chọn"
                          value={row.structure}
                          options={Object.keys(STRUCT).map((s) => ({
                            label: s,
                            value: s,
                          }))}
                          onChange={(v) => {
                            const updated = [...rows];
                            updated[index].structure = v;
                            updated[index].status = "Không thấy bất thường";
                            updated[index].position = null;
                            updated[index].size = null;
                            setRows(updated);
                          }}
                        />
                      </Col>

                      {/* FIELD 3 */}
                      <Col xs={24} md={5}>
                        {index === 0 && <b>Trạng thái</b>}
                        <Select
                          style={{ width: "100%", marginTop: 4 }}
                          value={row.status}
                          disabled={!row.structure}
                          options={statusOptions.map((s) => ({
                            label: s,
                            value: s,
                          }))}
                          onChange={(v) => {
                            const updated = [...rows];
                            updated[index].status = v;
                            updated[index].position = null;
                            updated[index].size = null;
                            setRows(updated);
                          }}
                        />
                      </Col>

                      {/* FIELD 4 */}
                      <Col xs={24} md={5}>
                        {index === 0 && <b>Vị trí</b>}
                        <Select
                          style={{ width: "100%", marginTop: 4 }}
                          placeholder="Chọn"
                          disabled={row.status === "Không thấy bất thường"}
                          value={row.position}
                          options={positionOptions.map((p) => ({
                            label: p,
                            value: p,
                          }))}
                          onChange={(v) => {
                            const updated = [...rows];
                            updated[index].position = v;
                            setRows(updated);
                          }}
                        />
                      </Col>

                      {/* FIELD 5 */}
                      <Col xs={24} md={5}>
                        {index === 0 && <b>Kích thước - đường kính (mm)</b>}
                        {needSize ? (
                          <InputNumber
                            style={{ width: "100%", marginTop: 4 }}
                            min={1}
                            value={row.size}
                            onChange={(v) => {
                              const updated = [...rows];
                              updated[index].size = v;
                              setRows(updated);
                            }}
                          />
                        ) : (
                          <InputNumber
                            style={{ width: "100%", marginTop: 4 }}
                            disabled
                            placeholder="Không yêu cầu"
                          />
                        )}
                      </Col>

                      {/* BUTTON */}
                      <Col
                        xs={24}
                        md={4}
                        style={{ display: "flex", alignItems: "end" }}
                      >
                        <Button
                          type="primary"
                          block
                          onClick={() => handleAddItem(row)}
                        >
                          Thêm
                        </Button>
                      </Col>
                    </Row>
                  </Card>
                </Spin>
              );
            })}

            {/* ⭐ ADD NEW ROW */}
            {/* <Button
            type="dashed"
            block
            onClick={addRow}
            style={{ marginBottom: 16 }}
          >
            + Thêm cấu trúc mới
          </Button> */}

            {/* Voice */}
            {!isRecording ? (
              <Button block onClick={startVoice}>
                🎤 Bắt đầu ghi âm
              </Button>
            ) : (
              <Button block danger onClick={stopVoice}>
                ⛔ Dừng ghi âm
              </Button>
            )}

            {/* Voice list */}
            <Card title="Bạn đã nói" style={{ marginTop: 16 }}>
              {voiceList.length === 0 ? (
                <i>Chưa có âm thanh nào.</i>
              ) : (
                voiceList.map((txt, idx) => <p key={idx}>• {txt}</p>)
              )}
            </Card>

            {/* AI */}
            <Button
              type="primary"
              block
              style={{ marginTop: 16 }}
              disabled={voiceList.length === 0}
              onClick={analyzeVoice}
              loading={loadingAI}
            >
              Phân tích AI
            </Button>

            {/* Final list */}
            <Card title="KẾT LUẬN, CHẨN ĐOÁN" style={{ marginTop: 24 }}>
              {list.length === 0 ? (
                <i>Chưa có mô tả nào.</i>
              ) : (
                list.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      padding: "6px 0",
                      borderBottom: "1px dashed #ddd",
                    }}
                  >
                    <span style={{ minWidth: 500 }}>• {item.text}</span>

                    <Button
                      danger
                      size="small"
                      onClick={() => {
                        const newList = list.filter((_, i) => i !== idx);
                        setList(newList);
                      }}
                    >
                      X
                    </Button>
                  </div>
                ))
              )}
            </Card>
          </>
        )}
      </Card>
      <FormActionBar
        languageTranslate={languageTranslate}
        approvalStatus={initialSnap.status}
        onAction={() => handleSave(SONO_STATUS.PENDING)}
        editId={idEdit}
        onPreview={() => {
          const values = form.validateFields();
          setOpenPreview(true);
        }}
        onExit={() => {
          if (!window.confirm("Bạn có chắc muốn thoát không?")) {
            return;
          }
          navigate(`/home/sono/bung`);
        }}
        isEdit={isEdit}
        onReset={() => {
          mapSonoDataToForm(initialSnap);
        }}
        onEdit={() => {
          if (isEdit == true) {
            setIsEdit(false);
          } else {
            setIsEdit(user.id_role == USER_ROLE.ADMIN || !idEdit);
          }
        }}
        onApprove={async () => {
          handleSave(SONO_STATUS.APPROVED);
        }}
        keys={[
          KEY_ACTION_BUTTON.reset,
          KEY_ACTION_BUTTON.save,
          KEY_ACTION_BUTTON.edit,
          KEY_ACTION_BUTTON.approve,
          KEY_ACTION_BUTTON.preview,
          KEY_ACTION_BUTTON.exit,
        ]}
      />

      {openPreview && (
        <Modal
          width={900}
          open={openPreview}
          onCancel={() => setOpenPreview(false)}
          footer={null}
          style={{ top: 20 }}
        >
          <PreviewSono
            formSnapshot={{
              ...initialSnap,
              ...form.getFieldsValue(),
            }}
            ket_qua_chan_doan={list}
            doctor={doctor}
            languageTranslate={languageTranslate}
            approvalStatus={initialSnap.status}
            editId={idEdit}
            printTemplate={printTemplate}
          />
        </Modal>
      )}
    </Form>
  );
};

export default UltrasoundBungForm;

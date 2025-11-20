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
import { LANGUAGE_OPTIONS } from "../../../doctor_use_form_ver2/use/DoctorIUseFormVer2";
import { ThamKhaoLinkHomeCare } from "../../../advance/component_common/Thamkhao";

const { Option } = Select;

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
  const { id } = useParams();
  const [form] = Form.useForm();
  const { doctor, user, printTemplateGlobal } = useGlobalAuth();

  // main states
  const [field1, setField1] = useState(null);
  // rows: parents with structure, statuses (selected array), children [{status, position, size}]
  const [rows, setRows] = useState([]);
  // final conclusions list (synchronized automatically)
  const [list, setList] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [isEdit, setIsEdit] = useState(true);
  const [printTemplate, setPrintTemplate] = useState(null);
  const [initialSnap, setInitialSnap] = useState({});
  const [idEdit, setIdEdit] = useState(id);
  const [openPreview, setOpenPreview] = useState(false);

  // voice
  const recognitionRef = useRef(null);
  const [voiceList, setVoiceList] = useState([]);
  const [isRecording, setIsRecording] = useState(false);

  // address hook
  const { provinces, wards, setSelectedProvince } = useVietnamAddress();

  // Map server data into form and rows/list
  const mapSonoDataToForm = (data) => {
    let parsed = {};
    try {
      parsed = JSON.parse(data.ket_qua_chan_doan || "{}");
    } catch (e) {
      console.error("Không parse được JSON ket_qua_chan_doan:", e);
    }

    if (!data || Object.keys(data).length === 0) {
      form.resetFields();
    } else {
      form.setFieldsValue({
        ...data,
        id_print_template: data.id_print_template,
      });
    }

    // Normalize parsed to parents format
    if (parsed.parents && Array.isArray(parsed.parents)) {
      setRows(parsed.parents);
    } else if (parsed.rows && Array.isArray(parsed.rows)) {
      // legacy flat rows -> group by structure
      const parentsMap = {};
      parsed.rows.forEach((r) => {
        const key = r.structure || "__manual__";
        if (!parentsMap[key]) {
          parentsMap[key] = {
            structure: r.structure,
            statuses: r.status ? [r.status] : [],
            children: r.status
              ? [
                  {
                    status: r.status,
                    position: r.position || null,
                    size: r.size || null,
                  },
                ]
              : [],
          };
        } else {
          parentsMap[key].statuses.push(r.status);
          parentsMap[key].children.push({
            status: r.status,
            position: r.position || null,
            size: r.size || null,
          });
        }
      });
      setRows(Object.values(parentsMap));
    } else {
      setRows(parsed.parents || []);
    }

    setList(parsed.list || parsed.finalList || []);
    setField1(parsed.field1 || null);

    const printT = printTemplateGlobal.find(
      (t) => t.id == data.id_print_template
    );
    setPrintTemplate(printT);
  };

  // load detail if id present
  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      try {
        setLoadingAI(true);
        const res = await API_CALL.get(`/sono/${id}`);
        const data = res.data.data.data;
        setInitialSnap(data);
        setIdEdit(id);
        mapSonoDataToForm(data);
      } catch (err) {
        console.error(err);
        toast.error("Không tải được chi tiết phiếu siêu âm!");
      } finally {
        setLoadingAI(false);
      }
    };
    fetchDetail();
    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    const printT = printTemplateGlobal.find(
      (t) => t.id == initialSnap.id_print_template
    );
    setPrintTemplate(printT);
  }, [printTemplateGlobal, initialSnap]);

  // init speech recognition if supported
  if (!recognitionRef.current && "webkitSpeechRecognition" in window) {
    const recog = new window.webkitSpeechRecognition();
    recog.continuous = true;
    recog.interimResults = false;
    recog.lang = "vi-VN";
    recognitionRef.current = recog;
  }

  // voice handlers
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
      toast.loading("Đang phân tích giọng nói...", { autoClose: 1200 });
      const res = await API_CALL.post(
        "/sono/analyze",
        { text: finalText },
        { timeout: 120000 }
      );
      const aiData = res.data?.data?.data || res.data?.data || [];
      const mapped = aiData.map((item) => ({
        field1: item.field1 || field1,
        structure: item.structure,
        status: item.status,
        position: item.position,
        size: item.size ? `${item.size} mm` : null,
        text: `${item.structure} – ${item.status}${
          item.position ? " – " + item.position : ""
        }${item.size ? ` – (${item.size} mm)` : ""}`,
      }));

      // Merge AI results into list (auto add/update)
      mapped.forEach((m) => {
        addOrUpdateListItem(m.structure, m.status, m.position, m.size);
      });

      toast.success("Phân tích AI thành công!");
    } catch (err) {
      console.error(err);
      toast.error("AI không phân tích được!");
    } finally {
      setLoadingAI(false);
    }
  };

  // when choose field1 -> create parents based on STRUCT
  const handleField1Change = (val) => {
    setField1(val);
    const STRUCT =
      val === FIELD1_OPTIONS[0]
        ? BUNG_STRUCTURE_OPTIONS
        : val === FIELD1_OPTIONS[1]
        ? TUYEN_GIAP_STRUCTURE_OPTIONS
        : TUYEN_VU_STRUCTURE_OPTIONS;

    const parents = Object.keys(STRUCT).map((structureKey) => ({
      structure: structureKey,
      statuses: [],
      children: [],
    }));
    setRows(parents);
  };

  // add manual parent if needed
  const addParentRow = () => {
    setRows((prev) => [
      ...prev,
      { structure: null, statuses: [], children: [] },
    ]);
  };

  // utility: find list index by structure+status
  const findListIndex = (structure, status) =>
    list.findIndex((it) => it.structure === structure && it.status === status);

  // add or update item in list (auto sync)
  const addOrUpdateListItem = (structure, status, position, size) => {
    setList((prev) => {
      const idx = prev.findIndex(
        (it) => it.structure === structure && it.status === status
      );
      const text = `Hình ảnh siêu âm: ${field1 || ""} –  ${status}${
        position ? " – " + position : ""
      }${size ? ` – (${size} mm)` : ""}`;

      if (idx === -1) {
        return [...prev, { field1, structure, status, position, size, text }];
      } else {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          position,
          size,
          text,
        };
        return updated;
      }
    });
  };

  // remove item from list by structure+status
  const removeListItemByKey = (structure, status) => {
    setList((prev) =>
      prev.filter((it) => !(it.structure === structure && it.status === status))
    );
  };

  // parent status change: selectedStatuses is array
  const onStatusChange = (selectedStatuses, parentIndex) => {
    const updated = [...rows];
    const parent = { ...updated[parentIndex] };
    const oldStatuses = parent.statuses || [];

    parent.statuses = selectedStatuses;

    // regenerate children: preserve existing child position/size if status existed previously
    parent.children = selectedStatuses.map((st) => {
      const oldChild = (parent.children || []).find((c) => c.status === st);
      return oldChild
        ? { ...oldChild }
        : { status: st, position: null, size: null };
    });

    updated[parentIndex] = parent;
    setRows(updated);

    // sync list: add new statuses
    selectedStatuses.forEach((st) => {
      const exists = list.some(
        (item) => item.structure === parent.structure && item.status === st
      );
      if (!exists) {
        // add item with null position/size; will be updated when user edits child
        addOrUpdateListItem(parent.structure, st, null, null);
      }
    });

    // remove list items for statuses unselected
    oldStatuses
      .filter((st) => !selectedStatuses.includes(st))
      .forEach((removedStatus) => {
        removeListItemByKey(parent.structure, removedStatus);
      });
  };

  // update child value (position/size) -> auto update list
  const updateChild = (pIdx, cIdx, field, value) => {
    const updated = [...rows];
    const parent = { ...updated[pIdx] };
    const child = { ...parent.children[cIdx], [field]: value };
    parent.children[cIdx] = child;
    updated[pIdx] = parent;
    setRows(updated);

    // update list item for this child
    addOrUpdateListItem(
      parent.structure,
      child.status,
      child.position,
      child.size
    );
  };

  // remove parent (and its related list items)
  const removeParent = (pIdx) => {
    const toRemove = rows[pIdx];
    // remove all list items belonging to this structure
    if (toRemove && toRemove.statuses) {
      toRemove.statuses.forEach((st) => {
        removeListItemByKey(toRemove.structure, st);
      });
    }
    setRows((prev) => prev.filter((_, i) => i !== pIdx));
  };

  // remove single list item from conclusion panel (also unselect status in parent)
  const removeListItem = (index) => {
    const item = list[index];
    if (!item) return;
    // remove from list
    setList((prev) => prev.filter((_, i) => i !== index));
    // also update rows: unselect status in parent
    const updated = [...rows];
    const pIdx = updated.findIndex((p) => p.structure === item.structure);
    if (pIdx !== -1) {
      updated[pIdx].statuses = (updated[pIdx].statuses || []).filter(
        (s) => s !== item.status
      );
      updated[pIdx].children = (updated[pIdx].children || []).filter(
        (c) => c.status !== item.status
      );
      setRows(updated);
    }
  };

  // Save logic
  const handleSave = async (status = SONO_STATUS.PENDING) => {
    try {
      if (list.length === 0) {
        toast.warning("Bạn chưa thêm mô tả siêu âm nào!");
        return;
      }
      setLoadingAI(true);
      const values = await form.validateFields();

      const payload = {
        ...values,
        status: status,
        ket_qua_chan_doan: JSON.stringify({
          list,
          field1,
          parents: rows,
        }),
        id: idEdit,
      };

      const res = await API_CALL.post("/sono", payload);

      if (status === SONO_STATUS.APPROVED) {
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

  // determine STRUCT by current field1
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
      initialValues={{
        id_template_service: "D-SONO",
        language: "vi",
      }}
    >
      <Card>
        <ThamKhaoLinkHomeCare
          name={"D-SONO"}
          title={"BÁO CÁO KẾT QUẢ SIÊU ÂM THÔNG MINH"}
        />

        <PatientInfoSection
          form={form}
          isEdit={isEdit}
          languageTranslate={TRANSLATE_LANGUAGE.VI}
          provinces={provinces}
          wards={wards}
          setSelectedProvince={setSelectedProvince}
          translateLabel={translateLabel}
        />

        <Row gutter={16} justify={"space-between"}>
          <Col xs={24} md={9}>
            <Form.Item
              label={"Phân hệ"}
              name="id_template_service"
              rules={[{ required: true, message: "Chọn kỹ thuật" }]}
              labelCol={{ flex: "0 0 90px" }}
              value={"D-SONO"}
            >
              <Select
                placeholder="Chọn kỹ thuật"
                disabled={!isEdit}
                allowClear
                onChange={() => {}}
                defaultValue={"D-SONO"}
              >
                <Option key={"D-SONO"} value={"D-SONO"}>
                  {"D-SONO"}
                </Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item
              label={"Ngôn ngữ"}
              name="language"
              rules={[{ required: true }]}
              labelCol={{ flex: "0 0 90px" }}
            >
              <Select disabled={!isEdit} placeholder="VI / EN" value={"vi"}>
                {LANGUAGE_OPTIONS.map((opt) => (
                  <Option
                    key={opt.value}
                    value={opt.value}
                    disabled={
                      idEdit || (!idEdit && !["vi"].includes(opt.value))
                    }
                  >
                    {opt.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <label
              style={{ fontWeight: 600, display: "block", marginBottom: 6 }}
            >
              Field 1 – Bộ phận thăm khám
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
              label={translateLabel(
                TRANSLATE_LANGUAGE.VI,
                "resultPrint",
                false
              )}
              name="id_print_template"
              rules={[{ required: true, message: "Chọn mẫu in" }]}
              labelCol={{ flex: "0 0 150px" }}
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
            <Card title="KẾT LUẬN, CHẨN ĐOÁN" style={{ marginTop: 24 }}>
              {rows.map((parent, pIdx) => {
                const structureOptions = STRUCT ? Object.keys(STRUCT) : [];
                const statusOptions =
                  parent.structure && STRUCT && STRUCT[parent.structure]
                    ? STRUCT[parent.structure].status
                    : [];
                const positionOptions =
                  parent.structure && STRUCT && STRUCT[parent.structure]
                    ? STRUCT[parent.structure].position
                    : [];

                return (
                  <Card
                    key={pIdx}
                    size="small"
                    style={{ marginBottom: 12, background: "#fafafa" }}
                  >
                    <Row gutter={12} align="middle">
                      <Col xs={24} md={8}>
                        {pIdx === 0 && <b>Cấu trúc</b>}
                        <Select
                          style={{ width: "100%", marginTop: 4 }}
                          placeholder="Chọn cấu trúc"
                          value={parent.structure}
                          onChange={(v) => {
                            const updated = [...rows];
                            updated[pIdx] = {
                              ...updated[pIdx],
                              structure: v,
                              statuses: [],
                              children: [],
                            };
                            setRows(updated);
                          }}
                          options={structureOptions.map((s) => ({
                            label: s,
                            value: s,
                          }))}
                        />
                      </Col>

                      <Col xs={24} md={12}>
                        {pIdx === 0 && <b>Trạng thái (chọn nhiều)</b>}
                        <Select
                          mode="multiple"
                          allowClear
                          placeholder="Chọn trạng thái (multi)"
                          style={{ width: "100%", marginTop: 4 }}
                          value={parent.statuses}
                          disabled={!parent.structure}
                          onChange={(vals) => onStatusChange(vals, pIdx)}
                          options={statusOptions.map((s) => ({
                            label: s,
                            value: s,
                          }))}
                        />
                      </Col>
                      {/* 
                    <Col xs={24} md={4} style={{ textAlign: "right" }}>
                      <Button danger onClick={() => removeParent(pIdx)}>
                        Xóa
                      </Button>
                    </Col> */}
                    </Row>

                    {parent.children && parent.children.length > 0 && (
                      <>
                        <Divider style={{ margin: "8px 0" }} />
                        {parent.children.map((child, cIdx) => {
                          const needSize =
                            parent.structure &&
                            STRUCT &&
                            STRUCT[parent.structure] &&
                            STRUCT[parent.structure].needSize.includes(
                              child.status
                            );

                          return (
                            <Row
                              gutter={12}
                              key={cIdx}
                              style={{ marginBottom: 8 }}
                            >
                              <Col
                                xs={24}
                                md={8}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <div style={{ fontWeight: 600 }}>
                                  <p>{child.status}</p>
                                </div>
                              </Col>

                              <Col xs={24} md={8}>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <div style={{ width: 80 }}>{"Ở vị trí:"}</div>
                                  <Select
                                    style={{ width: "100%" }}
                                    placeholder="Chọn vị trí"
                                    value={child.position}
                                    disabled={
                                      child.status === "Không thấy bất thường"
                                    }
                                    options={positionOptions.map((p) => ({
                                      label: p,
                                      value: p,
                                    }))}
                                    onChange={(v) =>
                                      updateChild(pIdx, cIdx, "position", v)
                                    }
                                  />
                                </div>
                              </Col>

                              <Col xs={24} md={4}>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <div style={{ width: 220 }}>
                                    {"Có kích thước:"}
                                  </div>
                                  {needSize ? (
                                    <InputNumber
                                      style={{ width: "100%" }}
                                      min={1}
                                      placeholder="mm"
                                      value={child.size}
                                      onChange={(v) =>
                                        updateChild(pIdx, cIdx, "size", v)
                                      }
                                    />
                                  ) : (
                                    <InputNumber
                                      style={{ width: "100%" }}
                                      disabled
                                      placeholder="Không yêu cầu"
                                    />
                                  )}
                                </div>
                              </Col>

                              {/* no Add button: operations auto-synced */}
                            </Row>
                          );
                        })}
                      </>
                    )}
                  </Card>
                );
              })}
            </Card>

            {/* <Button
              type="dashed"
              block
              onClick={addParentRow}
              style={{ marginBottom: 12 }}
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

            <Card title="Bạn đã nói" style={{ marginTop: 16 }}>
              {voiceList.length === 0 ? (
                <i>Chưa có âm thanh nào.</i>
              ) : (
                voiceList.map((txt, idx) => <p key={idx}>• {txt}</p>)
              )}
            </Card>

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

            <Card title="KẾT LUẬN, CHẨN ĐOÁN" style={{ marginTop: 24 }}>
              {list.length === 0 ? (
                <i>Chưa có mô tả nào.</i>
              ) : (
                list.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "6px 0",
                      borderBottom: "1px dashed #ddd",
                    }}
                  >
                    <span style={{ flex: 1 }}>
                      • {item.text || `${item.structure} – ${item.status}`}
                    </span>
                    <div style={{ marginLeft: 12 }}>
                      <Button
                        danger
                        size="small"
                        onClick={() => removeListItem(idx)}
                      >
                        X
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </Card>
          </>
        )}
      </Card>

      <FormActionBar
        languageTranslate={TRANSLATE_LANGUAGE.VI}
        approvalStatus={initialSnap.status}
        onAction={() => handleSave(SONO_STATUS.PENDING)}
        editId={idEdit}
        onPreview={() => {
          form
            .validateFields()
            .then(() => setOpenPreview(true))
            .catch(() => setOpenPreview(true));
        }}
        onExit={() => {
          if (!window.confirm("Bạn có chắc muốn thoát không?")) return;
          navigate(`/home/sono/bung`);
        }}
        isEdit={isEdit}
        onReset={() => {
          mapSonoDataToForm(initialSnap);
        }}
        onEdit={() => {
          if (isEdit === true) setIsEdit(false);
          else setIsEdit(user.id_role == USER_ROLE.ADMIN || !idEdit);
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
            rows={rows}
            field1={field1}
            ket_qua_chan_doan={list}
            doctor={doctor}
            languageTranslate={TRANSLATE_LANGUAGE.VI}
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

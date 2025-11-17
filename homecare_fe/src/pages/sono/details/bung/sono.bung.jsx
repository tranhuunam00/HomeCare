import React, { useState, useRef } from "react";
import {
  Select,
  InputNumber,
  Button,
  Card,
  Row,
  Col,
  message,
  Radio,
} from "antd";
import axios from "axios";
import { STRUCTURE_OPTIONS } from "./bung.constants";
import API_CALL from "../../../../services/axiosClient";

const UltrasoundBungForm = () => {
  const [structure, setStructure] = useState(null);
  const [status, setStatus] = useState(null);
  const [position, setPosition] = useState(null);
  const [size, setSize] = useState(null);

  const [loadingAI, setLoadingAI] = useState(false);

  const [list, setList] = useState([]); // chứa item text hoặc item phân tích AI
  const [voiceList, setVoiceList] = useState([]); // chứa voice tạm thời để gửi AI
  const [isRecording, setIsRecording] = useState(false);

  const recognitionRef = useRef(null);

  if (!recognitionRef.current && "webkitSpeechRecognition" in window) {
    const recog = new window.webkitSpeechRecognition();
    recog.continuous = true;
    recog.interimResults = false;
    recog.lang = "vi-VN";
    recognitionRef.current = recog;
  }

  const startVoice = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      message.error("Trình duyệt không hỗ trợ giọng nói");
      return;
    }

    setIsRecording(true);
    setVoiceList([]); // reset

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

  // 🔥 CALL API PHÂN TÍCH VOICE SAU KHI BẤM HOÀN THÀNH
  const analyzeVoice = async () => {
    if (voiceList.length === 0) {
      return message.warning("Chưa có nội dung giọng nói!");
    }

    const finalText = voiceList.join(". ");

    try {
      setLoadingAI(true);
      message.loading("Đang phân tích giọng nói...", 1);

      const res = await API_CALL.post(
        "/sono/analyze",
        {
          text: finalText,
        },
        { timeout: 120000 }
      );

      const aiData = res.data?.data?.data || res.data?.data;

      // push từng item AI vào list hiển thị
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

      message.success("Phân tích AI thành công!");
    } catch (err) {
      console.error(err);
      message.error("AI không phân tích được, hãy thử lại!");
    } finally {
      setLoadingAI(false); // ⭐ tắt loading
    }
  };

  const handleAdd = () => {
    if (!structure || !status || !position) return;

    const item = {
      structure,
      status,
      position,
      size: size ? `${size} mm` : null,
      text: `${structure} – ${status} – ${position}${
        size ? ` – (${size} mm)` : ""
      }`,
    };

    setList([...list, item]);
    setStatus(null);
    setPosition(null);
    setSize(null);
  };

  const statusOptions = structure ? STRUCTURE_OPTIONS[structure].status : [];
  const positionOptions = structure
    ? STRUCTURE_OPTIONS[structure].position
    : [];
  const needSize =
    structure && STRUCTURE_OPTIONS[structure].needSize.includes(status || "");

  return (
    <Card title="Mô tả hình ảnh siêu âm">
      {/* ========= 1 HÀNG – 4 CỘT ========= */}
      <Row gutter={12}>
        <Col xs={24} md={6}>
          <label>
            <b>Field 2 – Cấu trúc</b>
          </label>
          <Radio.Group
            value={structure}
            onChange={(e) => {
              setStructure(e.target.value);
              setStatus(null);
              setPosition(null);
              setSize(null);
            }}
          >
            {Object.keys(STRUCTURE_OPTIONS).map((k) => (
              <Radio.Button key={k} value={k}>
                {k}
              </Radio.Button>
            ))}
          </Radio.Group>
        </Col>

        <Col xs={24} md={6}>
          <label>
            <b>Field 3 – Trạng thái</b>
          </label>
          <Select
            style={{ width: "100%" }}
            placeholder="Chọn"
            value={status || "Không thấy bất thường"}
            onChange={(v) => {
              setStatus(v);
              setPosition(null);
              setSize(null);
            }}
            options={statusOptions.map((s) => ({ label: s, value: s }))}
            disabled={!structure}
          />
        </Col>

        {status && status !== "Không thấy bất thường" && (
          <Col xs={24} md={6}>
            <label>
              <b>Field 4 – Vị trí</b>
            </label>
            <Select
              style={{ width: "100%" }}
              placeholder="Chọn"
              value={position}
              onChange={(v) => setPosition(v)}
              options={positionOptions.map((p) => ({ label: p, value: p }))}
              disabled={!status}
            />
          </Col>
        )}
        {status && status !== "Không thấy bất thường" && (
          <Col xs={24} md={6}>
            <label>
              <b>Field 5 – Kích thước (mm)</b>
            </label>
            {needSize ? (
              <InputNumber
                style={{ width: "100%" }}
                value={size}
                min={1}
                onChange={(v) => setSize(v)}
              />
            ) : (
              <InputNumber
                style={{ width: "100%" }}
                disabled
                placeholder="Không yêu cầu"
              />
            )}
          </Col>
        )}
      </Row>

      <Button
        type="primary"
        block
        style={{ marginTop: 16 }}
        disabled={!structure || !status || !position}
        onClick={handleAdd}
      >
        Thêm vào danh sách
      </Button>

      {/* 🎤 Nút Start / Stop Voice */}
      {!isRecording ? (
        <Button
          block
          style={{ marginTop: 16 }}
          onClick={startVoice}
          loading={loadingAI}
        >
          🎤 Bắt đầu ghi âm
        </Button>
      ) : (
        <Button
          danger
          block
          style={{ marginTop: 16 }}
          onClick={stopVoice}
          loading={loadingAI}
        >
          ⛔ Dừng ghi âm
        </Button>
      )}

      <Card title="Bạn đã nói" style={{ marginTop: 16 }}>
        {voiceList.map((txt, idx) => (
          <p key={idx}>• {txt}</p>
        ))}
        {voiceList.length === 0 && <i>Chưa có âm thanh nào.</i>}
      </Card>

      {/* 🔥 Nút gọi API sau khi hoàn thành voice */}
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
        {list.map((item, idx) => (
          <p key={idx}>• {item.text}</p>
        ))}
        {list.length === 0 && <i>Chưa có mô tả nào.</i>}
      </Card>
    </Card>
  );
};

export default UltrasoundBungForm;

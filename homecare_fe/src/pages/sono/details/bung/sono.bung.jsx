import React, { useState, useRef } from "react";
import { Select, InputNumber, Button, Card, Row, Col } from "antd";
import { STRUCTURE_OPTIONS } from "./bung.constants";

const UltrasoundBungForm = () => {
  const [structure, setStructure] = useState(null);
  const [status, setStatus] = useState(null);
  const [position, setPosition] = useState(null);
  const [size, setSize] = useState(null);

  const [list, setList] = useState([]);

  const [isRecording, setIsRecording] = useState(false);

  // 🔥 Quan trọng: chỉ tạo recognition 1 lần
  const recognitionRef = useRef(null);

  if (!recognitionRef.current && "webkitSpeechRecognition" in window) {
    const recog = new window.webkitSpeechRecognition();
    recog.continuous = true; // nghe liên tục
    recog.interimResults = false; // chỉ lấy kết quả cuối
    recog.lang = "vi-VN";
    recognitionRef.current = recog;
  }

  const startVoice = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      alert("Trình duyệt không hỗ trợ Speech Recognition!");
      return;
    }

    setIsRecording(true);
    recognition.start();

    recognition.onresult = (event) => {
      const text = event.results[event.results.length - 1][0].transcript;
      setList((prev) => [...prev, { text }]);
    };
  };

  const stopVoice = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    recognition.stop();
    setIsRecording(false);
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
          <Select
            style={{ width: "100%" }}
            placeholder="Chọn"
            value={structure}
            onChange={(v) => {
              setStructure(v);
              setStatus(null);
              setPosition(null);
              setSize(null);
            }}
            options={Object.keys(STRUCTURE_OPTIONS).map((k) => ({
              label: k,
              value: k,
            }))}
          />
        </Col>

        <Col xs={24} md={6}>
          <label>
            <b>Field 3 – Trạng thái</b>
          </label>
          <Select
            style={{ width: "100%" }}
            placeholder="Chọn"
            value={status}
            onChange={(v) => {
              setStatus(v);
              setPosition(null);
              setSize(null);
            }}
            options={statusOptions.map((s) => ({ label: s, value: s }))}
            disabled={!structure}
          />
        </Col>

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
              placeholder="mm"
            />
          ) : (
            <InputNumber
              style={{ width: "100%" }}
              disabled
              placeholder="Không yêu cầu"
            />
          )}
        </Col>
      </Row>

      {/* Nút thêm */}
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
        <Button block style={{ marginTop: 16 }} onClick={startVoice}>
          🎤 Bắt đầu ghi âm
        </Button>
      ) : (
        <Button danger block style={{ marginTop: 16 }} onClick={stopVoice}>
          ⛔ Dừng ghi âm
        </Button>
      )}

      <Card title="Hình ảnh siêu âm" style={{ marginTop: 24 }}>
        {list.map((item, idx) => (
          <p key={idx}>• {item.text}</p>
        ))}
        {list.length === 0 && <i>Chưa có mô tả nào.</i>}
      </Card>
    </Card>
  );
};

export default UltrasoundBungForm;

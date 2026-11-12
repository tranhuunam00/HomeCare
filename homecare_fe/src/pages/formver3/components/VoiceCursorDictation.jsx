import React, { useState, useEffect, useRef } from "react";
import { Button, Tooltip, message, Tag } from "antd";
import {
  AudioOutlined,
  AudioMutedOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

/**
 * VoiceCursorDictation
 * Nhận diện giọng nói tiếng Việt và tự động chèn văn bản nối tiếp
 * ngay sau vị trí con trỏ chuột trong ô input / textarea đang focus.
 */
const VoiceCursorDictation = ({ form, isMobile }) => {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [lastTargetName, setLastTargetName] = useState("");
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef(null);
  const activeCursorRef = useRef({
    el: null,
    start: 0,
    end: 0,
    fieldName: "",
  });
  const listeningStateRef = useRef(false);

  // Theo dõi vị trí con trỏ chuột toàn cục trong các ô input / textarea
  useEffect(() => {
    const handleFocusIn = (e) => {
      const target = e.target;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        const start = target.selectionStart ?? target.value?.length ?? 0;
        const end = target.selectionEnd ?? target.value?.length ?? 0;
        const fieldName =
          target.name ||
          target.id ||
          target.getAttribute("data-field") ||
          target.placeholder ||
          "Ô nhập liệu";

        activeCursorRef.current = {
          el: target,
          start,
          end,
          fieldName,
        };
        setLastTargetName(fieldName);
      }
    };

    const handleSelectionUpdate = (e) => {
      const target = e.target;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
      ) {
        if (activeCursorRef.current.el === target) {
          activeCursorRef.current.start = target.selectionStart ?? 0;
          activeCursorRef.current.end = target.selectionEnd ?? 0;
        }
      }
    };

    document.addEventListener("focusin", handleFocusIn, true);
    document.addEventListener("keyup", handleSelectionUpdate, true);
    document.addEventListener("click", handleSelectionUpdate, true);
    document.addEventListener("select", handleSelectionUpdate, true);

    return () => {
      document.removeEventListener("focusin", handleFocusIn, true);
      document.removeEventListener("keyup", handleSelectionUpdate, true);
      document.removeEventListener("click", handleSelectionUpdate, true);
      document.removeEventListener("select", handleSelectionUpdate, true);
    };
  }, []);

  // Khởi tạo SpeechRecognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "vi-VN";

    recognition.onstart = () => {
      setIsListening(true);
      listeningStateRef.current = true;
    };

    recognition.onresult = (event) => {
      let finalStr = "";
      let interimStr = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const res = event.results[i];
        const text = res[0]?.transcript || "";
        if (res.isFinal) {
          finalStr += text + " ";
        } else {
          interimStr += text;
        }
      }

      setInterimText(interimStr);

      if (finalStr.trim()) {
        insertTextAtCursor(finalStr.trim());
      }
    };

    recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        message.error("Vui lòng cấp quyền truy cập Microphone cho trình duyệt!");
        stopListening();
      }
    };

    recognition.onend = () => {
      // Tự động khởi động lại nếu user chưa bấm tắt
      if (listeningStateRef.current) {
        try {
          recognition.start();
        } catch {
          // ignore already started
        }
      } else {
        setIsListening(false);
        setInterimText("");
      }
    };

    recognitionRef.current = recognition;

    return () => {
      listeningStateRef.current = false;
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    };
  }, []);

  // Chèn văn bản vào vị trí con trỏ chuột
  const insertTextAtCursor = (text) => {
    let target = activeCursorRef.current.el;

    // Fallback: nếu chưa click vào ô nào thì chọn ô tóm tắt chẩn đoán hoặc ô nhập đầu tiên
    if (!target || !document.body.contains(target)) {
      target =
        document.querySelector('textarea[name="imagingDiagnosisSummary"]') ||
        document.querySelector('textarea#imagingDiagnosisSummary') ||
        document.querySelector('textarea[name="chan_doan_phan_biet"]') ||
        document.querySelector(".ant-input-textarea textarea") ||
        document.querySelector("input.ant-input");

      if (target) {
        activeCursorRef.current = {
          el: target,
          start: target.value?.length || 0,
          end: target.value?.length || 0,
          fieldName: target.name || target.id || "Chẩn đoán",
        };
        setLastTargetName(activeCursorRef.current.fieldName);
      }
    }

    if (!target) {
      message.info(`Giọng nói: "${text}" (Hãy click vào ô cần chèn text)`);
      return;
    }

    const currentVal = target.value || "";
    const start = activeCursorRef.current.start ?? currentVal.length;
    const end = activeCursorRef.current.end ?? start;

    const before = currentVal.substring(0, start);
    const after = currentVal.substring(end);

    // Thêm khoảng trắng thông minh nếu phía trước đã có chữ
    const needLeadingSpace =
      before.length > 0 && !/[\s.,;!?\n\r]$/.test(before);
    const textToInsert = (needLeadingSpace ? " " : "") + text;
    const nextVal = before + textToInsert + after;

    // Cập nhật DOM
    target.value = nextVal;

    // Dispatch input và change events để Ant Design Form / React nhận diện
    target.dispatchEvent(new Event("input", { bubbles: true }));
    target.dispatchEvent(new Event("change", { bubbles: true }));

    // Cập nhật giá trị vào Ant Design form nếu có fieldName
    if (form && activeCursorRef.current.fieldName) {
      try {
        form.setFieldValue(activeCursorRef.current.fieldName, nextVal);
      } catch {
        // ignore nếu fieldName không nằm trong form schema
      }
    }

    // Đặt lại con trỏ chuột ngay sau từ vừa chèn
    const nextCursor = before.length + textToInsert.length;
    try {
      target.focus();
      if (typeof target.setSelectionRange === "function") {
        target.setSelectionRange(nextCursor, nextCursor);
      }
    } catch {
      // ignore
    }

    activeCursorRef.current.start = nextCursor;
    activeCursorRef.current.end = nextCursor;
  };

  const startListening = () => {
    if (!isSupported) {
      message.warning(
        "Trình duyệt hiện tại chưa hỗ trợ nhận diện giọng nói. Khuyến nghị dùng Google Chrome, Edge hoặc Safari.",
      );
      return;
    }

    listeningStateRef.current = true;
    try {
      recognitionRef.current?.start();
      setIsListening(true);
      message.success("Đã bật Voice! Nói tiếng Việt để chèn ngay sau con trỏ chuột.");
    } catch (e) {
      console.warn("Start recognition error:", e);
    }
  };

  const stopListening = () => {
    listeningStateRef.current = false;
    setIsListening(false);
    setInterimText("");
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        right: isMobile ? 12 : 24,
        bottom: isMobile ? 70 : 80,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 6,
        pointerEvents: "auto",
      }}
    >
      {/* Bong bóng hiển thị text tạm thời khi đang nói */}
      {isListening && (
        <div
          style={{
            background: "rgba(15, 23, 42, 0.92)",
            backdropFilter: "blur(8px)",
            color: "#ffffff",
            padding: "8px 12px",
            borderRadius: 10,
            fontSize: 12,
            maxWidth: isMobile ? 260 : 340,
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            border: "1px solid rgba(255,255,255,0.15)",
            animation: "fadeIn 0.2s ease",
            lineHeight: 1.4,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <span style={{ color: "#4ade80", fontWeight: 700, fontSize: 11 }}>
              ● ĐANG NGHE TIẾNG VIỆT
            </span>
            {lastTargetName && (
              <Tag color="blue" style={{ margin: 0, fontSize: 10 }}>
                Chèn vào: {lastTargetName}
              </Tag>
            )}
          </div>
          <div style={{ fontStyle: interimText ? "italic" : "normal", color: "#e2e8f0" }}>
            {interimText ? `"${interimText}..."` : "Đặt con trỏ vào ô bất kỳ và nói để chèn chữ..."}
          </div>
        </div>
      )}

      {/* Nút bấm Voice chính */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Tooltip
          title={
            isListening
              ? "Bấm để tắt Voice"
              : "Bật nhận diện giọng nói: Đặt con trỏ chuột ở đâu thì voice sẽ chèn sau đó"
          }
          placement="left"
        >
          <Button
            type="primary"
            shape="round"
            size={isMobile ? "middle" : "large"}
            icon={isListening ? <AudioOutlined /> : <AudioOutlined />}
            onClick={() => {
              if (isListening) stopListening();
              else startListening();
            }}
            style={{
              height: isMobile ? 42 : 46,
              padding: isMobile ? "0 14px" : "0 18px",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: isMobile ? 13 : 14,
              fontWeight: 600,
              boxShadow: isListening
                ? "0 0 0 4px rgba(239, 68, 68, 0.35), 0 8px 20px rgba(239, 68, 68, 0.4)"
                : "0 6px 18px rgba(11, 107, 79, 0.35)",
              background: isListening
                ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                : "linear-gradient(135deg, #0b6b4f 0%, #04580f 100%)",
              borderColor: "transparent",
              transition: "all 0.25s ease",
              cursor: "pointer",
            }}
          >
            {isListening ? (
              <span>Đang nghe (Bấm để dừng)</span>
            ) : (
              <span>🎤 Voice chèn tại trỏ chuột</span>
            )}
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};

export default VoiceCursorDictation;


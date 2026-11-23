import { describe, it, expect, vi, afterEach } from "vitest";
import {
  DEFAULT_DSONO_URL,
  buildDsonoCaseQuery,
  buildDsonoCaseUrl,
  getDsonoBaseUrl,
  openDsonoForCase,
} from "../dsonoLink";

describe("dsonoLink", () => {
  afterEach(() => vi.restoreAllMocks());

  it("mặc định HTTPS domain D-SONO", () => {
    expect(getDsonoBaseUrl({})).toBe(DEFAULT_DSONO_URL);
    expect(DEFAULT_DSONO_URL.startsWith("https://")).toBe(true);
  });

  it("chặn cấu hình http:// IP (mật khẩu HomeCare đi dạng rõ)", () => {
    expect(getDsonoBaseUrl({ VITE_DSONO_URL: "http://103.90.227.173:6002" })).toBe(DEFAULT_DSONO_URL);
  });

  it("cho phép http://localhost khi dev và https tuỳ chỉnh, bỏ / cuối", () => {
    expect(getDsonoBaseUrl({ VITE_DSONO_URL: "http://localhost:5173" })).toBe("http://localhost:5173");
    expect(getDsonoBaseUrl({ VITE_DSONO_URL: "https://dsono.test/" })).toBe("https://dsono.test");
  });

  it("mã hoá đầy đủ tham số (PID có ký tự đặc biệt không phá URL)", () => {
    const q = new URLSearchParams(buildDsonoCaseQuery({ id: 5, PID: "A&B=1", name: "Nguyễn Văn A", gender: "Nam" }));
    expect(q.get("accessionNo")).toBe("5");
    expect(q.get("pid")).toBe("A&B=1");
    expect(q.get("patientName")).toBe("Nguyễn Văn A");
    expect(q.get("source")).toBe("HOMECARE");
  });

  it("thiếu dữ liệu ca -> chuỗi rỗng, không 'undefined'", () => {
    expect(buildDsonoCaseUrl({}, {})).not.toContain("undefined");
  });

  it("máy tính: mở tab mới với noopener", () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    const url = openDsonoForCase({ id: 1 }, { userAgent: "Mozilla/5.0 (Windows NT 10.0)", env: {} });
    expect(open).toHaveBeenCalledWith(url, "_blank", "noopener,noreferrer");
    expect(url.startsWith(DEFAULT_DSONO_URL)).toBe(true);
  });
});

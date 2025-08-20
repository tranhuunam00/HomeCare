import { useMemo } from "react";

/**
 * useSelectById
 * @param {Array<object>} list - mảng dữ liệu (examParts, templateServices, ...)
 * @param {string|number|undefined|null} id - id cần chọn (vd: data.id_exam_part)
 * @param {object} opts
 *  - idKey: tên khóa id trong phần tử (mặc định: 'id')
 *  - activeKey: tên khóa biểu thị active (mặc định: 'status')
 *  - activeValue: giá trị được coi là active (mặc định: true)
 */
export default function useSelectById(list, id, opts = {}) {
  const { idKey = "id", activeKey = "status", activeValue = true } = opts;

  // Map để lookup nhanh theo id
  const byId = useMemo(() => {
    if (!Array.isArray(list)) return new Map();
    const m = new Map();
    for (const it of list) {
      const k = it?.[idKey];
      if (k !== undefined && k !== null) m.set(k, it);
    }
    return m;
  }, [list, idKey]);

  // Item được chọn theo id
  const selected = useMemo(() => {
    if (id === undefined || id === null) return undefined;
    return byId.get(id);
  }, [byId, id]);

  // Danh sách active (nếu có cờ status)
  const activeList = useMemo(() => {
    if (!Array.isArray(list)) return [];
    // Nếu không có activeKey thì trả về toàn bộ list
    if (!list.length || !(activeKey in (list[0] || {}))) return list;
    return list.filter((x) => x?.[activeKey] === activeValue);
  }, [list, activeKey, activeValue]);

  return {
    selected, // phần tử khớp id
    activeList, // danh sách đã lọc active
    byId, // Map tra cứu
    ready: Array.isArray(list) && list.length > 0,
  };
}

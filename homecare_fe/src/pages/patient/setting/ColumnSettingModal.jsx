import React, { useState, useEffect } from "react";
import { Modal, Checkbox, InputNumber } from "antd";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import styles from "./ColumnSettingModal.module.scss";

const ColumnSettingModal = ({
  open,
  onClose,
  allColumns,
  visibleKeys,
  onSave,
}) => {
  const [orderedKeys, setOrderedKeys] = useState([]);
  const [localVisibleKeys, setLocalVisibleKeys] = useState([]);
  const [widths, setWidths] = useState({});

  useEffect(() => {
    setOrderedKeys(allColumns.map((c) => c.key));
    setLocalVisibleKeys(visibleKeys);
    const initWidths = {};
    allColumns.forEach((c) => (initWidths[c.key] = c.width || 120));
    setWidths(initWidths);
  }, [allColumns, visibleKeys]);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(orderedKeys);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setOrderedKeys(items);
  };

  const toggleVisible = (key) => {
    setLocalVisibleKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleWidthChange = (key, value) => {
    setWidths((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave({
      orderedKeys,
      visibleKeys: localVisibleKeys,
      widths,
    });
    onClose();
  };

  return (
    <Modal
      title="Cấu hình cột"
      open={open}
      onCancel={onClose}
      onOk={handleSave}
      width={550}
    >
      <div className={styles.container}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="columns">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {orderedKeys.map((key, index) => {
                  const col = allColumns.find((c) => c.key === key);
                  if (!col) return null;

                  return (
                    <Draggable
                      key={col.key}
                      draggableId={col.key}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          className={`${styles.row} ${
                            snapshot.isDragging ? styles.dragging : ""
                          }`}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps} // ⭐ CHO PHÉP KÉO CẢ ROW
                        >
                          <Checkbox
                            checked={localVisibleKeys.includes(col.key)}
                            onChange={() => toggleVisible(col.key)}
                          >
                            {col.title}
                          </Checkbox>

                          <InputNumber
                            min={60}
                            value={widths[col.key]}
                            onChange={(val) => handleWidthChange(col.key, val)}
                            className={styles.widthInput}
                          />
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </Modal>
  );
};

export default ColumnSettingModal;

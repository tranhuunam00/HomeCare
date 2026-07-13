---
name: confirm_action_modal
description: >
  Huong dan tao va su dung pattern xac nhan thao tac dung chung toan he thong (useConfirmAction + ConfirmActionModal).
  Ap dung khi bat ky button nao can: hoi xac nhan truoc -> loading spinner -> toast thanh cong/that bai.
---

# Confirm Action Modal Pattern

Pattern dung chung cho moi thao tac quan trong trong he thong (tao, cap nhat, xoa, doi trang thai...).

## Cau truc file

```
src/
  hooks/
    useConfirmAction.js          <- Hook quan ly state modal + chay async action
  components/
    ConfirmActionModal/
      ConfirmActionModal.jsx     <- UI component cua modal xac nhan
```

## Cach dung nhanh

```jsx
import useConfirmAction from "../hooks/useConfirmAction";
import ConfirmActionModal from "../components/ConfirmActionModal/ConfirmActionModal";

function MyComponent() {
  const { confirmState, openConfirm } = useConfirmAction();

  const handleDelete = () => {
    openConfirm({
      title: "Xac nhan xoa",
      message: "Ban co chac chan muon xoa ban ghi nay khong?",
      successMessage: "Xoa thanh cong!",
      errorMessage: "Xoa that bai, vui long thu lai.",
      onConfirm: async () => {
        await API_CALL.delete(`/resource/${id}`);
      },
    });
  };

  return (
    <>
      <Button danger onClick={handleDelete}>Xoa</Button>
      <ConfirmActionModal {...confirmState} />
    </>
  );
}
```

## API cua `openConfirm`

| Prop | Type | Bat buoc | Mo ta |
|------|------|----------|-------|
| `title` | string | YES | Tieu de modal |
| `message` | string | YES | Noi dung cau hoi |
| `onConfirm` | async () => void | YES | Ham async chay khi user bam Xac nhan. Throw loi neu that bai. |
| `successMessage` | string | NO | Toast thanh cong sau khi onConfirm resolve |
| `errorMessage` | string | NO | Toast that bai fallback neu server khong tra ve message |

## Hanh vi tu dong

- Spinner trong nut OK khi dang cho onConfirm
- Disable Huy & dong modal trong khi dang xu ly
- Toast thanh cong tu dong sau khi resolve
- Toast that bai tu dong sau khi throw (uu tien server message)
- Dong modal tu dong sau khi thanh cong

## Vi du voi form validate truoc

```jsx
const handleSubmitClick = async () => {
  try {
    const values = await form.validateFields();
    openConfirm({
      title: "Xac nhan luu",
      message: "Ban co chac chan muon luu thong tin nay?",
      successMessage: "Luu thanh cong!",
      onConfirm: async () => {
        await API_CALL.put(`/resource/${id}`, values);
      },
    });
  } catch {
    // Ant Design tu highlight cac field loi
  }
};
```

## Vi du thuc te trong codebase

- PatientFormPage.jsx: src/pages/patient/New/PatientFormPage.jsx
  Nut "Cap nhat" / "Tao moi" ca benh da su dung pattern nay.

## Quy tac bat buoc

1. KHONG dung window.confirm() - thay bang pattern nay
2. KHONG dung message.success/error tu Antd cho cac thao tac quan trong - dung toast tu react-toastify
3. Dat <ConfirmActionModal {...confirmState} /> mot lan duy nhat trong component (khong long nhau)
4. onConfirm phai la async va throw loi neu API that bai de hook bat duoc

import API_CALL from "../../../services/axiosClient";
import { buildFormDataDoctorUseFormVer2 } from "../../formver2/utils";

export const toISODate = (d = new Date()) =>
  new Date(d).toISOString().slice(0, 10);

export const handleTranslateToLanguage = async ({
  setLanguageTransslate,
  form,
  setLoading,
  imageDescEditor,
  idFormVer2,
  setImageDescEditor,
  initialSnap,
  doctor,
  imageList,
  toast,
  idEdit,
  setStatus,
  setIdEdit,
  navigate,
  targetLang = "en",
  sourceLang = "vi",
  setImageList,
}) => {
  try {
    if (
      !window.confirm(
        `Bạn có chắc muốn dịch bản ghi này từ ${sourceLang} sang ${targetLang} không? Hệ thống sẽ tự động tạo bản dịch mới.`
      )
    ) {
      return;
    }

    setLanguageTransslate(targetLang);
    form.setFieldValue("language", targetLang);
    setLoading(true);

    const [translatedAddon, translatedImageDescEditor, translatedCaptions] =
      await Promise.all([
        API_CALL.post(
          "translate/object-google",
          {
            ["noidung"]: {
              quy_trinh_url: form.getFieldValue("quy_trinh_url"),
              ket_qua_chan_doan: form.getFieldValue("ket_qua_chan_doan"),
              phan_do_loai: form.getFieldValue("phan_do_loai"),
              icd10: form.getFieldValue("icd10"),
              chan_doan_phan_biet: form.getFieldValue("chan_doan_phan_biet"),
              khuyen_nghi: form.getFieldValue("khuyen_nghi"),
              ImageLeftDesc: form.getFieldValue("ImageLeftDesc"),
              ImageRightDesc: form.getFieldValue("ImageRightDesc"),
            },
            targetLang,
            sourceLang,
          },
          { timeout: 120000 }
        ),
        API_CALL.post(
          "translate/html-text-google",
          {
            text: imageDescEditor,
            targetLang,
            sourceLang,
          },
          { timeout: 120000 }
        ),
        imageList?.length
          ? API_CALL.post(
              "translate/object-google",
              {
                noidung: imageList.reduce((acc, img, idx) => {
                  acc[`caption_${idx}`] = img.caption || "";
                  return acc;
                }, {}),
                targetLang,
                sourceLang,
              },
              { timeout: 120000 }
            )
          : Promise.resolve({ data: { data: {} } }),
      ]);
    setImageDescEditor(translatedImageDescEditor.data.data);
    const captionTranslations = translatedCaptions?.data?.data || {};
    console.log("captionTranslations", captionTranslations);
    if (Object.keys(captionTranslations).length > 0) {
      const updatedImages = imageList.map((img, idx) => ({
        ...img,
        caption:
          captionTranslations[`caption_${idx}`]?.trim() || img.caption || "", // fallback nếu dịch lỗi
      }));
      console.log("updatedImages", updatedImages);
      setImageList(updatedImages);
      imageList = updatedImages;
    }

    form.setFieldValue(
      "quy_trinh_url",
      translatedAddon.data.data.quy_trinh_url
    );
    form.setFieldValue(
      "ket_qua_chan_doan",
      translatedAddon.data.data.ket_qua_chan_doan
    );
    form.setFieldValue("phan_do_loai", translatedAddon.data.data.phan_do_loai);
    form.setFieldValue("icd10", translatedAddon.data.data.icd10);
    form.setFieldValue(
      "chan_doan_phan_biet",
      translatedAddon.data.data.chan_doan_phan_biet
    );
    form.setFieldValue("khuyen_nghi", translatedAddon.data.data.khuyen_nghi);
    form.setFieldValue(
      "ImageLeftDesc",
      translatedAddon.data.data.ImageLeftDesc
    );
    form.setFieldValue(
      "ImageRightDesc",
      translatedAddon.data.data.ImageRightDesc
    );

    form.setFieldValue("imageDescMeta", JSON.stringify(imageList));

    // 🟢 3. Build lại giá trị đã dịch
    const values = {
      ...form.getFieldsValue(true),
      language: targetLang,
      quy_trinh_url: translatedAddon.data.data.quy_trinh_url,
      ket_qua_chan_doan: translatedAddon.data.data.ket_qua_chan_doan,
      phan_do_loai: translatedAddon.data.data.phan_do_loai,
      icd10: translatedAddon.data.data.icd10,
      chan_doan_phan_biet: translatedAddon.data.data.chan_doan_phan_biet,
      khuyen_nghi: translatedAddon.data.data.khuyen_nghi,
      ImageLeftDesc: translatedAddon.data.data.ImageLeftDesc,
      ImageRightDesc: translatedAddon.data.data.ImageRightDesc,
    };

    // 🟢 4. Dùng buildFormData nhưng bỏ ID gốc để tạo bản mới
    const fd = buildFormDataDoctorUseFormVer2(values, {
      id_formver2: idFormVer2 || initialSnap.apiData?.id_formver2,
      doctor,
      imageDescEditor: translatedImageDescEditor.data.data,
      ngayThucHienISO: toISODate(),
      imageList,
    });

    fd.delete("prev_id");
    fd.delete("id_root");

    fd.append(
      "id_root",
      initialSnap?.apiData?.id_root || initialSnap?.apiData?.id || idEdit
    );

    toast.info("Đang lưu bản dịch tiếng Anh...");
    const res = await API_CALL.postForm(`/doctor-use-form-ver2`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const newId = res?.data?.data?.data?.data?.id;
    if (newId) {
      toast.success(`Đã dịch và tạo bản mới thành công (ID: ${newId})!`);
      setStatus(false);
      setIdEdit(newId);
      navigate(`/home/doctor-use-form-drad/detail/${newId}`);
    } else {
      toast.warning("Dịch thành công nhưng không nhận được ID mới!");
    }
  } catch (error) {
    console.error("Translate & Save Error:", error);
    toast.error("Lỗi khi dịch hoặc lưu bản dịch!");
  } finally {
    setLoading(false);
  }
};

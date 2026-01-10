export const passwordMinLengthRule = (min = 6) => ({
  validator: (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Vui lòng nhập mật khẩu!"));
    }
    if (value.length < min) {
      return Promise.reject(new Error(`Mật khẩu phải có ít nhất ${min} ký tự`));
    }
    return Promise.resolve();
  },
});

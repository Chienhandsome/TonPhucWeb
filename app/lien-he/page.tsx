export const metadata = { title: "Liên hệ — Gas Lạnh Tôn Phúc" };

export default function ContactPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Liên hệ</h1>
      <p className="mt-2 text-slate-600">
        Trang này là khung liên hệ. Điền số điện thoại, Zalo, địa chỉ và giờ làm việc thật của Gas Lạnh Tôn Phúc
        vào đây trước khi lên sóng — skeleton không tự bịa số liên hệ.
      </p>
      <div className="mt-5 space-y-3 rounded-xl border bg-white p-5">
        <p><span className="font-semibold">Hotline:</span> <span className="text-slate-500">[Điền số hotline thật]</span></p>
        <p><span className="font-semibold">Zalo / Fanpage:</span> <span className="text-slate-500">[Điền link thật]</span></p>
        <p><span className="font-semibold">Địa chỉ:</span> <span className="text-slate-500">[Điền địa chỉ thật tại TP.HCM]</span></p>
        <p><span className="font-semibold">Giờ làm việc:</span> <span className="text-slate-500">[Điền giờ làm việc thật]</span></p>
      </div>
      <p className="mt-4 text-sm text-slate-500">
        Gợi ý: form liên hệ gửi email chỉ thêm sau khi dì xác nhận muốn nhận đơn qua email hay chỉ cần khách gọi điện / nhắn Zalo.
      </p>
    </div>
  );
}

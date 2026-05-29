/**
 * Tạo file Excel mẫu để gửi cho khách điền data
 * Chạy: npx tsx prisma/create-template.ts
 * Output: prisma/template-san-pham.xlsx
 */

import * as XLSX from "xlsx";
import * as path from "path";

const wb = XLSX.utils.book_new();

// ── Sheet 1: Danh mục ────────────────────────────────────────────────────────
const catData = [
  ["Tên danh mục", "Slug", "Thứ tự"],
  ["Rau xanh",     "rau-xanh",   1],
  ["Củ quả",       "cu-qua",     2],
  ["Thịt heo",     "thit-heo",   3],
  ["Thịt bò",      "thit-bo",    4],
  ["Thịt gà",      "thit-ga",    5],
  ["Cá & Hải sản", "ca-hai-san", 6],
  ["Đồ chế biến",  "do-che-bien",7],
];

const catSheet = XLSX.utils.aoa_to_sheet(catData);
catSheet["!cols"] = [{ wch: 25 }, { wch: 20 }, { wch: 10 }];
XLSX.utils.book_append_sheet(wb, catSheet, "Danh muc");

// ── Sheet 2: Sản phẩm ────────────────────────────────────────────────────────
const headers = [
  "Tên sản phẩm",
  "Danh mục (slug)",
  "Giá bán (đ)",
  "Giá sale (đ)",
  "Đơn vị",
  "Xuất xứ",
  "Tồn kho",
  "Mô tả ngắn",
  "Link ảnh",
  "Hữu cơ",
  "Nổi bật",
  "Thiết yếu",
];

const examples = [
  ["Rau muống sạch",      "rau-xanh",   15000, "",      "bó",  "Hóc Môn",    100, "Rau muống tươi không thuốc trừ sâu",      "", "Không", "Có",  "Có"],
  ["Cải xanh VietGAP",    "rau-xanh",   18000, "",      "bó",  "Đà Lạt",      80, "Cải xanh đạt chuẩn VietGAP",              "", "Không", "Không","Có"],
  ["Ba chỉ heo tươi",     "thit-heo",  125000, 115000,  "kg",  "TP.HCM",      50, "Ba chỉ heo tươi không bơm nước",          "", "Không", "Có",  "Có"],
  ["Tôm thẻ tươi Cà Mau", "ca-hai-san",255000, 240000,  "kg",  "Cà Mau",      30, "Tôm thẻ chân trắng tươi sống",           "", "Không", "Có",  "Có"],
];

const prodData = [headers, ...examples];
const prodSheet = XLSX.utils.aoa_to_sheet(prodData);
prodSheet["!cols"] = [
  { wch: 30 }, { wch: 18 }, { wch: 14 }, { wch: 14 },
  { wch: 10 }, { wch: 18 }, { wch: 10 }, { wch: 40 },
  { wch: 35 }, { wch: 10 }, { wch: 10 }, { wch: 12 },
];
XLSX.utils.book_append_sheet(wb, prodSheet, "San pham");

// ── Sheet 3: Hướng dẫn ───────────────────────────────────────────────────────
const guide = [
  ["HƯỚNG DẪN ĐIỀN DATA"],
  [""],
  ["SHEET 'Danh muc':"],
  ["  - Tên danh mục : Tên hiển thị (vd: Rau xanh, Thịt heo...)"],
  ["  - Slug         : Mã URL không dấu (vd: rau-xanh, thit-heo...)"],
  ["  - Thứ tự       : Số thứ tự hiển thị trên web (1, 2, 3...)"],
  ["  ⚠️  Không xóa các danh mục mẫu, chỉ sửa hoặc thêm dòng mới"],
  [""],
  ["SHEET 'San pham':"],
  ["  - Tên sản phẩm    : Tên đầy đủ (vd: Rau muống sạch)"],
  ["  - Danh mục (slug) : Copy slug từ sheet Danh muc (vd: rau-xanh)"],
  ["  - Giá bán (đ)     : Giá gốc, chỉ ghi số (vd: 15000)"],
  ["  - Giá sale (đ)    : Giá khuyến mãi, để trống nếu không có"],
  ["  - Đơn vị          : kg / bó / con / hộp / gói / lít / trái / cây..."],
  ["  - Xuất xứ         : Tên địa phương (vd: Đà Lạt, Cà Mau, TP.HCM)"],
  ["  - Tồn kho         : Số lượng hiện có (vd: 50)"],
  ["  - Mô tả ngắn      : 1 câu mô tả ngắn (~80 ký tự)"],
  ["  - Link ảnh        : URL ảnh sản phẩm (nếu có). Để trống cũng được"],
  ["  - Hữu cơ          : Có / Không"],
  ["  - Nổi bật         : Có / Không (hiển thị ở trang chủ)"],
  ["  - Thiết yếu       : Có / Không (hiện sau giờ chốt đơn)"],
  [""],
  ["SAU KHI ĐIỀN XONG:"],
  ["  1. Lưu file Excel"],
  ["  2. Gửi file cho dev qua Zalo/email"],
  ["  3. Dev chạy lệnh import → xong trong 1 phút"],
];

const guideSheet = XLSX.utils.aoa_to_sheet(guide);
guideSheet["!cols"] = [{ wch: 70 }];
XLSX.utils.book_append_sheet(wb, guideSheet, "Huong dan");

const outPath = path.join(__dirname, "template-san-pham.xlsx");
XLSX.writeFile(wb, outPath);
console.log(`✅ Đã tạo file mẫu: ${outPath}`);
console.log("   Gửi file này cho khách điền data rồi gửi lại.");

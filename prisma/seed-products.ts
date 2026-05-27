/**
 * Seed script — Chỉ insert categories + products
 * Run: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-products.ts
 * hoặc: npx tsx prisma/seed-products.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const IMG = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;

/* ─── Category definitions ──────────────────────────────────────────────── */

const CATEGORIES = [
  {
    slug: "rau-xanh",
    name: "Rau xanh",
    description: "Các loại rau xanh tươi sạch, thu hoạch mỗi sáng từ vườn đạt chuẩn VietGAP",
    image: IMG("1576045057995-568f588f82fb"),
    sortOrder: 1,
  },
  {
    slug: "cu-qua",
    name: "Củ quả",
    description: "Củ quả tươi ngon, đa dạng nguồn gốc trong nước, an toàn cho gia đình",
    image: IMG("1598170845058-32b9d6a5da37"),
    sortOrder: 2,
  },
  {
    slug: "thit-tuoi",
    name: "Thịt tươi",
    description: "Thịt heo, bò, gà tươi — giết mổ hàng ngày, đảm bảo vệ sinh an toàn thực phẩm",
    image: IMG("1607623814075-e51df1bdc82f"),
    sortOrder: 3,
  },
  {
    slug: "ca-hai-san",
    name: "Cá & Hải sản",
    description: "Cá tươi sống, hải sản đánh bắt tự nhiên và nuôi sạch — giao ngay trong ngày",
    image: IMG("1574781330855-d0db8cc6a79c"),
    sortOrder: 4,
  },
];

/* ─── Product definitions ───────────────────────────────────────────────── */

type ProductDef = {
  slug: string;
  name: string;
  shortDesc: string;
  desc: string;
  price: number;
  salePrice?: number;
  stock: number;
  unit: string;
  origin: string;
  isOrganic: boolean;
  isFeatured: boolean;
  soldCount: number;
  catSlug: string;
  images: string[];
};

const PRODUCTS: ProductDef[] = [
  /* ══════════════════════════ RAU XANH ══════════════════════════ */
  {
    slug: "rau-muong-sach",
    name: "Rau muống sạch",
    shortDesc: "Rau muống tươi, ngọn mềm, trồng theo quy trình sạch, không thuốc trừ sâu",
    desc: "<p>Rau muống được trồng trên đất sạch, tưới nước giếng, không sử dụng phân bón hóa học hay thuốc bảo vệ thực vật. Thu hoạch buổi sáng sớm, giao đến tay khách vẫn còn tươi xanh.</p><ul><li>Xuất xứ: Hóc Môn, TP.HCM</li><li>Bảo quản: Để ngăn mát, dùng trong 2–3 ngày</li></ul>",
    price: 15000,
    stock: 300,
    unit: "bó",
    origin: "TP. Hồ Chí Minh",
    isOrganic: false,
    isFeatured: true,
    soldCount: 520,
    catSlug: "rau-xanh",
    images: [IMG("1576045057995-568f588f82fb")],
  },
  {
    slug: "cai-xanh-vietgap",
    name: "Cải xanh VietGAP",
    shortDesc: "Cải xanh đạt chuẩn VietGAP, lá xanh đậm, giòn, giàu vitamin K",
    desc: "<p>Cải xanh được trồng tại Lâm Đồng theo tiêu chuẩn VietGAP. Lá xanh đậm bóng, cuống giòn, vị ngọt nhẹ. Giàu vitamin K, C và canxi, rất tốt cho xương khớp.</p>",
    price: 18000,
    stock: 250,
    unit: "bó",
    origin: "Lâm Đồng",
    isOrganic: false,
    isFeatured: false,
    soldCount: 310,
    catSlug: "rau-xanh",
    images: [IMG("1598511854975-5f61c9a27b6c")],
  },
  {
    slug: "cai-thia-bok-choy",
    name: "Cải thìa (Bok choy)",
    shortDesc: "Cải thìa Đà Lạt trắng giòn, ngọt tự nhiên, thích hợp xào, nấu lẩu",
    desc: "<p>Cải thìa (bok choy) Đà Lạt với cuống trắng giòn, lá xanh mướt. Vị ngọt thanh tự nhiên, thích hợp xào tỏi, nấu soup, nhúng lẩu. Giàu canxi và sắt.</p>",
    price: 20000,
    stock: 200,
    unit: "bó",
    origin: "Đà Lạt",
    isOrganic: false,
    isFeatured: false,
    soldCount: 275,
    catSlug: "rau-xanh",
    images: [IMG("1598511854975-5f61c9a27b6c")],
  },
  {
    slug: "xa-lach-xoan-huu-co",
    name: "Xà lách xoăn hữu cơ",
    shortDesc: "Xà lách xoăn (frisée) hữu cơ Đà Lạt — giòn, hơi đắng nhẹ, dùng salad",
    desc: "<p>Xà lách xoăn hữu cơ trồng tại Đà Lạt theo phương pháp thủy canh, không hóa chất. Vị giòn, hơi đắng nhẹ đặc trưng, rất thích hợp làm salad với sốt vinaigrette.</p>",
    price: 25000,
    stock: 120,
    unit: "bó",
    origin: "Đà Lạt",
    isOrganic: true,
    isFeatured: true,
    soldCount: 195,
    catSlug: "rau-xanh",
    images: [IMG("1556801512-a89fc6e52e28")],
  },
  {
    slug: "bong-cai-xanh-broccoli",
    name: "Bông cải xanh (Broccoli)",
    shortDesc: "Broccoli Đà Lạt hữu cơ, bông chắc xanh đẹp, giàu sulforaphane",
    desc: "<p>Bông cải xanh (broccoli) hữu cơ từ trang trại Đà Lạt. Bông chắc, xanh đậm, không vàng. Rất giàu sulforaphane — hợp chất kháng ung thư tự nhiên, cùng vitamin C, chất xơ và kali.</p>",
    price: 35000,
    salePrice: 29000,
    stock: 100,
    unit: "cây",
    origin: "Đà Lạt",
    isOrganic: true,
    isFeatured: true,
    soldCount: 380,
    catSlug: "rau-xanh",
    images: [IMG("1459411621453-7b03977f4bfc")],
  },
  {
    slug: "cai-bap-da-lat",
    name: "Cải bắp Đà Lạt",
    shortDesc: "Cải bắp tươi, chắc, nặng tay, trồng vùng cao Đà Lạt",
    desc: "<p>Cải bắp Đà Lạt trồng ở độ cao 1.500m, bắp chắc, lá xanh nhạt bóng, vị ngọt tự nhiên. Có thể ăn sống, muối dưa, xào hoặc nấu canh.</p>",
    price: 28000,
    stock: 150,
    unit: "cây",
    origin: "Đà Lạt",
    isOrganic: false,
    isFeatured: false,
    soldCount: 220,
    catSlug: "rau-xanh",
    images: [IMG("1594282486552-05b4d80fbb9f")],
  },
  {
    slug: "rau-hong-ngoc",
    name: "Rau cải ngọt Hồng Ngọc",
    shortDesc: "Cải ngọt lá to, xanh mướt, ngọt thanh — đặc sản Hóc Môn",
    desc: "<p>Giống cải ngọt Hồng Ngọc lá to bản, xanh mướt, vị ngọt thanh đặc trưng. Trồng theo quy trình an toàn tại Hóc Môn. Thích hợp xào, nấu canh, ăn lẩu.</p>",
    price: 15000,
    stock: 280,
    unit: "bó",
    origin: "TP. Hồ Chí Minh",
    isOrganic: false,
    isFeatured: false,
    soldCount: 430,
    catSlug: "rau-xanh",
    images: [IMG("1576045057995-568f588f82fb")],
  },
  {
    slug: "hanh-la-da-lat",
    name: "Hành lá Đà Lạt",
    shortDesc: "Hành lá Đà Lạt thơm đặc trưng, lá xanh dài, hành trắng giòn",
    desc: "<p>Hành lá Đà Lạt nổi tiếng với mùi thơm đặc trưng và vị cay nhẹ. Lá xanh dài, hành trắng giòn. Không thể thiếu trong mọi bữa ăn Việt từ phở, cháo đến các món xào.</p>",
    price: 12000,
    stock: 350,
    unit: "bó",
    origin: "Đà Lạt",
    isOrganic: false,
    isFeatured: false,
    soldCount: 680,
    catSlug: "rau-xanh",
    images: [IMG("1501200291289-fa5a6b56c9b8")],
  },

  /* ══════════════════════════ CỦ QUẢ ══════════════════════════ */
  {
    slug: "ca-chua-bi-do-huu-co",
    name: "Cà chua bi đỏ hữu cơ",
    shortDesc: "Cà chua bi đỏ hữu cơ VietGAP — ngọt, giàu lycopene, không hóa chất",
    desc: "<p>Cà chua bi đỏ hữu cơ trồng tại Đà Lạt theo tiêu chuẩn VietGAP. Quả đều, vỏ đỏ bóng, ruột đặc, vị ngọt chua tự nhiên. Giàu lycopene và vitamin C, rất tốt cho tim mạch và da.</p>",
    price: 35000,
    salePrice: 29000,
    stock: 180,
    unit: "500g",
    origin: "Đà Lạt",
    isOrganic: true,
    isFeatured: true,
    soldCount: 490,
    catSlug: "cu-qua",
    images: [IMG("1582284540020-8acbe03f4924")],
  },
  {
    slug: "ca-rot-da-lat",
    name: "Cà rốt Đà Lạt",
    shortDesc: "Cà rốt Đà Lạt đỏ đậm, ngọt tự nhiên, giàu beta-carotene",
    desc: "<p>Cà rốt Đà Lạt nổi tiếng với màu đỏ cam đậm, vị ngọt tự nhiên và hàm lượng beta-carotene cao nhất so với các vùng trồng khác. Tốt cho mắt, da và hệ miễn dịch.</p>",
    price: 22000,
    salePrice: 18000,
    stock: 200,
    unit: "500g",
    origin: "Đà Lạt",
    isOrganic: false,
    isFeatured: true,
    soldCount: 365,
    catSlug: "cu-qua",
    images: [IMG("1598170845058-32b9d6a5da37")],
  },
  {
    slug: "khoai-tay-da-lat",
    name: "Khoai tây Đà Lạt",
    shortDesc: "Khoai tây Đà Lạt vỏ vàng, ruột vàng ươm, bở bùi, ít ngậm dầu",
    desc: "<p>Khoai tây Đà Lạt trồng ở vùng cao, vỏ mỏng vàng óng, ruột vàng bùi ngậy. Thích hợp chiên, hầm, nướng hoặc làm khoai nghiền. Ít ngậm dầu hơn khoai thường.</p>",
    price: 25000,
    stock: 220,
    unit: "kg",
    origin: "Đà Lạt",
    isOrganic: false,
    isFeatured: false,
    soldCount: 295,
    catSlug: "cu-qua",
    images: [IMG("1518977676693-91cc2e49ea3b")],
  },
  {
    slug: "hanh-tay-da-lat",
    name: "Hành tây Đà Lạt",
    shortDesc: "Hành tây Đà Lạt tím vàng, cay nhẹ, thơm, ít cay mắt hơn hành thường",
    desc: "<p>Hành tây Đà Lạt trồng theo phương pháp truyền thống, củ đều, vỏ tím vàng bóng. Vị cay nhẹ, ngọt hơn hành tây nhập khẩu. Thích hợp cho mọi món từ xào, hầm đến salad.</p>",
    price: 20000,
    stock: 180,
    unit: "kg",
    origin: "Đà Lạt",
    isOrganic: false,
    isFeatured: false,
    soldCount: 415,
    catSlug: "cu-qua",
    images: [IMG("1508747703725-719777637510")],
  },
  {
    slug: "ot-chuong-3-mau",
    name: "Ớt chuông 3 màu",
    shortDesc: "Set 3 quả ớt chuông đỏ-vàng-xanh Đà Lạt, giòn ngọt, đầy màu sắc",
    desc: "<p>Combo 3 quả ớt chuông (đỏ, vàng, xanh) trồng tại Đà Lạt. Thịt dày, giòn, ngọt tự nhiên. Giàu vitamin C (nhiều hơn cam). Thích hợp xào, làm salad, pizza hoặc ăn sống.</p>",
    price: 40000,
    salePrice: 35000,
    stock: 100,
    unit: "3 quả",
    origin: "Đà Lạt",
    isOrganic: false,
    isFeatured: true,
    soldCount: 255,
    catSlug: "cu-qua",
    images: [IMG("1563565939-2386855ab558")],
  },
  {
    slug: "bi-do-tien-giang",
    name: "Bí đỏ Tiền Giang",
    shortDesc: "Bí đỏ ruột vàng cam, bùi ngọt, giàu vitamin A, thích hợp nấu chè, cháo",
    desc: "<p>Bí đỏ Tiền Giang với vỏ xanh đậm, ruột vàng cam bùi ngọt. Giàu vitamin A, beta-carotene và kali. Có thể nấu chè, cháo, hầm xương hoặc làm bánh.</p>",
    price: 20000,
    stock: 150,
    unit: "kg",
    origin: "Tiền Giang",
    isOrganic: false,
    isFeatured: false,
    soldCount: 190,
    catSlug: "cu-qua",
    images: [IMG("1570990765782-28b8e81e74e0")],
  },
  {
    slug: "dua-leo-nhat",
    name: "Dưa leo Nhật mini",
    shortDesc: "Dưa leo Nhật vỏ mỏng, ít hạt, giòn, không đắng — đặc biệt thích hợp salad",
    desc: "<p>Giống dưa leo Nhật Bản (Japanese cucumber) trồng tại Bình Dương. Quả thon dài, vỏ mỏng xanh đậm, ít hạt, giòn và không đắng. Vị tươi mát, thích hợp ăn sống hay làm salad.</p>",
    price: 28000,
    stock: 130,
    unit: "500g",
    origin: "Bình Dương",
    isOrganic: false,
    isFeatured: false,
    soldCount: 210,
    catSlug: "cu-qua",
    images: [IMG("1449300079323-02e209d9d3a6")],
  },
  {
    slug: "ngo-ngot-dong-nai",
    name: "Ngô ngọt Đồng Nai",
    shortDesc: "Ngô ngọt hạt căng tròn, vị ngọt đậm, luộc ăn liền hoặc nướng đều ngon",
    desc: "<p>Ngô ngọt Đồng Nai giống Thái với hạt to căng, màu vàng óng ánh. Vị ngọt tự nhiên rõ rệt, thích hợp luộc, hấp, nướng hoặc tách hạt xào. Thu hoạch đúng độ chín tối đa.</p>",
    price: 15000,
    stock: 200,
    unit: "trái",
    origin: "Đồng Nai",
    isOrganic: false,
    isFeatured: false,
    soldCount: 340,
    catSlug: "cu-qua",
    images: [IMG("1601004890814-51a9ab7d7b4a")],
  },

  /* ══════════════════════════ THỊT TƯƠI ══════════════════════════ */
  {
    slug: "ba-chi-heo-tuoi",
    name: "Ba chỉ heo tươi",
    shortDesc: "Thịt ba chỉ heo tươi, nạc mỡ xen kẽ, thịt đỏ hồng, không bơm nước",
    desc: "<p>Ba chỉ heo tươi từ heo thả vườn, giết mổ trong ngày. Thịt đỏ hồng tươi, mỡ trắng trong, nạc mỡ xen kẽ cân đối. Không bơm nước, không chất tạo nạc. Thích hợp chiên, kho, luộc, nướng BBQ.</p>",
    price: 125000,
    salePrice: 115000,
    stock: 80,
    unit: "kg",
    origin: "TP. Hồ Chí Minh",
    isOrganic: false,
    isFeatured: true,
    soldCount: 430,
    catSlug: "thit-tuoi",
    images: [IMG("1607623814075-e51df1bdc82f")],
  },
  {
    slug: "suon-heo-non",
    name: "Sườn heo non",
    shortDesc: "Sườn non heo tươi, xương nhỏ, thịt nhiều, thích hợp nướng và kho",
    desc: "<p>Sườn non heo (baby ribs) tươi, xương nhỏ mềm, thịt bám xương chắc và nhiều. Không bơm nước, không chất bảo quản. Thích hợp nướng BBQ, kho tiêu, hầm củ, chiên sả ớt.</p>",
    price: 138000,
    stock: 70,
    unit: "kg",
    origin: "Bình Dương",
    isOrganic: false,
    isFeatured: true,
    soldCount: 385,
    catSlug: "thit-tuoi",
    images: [IMG("1619566636210-5b5d14e1b5aa")],
  },
  {
    slug: "nac-vai-heo",
    name: "Nạc vai heo",
    shortDesc: "Thịt nạc vai heo tươi, mềm, ít mỡ, thích hợp làm nem, chả giò, xay băm",
    desc: "<p>Nạc vai heo tươi với tỷ lệ nạc cao, ít gân, thịt mềm và thơm. Thích hợp làm nem cuốn, chả giò, xay làm thịt băm, xào hoặc nấu canh chua.</p>",
    price: 118000,
    stock: 90,
    unit: "kg",
    origin: "TP. Hồ Chí Minh",
    isOrganic: false,
    isFeatured: false,
    soldCount: 290,
    catSlug: "thit-tuoi",
    images: [IMG("1607623814075-e51df1bdc82f")],
  },
  {
    slug: "thit-bo-than-noi",
    name: "Thịt bò thăn nội",
    shortDesc: "Thăn nội bò tươi, mềm, ít gân, thích hợp bít tết và xào lửa to",
    desc: "<p>Thịt thăn nội bò tươi từ bò nuôi thả đồng. Thịt đỏ tươi, ít gân, mềm khi nấu. Thích hợp làm bít tết (steak), xào lửa to, tái chanh, phở bò. Không dùng chất tăng trọng.</p>",
    price: 285000,
    salePrice: 265000,
    stock: 40,
    unit: "kg",
    origin: "Bình Phước",
    isOrganic: true,
    isFeatured: true,
    soldCount: 310,
    catSlug: "thit-tuoi",
    images: [IMG("1558030006-1dffb48bb4e7")],
  },
  {
    slug: "thit-bo-nam",
    name: "Thịt bò nạm",
    shortDesc: "Bò nạm tươi có gân sụn xen kẽ, hầm mềm rất ngon, đặc biệt cho phở",
    desc: "<p>Bò nạm (flank/brisket) tươi với các lớp gân sụn xen kẽ thịt. Khi hầm lâu cho ra hương vị ngọt đậm tự nhiên, không bị khô. Lý tưởng cho phở bò, bún bò Huế, bò kho.</p>",
    price: 225000,
    stock: 50,
    unit: "kg",
    origin: "Bình Phước",
    isOrganic: false,
    isFeatured: false,
    soldCount: 255,
    catSlug: "thit-tuoi",
    images: [IMG("1558030006-1dffb48bb4e7")],
  },
  {
    slug: "ga-ta-nguyen-con",
    name: "Gà ta nguyên con",
    shortDesc: "Gà ta thả vườn nguyên con — da vàng, thịt chắc, thơm ngon hơn gà công nghiệp",
    desc: "<p>Gà ta thả vườn nuôi tự nhiên, ăn cám + rau, không dùng chất kích thích tăng trọng. Da vàng tự nhiên (không ướp màu), thịt chắc và thơm đậm đà. Thích hợp luộc, hầm tiêu, nướng muối ớt.</p>",
    price: 185000,
    salePrice: 170000,
    stock: 30,
    unit: "kg",
    origin: "Bình Dương",
    isOrganic: true,
    isFeatured: true,
    soldCount: 480,
    catSlug: "thit-tuoi",
    images: [IMG("1527477396000-e27163b481c2")],
  },
  {
    slug: "uc-ga-sach",
    name: "Ức gà sạch (phi lê)",
    shortDesc: "Ức gà phi lê sạch, không xương, không da, giàu protein, ít béo",
    desc: "<p>Ức gà phi lê bỏ xương, bỏ da, từ gà nuôi sạch. Thịt trắng hồng, mềm, giàu protein và ít chất béo bão hòa. Lý tưởng cho chế độ ăn gym, keto. Thích hợp áp chảo, hấp, salad, nướng.</p>",
    price: 95000,
    stock: 80,
    unit: "kg",
    origin: "Bình Dương",
    isOrganic: false,
    isFeatured: false,
    soldCount: 520,
    catSlug: "thit-tuoi",
    images: [IMG("1562967914-1199b09c5c97")],
  },
  {
    slug: "dui-ga-ta",
    name: "Đùi gà ta",
    shortDesc: "Đùi gà ta thả vườn, thịt đỏ, dai ngon, vị đậm hơn gà công nghiệp",
    desc: "<p>Đùi gà ta (phần đùi và cánh dưới) từ gà thả vườn Bình Dương. Thịt đỏ hồng, dai và thơm đậm đà. Thích hợp chiên nước mắm, kho gừng, nướng sa tế, nấu cháo.</p>",
    price: 82000,
    stock: 90,
    unit: "kg",
    origin: "Bình Dương",
    isOrganic: false,
    isFeatured: false,
    soldCount: 395,
    catSlug: "thit-tuoi",
    images: [IMG("1527477396000-e27163b481c2")],
  },

  /* ══════════════════════════ CÁ & HẢI SẢN ══════════════════════════ */
  {
    slug: "ca-hoi-na-uy-phi-le",
    name: "Cá hồi Na Uy phi lê",
    shortDesc: "Cá hồi Đại Tây Dương phi lê, thịt cam đỏ mướt, giàu Omega-3",
    desc: "<p>Cá hồi Na Uy (Atlantic salmon) phi lê còn da. Thịt cam đỏ tươi óng ánh, giàu Omega-3, DHA và EPA — tốt cho tim mạch và não bộ. Thích hợp áp chảo, nướng, làm sashimi hoặc sushi.</p>",
    price: 390000,
    salePrice: 360000,
    stock: 25,
    unit: "kg",
    origin: "Na Uy",
    isOrganic: false,
    isFeatured: true,
    soldCount: 445,
    catSlug: "ca-hai-san",
    images: [IMG("1574781330855-d0db8cc6a79c")],
  },
  {
    slug: "tom-the-tuoi-ca-mau",
    name: "Tôm thẻ tươi Cà Mau",
    shortDesc: "Tôm thẻ chân trắng tươi sống Cà Mau — thịt ngọt giòn, đầu còn dính, không tạp chất",
    desc: "<p>Tôm thẻ chân trắng tươi từ vuông tôm Cà Mau. Con tôm còn sống hoặc ướp lạnh nhanh sau thu hoạch. Thịt ngọt giòn, đầu vẫn bám chắc, không pha nước. Thích hợp chiên giòn, hấp, nướng, làm gỏi.</p>",
    price: 255000,
    salePrice: 240000,
    stock: 35,
    unit: "kg",
    origin: "Cà Mau",
    isOrganic: false,
    isFeatured: true,
    soldCount: 520,
    catSlug: "ca-hai-san",
    images: [IMG("1565680018434-b513d5e5fd47")],
  },
  {
    slug: "tom-su-song-ca-mau",
    name: "Tôm sú sống Cà Mau",
    shortDesc: "Tôm sú sống cỡ lớn, thịt chắc, vị ngọt đậm hơn tôm thẻ, lý tưởng cho nướng muối ớt",
    desc: "<p>Tôm sú sống loại đặc biệt từ Cà Mau. Con to đều, vỏ xanh đen bóng, chân còn nguyên. Thịt chắc và ngọt đậm đà. Tốt nhất để nướng, hấp nguyên con, hoặc làm tôm hùm xốt phô mai.</p>",
    price: 360000,
    stock: 20,
    unit: "kg",
    origin: "Cà Mau",
    isOrganic: false,
    isFeatured: false,
    soldCount: 290,
    catSlug: "ca-hai-san",
    images: [IMG("1565680018434-b513d5e5fd47")],
  },
  {
    slug: "ca-thu-cat-lat",
    name: "Cá thu cắt lát",
    shortDesc: "Cá thu biển Phan Rang cắt lát dày, thịt chắc thơm, không tanh",
    desc: "<p>Cá thu biển đánh bắt tự nhiên tại vùng biển Phan Rang. Cá được sơ chế, cắt lát dày đều. Thịt chắc, ít xương, vị ngọt thơm không tanh. Thích hợp kho tiêu, kho thơm (dứa), chiên giòn, hấp gừng.</p>",
    price: 135000,
    stock: 45,
    unit: "kg",
    origin: "Phan Rang",
    isOrganic: false,
    isFeatured: false,
    soldCount: 310,
    catSlug: "ca-hai-san",
    images: [IMG("1519708227418-a8b5bd81f2c5")],
  },
  {
    slug: "muc-ong-tuoi-nha-trang",
    name: "Mực ống tươi Nha Trang",
    shortDesc: "Mực ống tươi đánh bắt xa bờ Nha Trang, con còn nguyên, thịt trắng giòn",
    desc: "<p>Mực ống tươi đánh bắt xa bờ vùng biển Nha Trang. Con còn nguyên, thịt trắng ngần, giòn sần. Mực vẫn còn mực đen tươi bên trong — đặc biệt tươi ngon. Thích hợp xào sa tế, nướng, nhúng lẩu, làm gỏi.</p>",
    price: 165000,
    salePrice: 150000,
    stock: 30,
    unit: "kg",
    origin: "Nha Trang",
    isOrganic: false,
    isFeatured: true,
    soldCount: 355,
    catSlug: "ca-hai-san",
    images: [IMG("1611248586993-0e26e5ab0a3b")],
  },
  {
    slug: "ca-basa-phi-le-an-giang",
    name: "Cá basa phi lê An Giang",
    shortDesc: "Cá basa phi lê sạch, không xương, thịt trắng mềm, giá tốt",
    desc: "<p>Cá basa (pangasius) nuôi lồng bè trên sông Tiền, phi lê sạch bỏ xương và da. Thịt trắng mềm, ít chất béo. Rất linh hoạt trong nấu ăn: kho, chiên, nấu canh chua, làm chả cá, sốt cà chua.</p>",
    price: 95000,
    stock: 60,
    unit: "kg",
    origin: "An Giang",
    isOrganic: false,
    isFeatured: false,
    soldCount: 400,
    catSlug: "ca-hai-san",
    images: [IMG("1519708227418-a8b5bd81f2c5")],
  },
  {
    slug: "nghe-ben-tre",
    name: "Nghêu Bến Tre",
    shortDesc: "Nghêu Bến Tre tươi sống, sạch cát, thịt ngọt béo tự nhiên",
    desc: "<p>Nghêu tươi sống từ vùng nuôi sạch Bến Tre, đã qua ngâm sạch cát. Con to đều, thịt ngọt béo tự nhiên. Thích hợp hấp sả, nướng mỡ hành, nấu canh chua, xào cay.</p>",
    price: 88000,
    stock: 55,
    unit: "kg",
    origin: "Bến Tre",
    isOrganic: false,
    isFeatured: false,
    soldCount: 280,
    catSlug: "ca-hai-san",
    images: [IMG("1565680018434-b513d5e5fd47")],
  },
  {
    slug: "cua-dong-song-thap",
    name: "Cua đồng sống",
    shortDesc: "Cua đồng sống Đồng Tháp, gạch vàng nhiều, thịt ngọt chắc, tươi roi rói",
    desc: "<p>Cua đồng tươi sống từ Đồng Tháp, nuôi tự nhiên trong ruộng lúa hữu cơ. Cua mập, nhiều gạch vàng, thịt ngọt và chắc. Lý tưởng để nấu bún riêu, canh cua mồng tơi, rang muối.</p>",
    price: 125000,
    stock: 25,
    unit: "kg",
    origin: "Đồng Tháp",
    isOrganic: false,
    isFeatured: false,
    soldCount: 195,
    catSlug: "ca-hai-san",
    images: [IMG("1540420220822-b9b2fc66ef88")],
  },
];

/* ─── Main ──────────────────────────────────────────────────────────────── */

async function main() {
  console.log("🥬 Seeding FreshFood — categories + products...\n");

  /* ── 1. Upsert categories ── */
  const catMap: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    const result = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        image: cat.image,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
    });
    catMap[cat.slug] = result.id;
    console.log(`  ✔ Category: ${cat.name}`);
  }

  /* ── 2. Upsert products ── */
  let created = 0;
  for (const p of PRODUCTS) {
    const categoryId = catMap[p.catSlug];
    if (!categoryId) {
      console.warn(`  ⚠ Category not found: ${p.catSlug}`);
      continue;
    }

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        shortDescription: p.shortDesc,
        description: p.desc,
        price: p.price,
        salePrice: p.salePrice ?? null,
        stock: p.stock,
        unit: p.unit,
        origin: p.origin,
        isOrganic: p.isOrganic,
        isFeatured: p.isFeatured,
        soldCount: p.soldCount,
        categoryId,
        status: "ACTIVE",
      },
      create: {
        name: p.name,
        slug: p.slug,
        shortDescription: p.shortDesc,
        description: p.desc,
        price: p.price,
        salePrice: p.salePrice ?? null,
        stock: p.stock,
        unit: p.unit,
        origin: p.origin,
        isOrganic: p.isOrganic,
        isFeatured: p.isFeatured,
        soldCount: p.soldCount,
        categoryId,
        status: "ACTIVE",
      },
    });

    /* ── Upsert primary image ── */
    if (p.images.length > 0) {
      const existingImg = await prisma.productImage.findFirst({
        where: { productId: product.id, isPrimary: true },
      });
      if (!existingImg) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: p.images[0],
            alt: p.name,
            isPrimary: true,
            sortOrder: 0,
          },
        });
        // Extra images
        for (let i = 1; i < p.images.length; i++) {
          await prisma.productImage.create({
            data: {
              productId: product.id,
              url: p.images[i],
              alt: `${p.name} - ${i + 1}`,
              isPrimary: false,
              sortOrder: i,
            },
          });
        }
      }
    }

    created++;
    console.log(`  ✔ [${p.catSlug}] ${p.name} — ${p.price.toLocaleString("vi-VN")}đ/${p.unit}`);
  }

  console.log(`\n✅ Done! ${CATEGORIES.length} categories, ${created} products seeded.`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

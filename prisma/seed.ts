import {
  PrismaClient,
  Role,
  ProductStatus,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import slugify from "slugify";

const prisma = new PrismaClient();

const IMG = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;

function orderNum() {
  return `FF${Date.now()}${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`;
}

async function main() {
  console.log("🌱 Starting database seed...");

  // ── Users ──────────────────────────────────────────────────────────────────
  const adminPwd = await bcrypt.hash("Admin@123456", 12);
  await prisma.user.upsert({
    where: { email: "admin@freshfood.vn" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@freshfood.vn",
      password: adminPwd,
      role: Role.SUPER_ADMIN,
      emailVerified: new Date(),
      referralCode: "ADMIN00",
    },
  });

  const userPwd = await bcrypt.hash("User@123456", 12);
  await prisma.user.upsert({
    where: { email: "user@freshfood.vn" },
    update: {},
    create: {
      name: "Demo User",
      email: "user@freshfood.vn",
      password: userPwd,
      role: Role.USER,
      emailVerified: new Date(),
      phone: "0901234567",
      referralCode: "USER01",
    },
  });

  const customerData = [
    { name: "Nguyễn Thị Lan", email: "lan.nguyen@gmail.com", phone: "0912345678", ref: "LAN001" },
    { name: "Trần Văn Minh", email: "minh.tran@gmail.com", phone: "0923456789", ref: "MINH02" },
    { name: "Lê Thị Hoa", email: "hoa.le@gmail.com", phone: "0934567890", ref: "HOA003" },
    { name: "Phạm Quốc Hùng", email: "hung.pham@gmail.com", phone: "0945678901", ref: "HUNG04" },
    { name: "Võ Thị Mai", email: "mai.vo@gmail.com", phone: "0956789012", ref: "MAI005" },
  ];

  const customers = await Promise.all(
    customerData.map((c) =>
      prisma.user.upsert({
        where: { email: c.email },
        update: {},
        create: {
          name: c.name,
          email: c.email,
          password: userPwd,
          phone: c.phone,
          role: Role.USER,
          emailVerified: new Date(),
          referralCode: c.ref,
        },
      })
    )
  );
  console.log(`  ✔ ${customers.length + 2} users created`);

  // ── Addresses ──────────────────────────────────────────────────────────────
  const addresses = await Promise.all(
    customers.map((c, i) =>
      prisma.address.create({
        data: {
          userId: c.id,
          fullName: c.name!,
          phone: customerData[i].phone,
          province: "TP. Hồ Chí Minh",
          district: ["Quận 1", "Quận 3", "Quận 7", "Bình Thạnh", "Thủ Đức"][i],
          ward: "Phường 1",
          street: `${10 + i * 5} Đường Nguyễn Huệ`,
          isDefault: true,
        },
      })
    )
  );

  // ── Categories ─────────────────────────────────────────────────────────────
  const catData = [
    { name: "Rau củ", desc: "Rau củ tươi sạch, đảm bảo an toàn thực phẩm", img: IMG("1540420220822-b9b2fc66ef88") },
    { name: "Trái cây", desc: "Trái cây tươi nhập khẩu và trong nước", img: IMG("1619546813926-a78420fc55f1") },
    { name: "Thịt & Hải sản", desc: "Thịt tươi và hải sản sạch mỗi ngày", img: IMG("1607623814075-e51df1bdc82f") },
    { name: "Sữa & Trứng", desc: "Sản phẩm từ sữa và trứng tươi", img: IMG("1550583724-b2692b85b150") },
    { name: "Ngũ cốc & Hạt", desc: "Ngũ cốc và các loại hạt dinh dưỡng", img: IMG("1536304993881-ff6e9eefa2a6") },
    { name: "Thực phẩm hữu cơ", desc: "100% hữu cơ, không hóa chất, không GMO", img: IMG("1558642452-9d2a7deb7f62") },
  ];

  const categories = await Promise.all(
    catData.map((c) =>
      prisma.category.upsert({
        where: { slug: slugify(c.name, { lower: true, locale: "vi" }) },
        update: { image: c.img },
        create: {
          name: c.name,
          slug: slugify(c.name, { lower: true, locale: "vi" }),
          description: c.desc,
          image: c.img,
        },
      })
    )
  );
  console.log(`  ✔ ${categories.length} categories upserted`);

  // ── Suppliers ──────────────────────────────────────────────────────────────
  const supplierData = [
    { name: "Nông trại Đà Lạt Xanh", phone: "0263 123 456", address: "Đà Lạt, Lâm Đồng" },
    { name: "HTX Rau sạch Lâm Đồng", phone: "0263 654 321", address: "Đơn Dương, Lâm Đồng" },
    { name: "Công ty TNHH Hải sản Phú Quốc", phone: "0297 111 222", address: "Phú Quốc, Kiên Giang" },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = prisma as any;
  const suppliers = await Promise.all(
    supplierData.map((s) =>
      db.supplier.upsert({
        where: { id: `sup-${slugify(s.name, { lower: true })}`.slice(0, 25) },
        update: {},
        create: {
          id: `sup-${slugify(s.name, { lower: true })}`.slice(0, 25),
          name: s.name,
          phone: s.phone,
          address: s.address,
          isActive: true,
        },
      })
    )
  );
  console.log(`  ✔ ${suppliers.length} suppliers created`);

  // ── Products ───────────────────────────────────────────────────────────────
  type ProductSeed = {
    name: string;
    price: number;
    salePrice?: number;
    stock: number;
    unit: string;
    origin: string;
    isOrganic: boolean;
    isFeatured: boolean;
    catIdx: number;
    desc: string;
    shortDesc: string;
    images: string[];
    soldCount?: number;
  };

  const productSeeds: ProductSeed[] = [
    // Rau củ
    {
      name: "Cà chua bi đỏ hữu cơ",
      price: 35000, salePrice: 29000,
      stock: 150, unit: "500g", origin: "Đà Lạt",
      isOrganic: true, isFeatured: true, catIdx: 0,
      soldCount: 320,
      shortDesc: "Cà chua bi đỏ hữu cơ, trồng theo tiêu chuẩn VietGAP, không thuốc trừ sâu",
      desc: "<p>Cà chua bi đỏ được trồng tại vùng cao Đà Lạt, đảm bảo quy trình hữu cơ 100%. Vị ngọt thanh, giàu lycopene và vitamin C.</p><ul><li>Xuất xứ: Đà Lạt</li><li>Tiêu chuẩn: VietGAP / Organic</li><li>Bảo quản: 5–7 ngày ở ngăn mát tủ lạnh</li></ul>",
      images: [IMG("1582284540020-8acbe03f4924"), IMG("1607305387299-a3d9611cd469")],
    },
    {
      name: "Rau cải xanh VietGAP",
      price: 18000,
      stock: 200, unit: "bó", origin: "Lâm Đồng",
      isOrganic: false, isFeatured: false, catIdx: 0,
      soldCount: 180,
      shortDesc: "Rau cải xanh tươi, đạt chuẩn VietGAP, thu hoạch mỗi sáng",
      desc: "<p>Rau cải xanh tươi được thu hoạch mỗi sáng tại các nhà vườn đạt chuẩn VietGAP ở Lâm Đồng. Giàu chất xơ, vitamin K và canxi.</p>",
      images: [IMG("1576045057995-568f588f82fb")],
    },
    {
      name: "Cà rốt Đà Lạt",
      price: 22000, salePrice: 18000,
      stock: 180, unit: "500g", origin: "Đà Lạt",
      isOrganic: false, isFeatured: false, catIdx: 0,
      soldCount: 210,
      shortDesc: "Cà rốt đỏ tươi, ngọt tự nhiên, giàu beta-carotene",
      desc: "<p>Cà rốt Đà Lạt nổi tiếng với màu đỏ đậm, vị ngọt tự nhiên và hàm lượng beta-carotene cao. Thích hợp nấu súp, xào và ép nước.</p>",
      images: [IMG("1598170845058-32b9d6a5da37")],
    },
    {
      name: "Dưa leo Nhật Bản",
      price: 28000,
      stock: 120, unit: "500g", origin: "Bình Dương",
      isOrganic: false, isFeatured: true, catIdx: 0,
      soldCount: 145,
      shortDesc: "Dưa leo Nhật mỏng vỏ, ít hạt, giòn ngon",
      desc: "<p>Giống dưa leo Nhật Bản được trồng tại Bình Dương, vỏ mỏng, ít hạt, giòn và không đắng. Phù hợp ăn sống, làm salad.</p>",
      images: [IMG("1449300079323-02e209d9d3a6")],
    },
    {
      name: "Bông cải xanh Broccoli",
      price: 32000,
      stock: 90, unit: "bó", origin: "Lâm Đồng",
      isOrganic: true, isFeatured: false, catIdx: 0,
      soldCount: 130,
      shortDesc: "Bông cải xanh hữu cơ, chắc, xanh đẹp",
      desc: "<p>Bông cải xanh hữu cơ từ trang trại Đà Lạt Xanh. Giàu sulforaphane, vitamin C và chất xơ. Rất tốt cho sức khỏe tim mạch.</p>",
      images: [IMG("1459411621453-7b03977f4bfc")],
    },
    {
      name: "Ớt chuông 3 màu",
      price: 38000, salePrice: 32000,
      stock: 100, unit: "3 quả", origin: "Đà Lạt",
      isOrganic: false, isFeatured: false, catIdx: 0,
      soldCount: 95,
      shortDesc: "Set 3 màu đỏ - vàng - xanh, giòn ngọt",
      desc: "<p>Combo ớt chuông 3 màu (đỏ, vàng, xanh) từ Đà Lạt. Giàu vitamin C, giòn ngọt, màu sắc bắt mắt cho các món xào và salad.</p>",
      images: [IMG("1563565939-2386855ab558")],
    },
    // Trái cây
    {
      name: "Dưa hấu không hạt",
      price: 45000, salePrice: 38000,
      stock: 80, unit: "kg", origin: "Tiền Giang",
      isOrganic: false, isFeatured: true, catIdx: 1,
      soldCount: 280,
      shortDesc: "Dưa hấu không hạt ruột đỏ, ngọt mát, cắt sẵn",
      desc: "<p>Dưa hấu không hạt trồng tại Tiền Giang, ruột đỏ tươi, ngọt mát tự nhiên. Đảm bảo ngọt độ Brix trên 12.</p>",
      images: [IMG("1563114773-84221bd62daa")],
    },
    {
      name: "Xoài cát Hòa Lộc",
      price: 85000,
      stock: 60, unit: "kg", origin: "Tiền Giang",
      isOrganic: false, isFeatured: true, catIdx: 1,
      soldCount: 190,
      shortDesc: "Xoài Hòa Lộc thơm, ngọt, ít xơ — đặc sản miền Tây",
      desc: "<p>Xoài cát Hòa Lộc là đặc sản nổi tiếng của Tiền Giang. Vị ngọt thanh, ít xơ, thịt vàng ươm, mùi thơm đặc trưng.</p>",
      images: [IMG("1601493700631-2b16ec4b4716"), IMG("1598512752271-33f913a8b1b4")],
    },
    {
      name: "Dâu tây Đà Lạt",
      price: 95000, salePrice: 79000,
      stock: 70, unit: "250g", origin: "Đà Lạt",
      isOrganic: true, isFeatured: true, catIdx: 1,
      soldCount: 340,
      shortDesc: "Dâu tây Đà Lạt hữu cơ, chua ngọt, mọng nước",
      desc: "<p>Dâu tây hữu cơ trồng tại Đà Lạt 1.500m độ cao, được thu hoạch thủ công. Vị chua ngọt tự nhiên, giàu anthocyanin và vitamin C.</p>",
      images: [IMG("1464965911861-746a04b4bca6")],
    },
    {
      name: "Táo Envy New Zealand",
      price: 120000,
      stock: 50, unit: "kg", origin: "New Zealand",
      isOrganic: false, isFeatured: true, catIdx: 1,
      soldCount: 160,
      shortDesc: "Táo Envy nhập khẩu, vỏ đỏ bóng, giòn ngọt",
      desc: "<p>Táo Envy từ New Zealand, một trong những giống táo ngon nhất thế giới. Vỏ đỏ bóng đẹp, thịt trắng giòn, vị ngọt thanh không chua.</p>",
      images: [IMG("1560806887-1e4cd0b6cbd6")],
    },
    {
      name: "Nho đỏ không hạt Chile",
      price: 150000, salePrice: 125000,
      stock: 45, unit: "500g", origin: "Chile",
      isOrganic: false, isFeatured: false, catIdx: 1,
      soldCount: 120,
      shortDesc: "Nho đỏ không hạt Chile, hạt to, giòn ngọt",
      desc: "<p>Nho đỏ không hạt nhập khẩu từ Chile, hạt to đều, màu đỏ tím đẹp. Vị ngọt giòn, thích hợp ăn tươi và trang trí bánh.</p>",
      images: [IMG("1537640538966-79f369143f8f")],
    },
    {
      name: "Cam Sành miền Tây",
      price: 35000,
      stock: 200, unit: "kg", origin: "Vĩnh Long",
      isOrganic: false, isFeatured: false, catIdx: 1,
      soldCount: 250,
      shortDesc: "Cam Sành vỏ xanh, múi mọng, vị ngọt đậm đà",
      desc: "<p>Cam Sành đặc sản Vĩnh Long, vỏ xanh mỏng, múi mọng nước, vị ngọt đậm. Giàu vitamin C và flavonoid tự nhiên.</p>",
      images: [IMG("1547514701-42782101795e")],
    },
    {
      name: "Bơ sáp Đắk Lắk",
      price: 45000,
      stock: 80, unit: "kg", origin: "Đắk Lắk",
      isOrganic: false, isFeatured: false, catIdx: 1,
      soldCount: 175,
      shortDesc: "Bơ sáp 034, béo ngậy, dẻo mịn đặc sản Tây Nguyên",
      desc: "<p>Bơ sáp giống 034 của Đắk Lắk, khi chín có màu xanh đen, thịt vàng ươm, béo ngậy và dẻo mịn. Rất giàu chất béo lành mạnh.</p>",
      images: [IMG("1523049673857-eb18f1d7b578")],
    },
    // Thịt & Hải sản
    {
      name: "Thịt bò Úc đông lạnh",
      price: 320000, salePrice: 280000,
      stock: 40, unit: "500g", origin: "Úc",
      isOrganic: false, isFeatured: true, catIdx: 2,
      soldCount: 110,
      shortDesc: "Thịt bò Úc thăn lưng, mềm, nhiều vân mỡ",
      desc: "<p>Thịt bò thăn lưng nhập khẩu từ Úc, được cấp đông IQF ngay sau khi giết mổ. Nhiều vân mỡ (marbling), khi nấu mềm ngọt tự nhiên.</p>",
      images: [IMG("1551135049-8a33b5883817")],
    },
    {
      name: "Ức gà tươi hữu cơ",
      price: 95000,
      stock: 120, unit: "500g", origin: "Bình Dương",
      isOrganic: true, isFeatured: false, catIdx: 2,
      soldCount: 230,
      shortDesc: "Ức gà hữu cơ không kháng sinh, thịt trắng dai ngon",
      desc: "<p>Ức gà tươi từ trang trại hữu cơ Bình Dương, không sử dụng kháng sinh và hormone tăng trưởng. Thịt trắng, chắc, dai ngon, phù hợp ăn kiêng và gym.</p>",
      images: [IMG("1604503468506-a8da13d11d36")],
    },
    {
      name: "Tôm thẻ chân trắng tươi",
      price: 185000, salePrice: 160000,
      stock: 60, unit: "500g", origin: "Cà Mau",
      isOrganic: false, isFeatured: true, catIdx: 2,
      soldCount: 195,
      shortDesc: "Tôm thẻ chân trắng còn sống, đặc sản Cà Mau",
      desc: "<p>Tôm thẻ chân trắng nuôi theo quy trình sạch tại Cà Mau. Tôm còn tươi sống khi giao hàng, thịt chắc, ngọt đậm. Chứng nhận ASC.</p>",
      images: [IMG("1565680018434-b513d5e5fd47")],
    },
    {
      name: "Thịt heo thăn nội",
      price: 110000,
      stock: 100, unit: "500g", origin: "Đồng Nai",
      isOrganic: false, isFeatured: false, catIdx: 2,
      soldCount: 220,
      shortDesc: "Thịt heo thăn nội tươi, nạc nhiều, nấu gì cũng ngon",
      desc: "<p>Thịt heo thăn nội từ heo nuôi chuồng sạch tại Đồng Nai. Tươi, đỏ hồng tự nhiên, không tẩm ướp. Phù hợp xào, kho, luộc.</p>",
      images: [IMG("1607623814075-e51df1bdc82f")],
    },
    // Sữa & Trứng
    {
      name: "Sữa tươi nguyên chất Vinamilk",
      price: 35000,
      stock: 250, unit: "1 lít", origin: "Việt Nam",
      isOrganic: false, isFeatured: false, catIdx: 3,
      soldCount: 400,
      shortDesc: "Sữa tươi tiệt trùng 100% sữa bò tươi nguyên chất",
      desc: "<p>Sữa tươi Vinamilk 100% sữa bò tươi nguyên chất, tiệt trùng ở nhiệt độ cao UHT. Giàu canxi, vitamin D và protein, tốt cho xương khớp.</p>",
      images: [IMG("1550583724-b2692b85b150")],
    },
    {
      name: "Trứng gà ta sạch",
      price: 48000,
      stock: 200, unit: "10 quả", origin: "Bình Phước",
      isOrganic: false, isFeatured: false, catIdx: 3,
      soldCount: 360,
      shortDesc: "Trứng gà ta nuôi thả vườn, lòng đỏ đậm, thơm ngon",
      desc: "<p>Trứng gà ta từ gà nuôi thả vườn tại Bình Phước, ăn ngũ cốc tự nhiên. Lòng đỏ đậm màu, thơm ngon hơn trứng gà công nghiệp.</p>",
      images: [IMG("1582722872445-44dc5f7e3c8f")],
    },
    {
      name: "Phô mai con bò cười",
      price: 85000,
      stock: 80, unit: "180g/8 miếng", origin: "Pháp",
      isOrganic: false, isFeatured: false, catIdx: 3,
      soldCount: 140,
      shortDesc: "Phô mai La Vache Qui Rit nhập khẩu Pháp, béo mịn",
      desc: "<p>Phô mai Bel La Vache Qui Rit nhập khẩu từ Pháp. Từng miếng đóng gói riêng, béo mịn, vị nhẹ dễ ăn. Thích hợp cho trẻ em và ăn bánh mì.</p>",
      images: [IMG("1618164435735-413d3b066c9a")],
    },
    // Ngũ cốc & Hạt
    {
      name: "Gạo ST25 đặc sản",
      price: 32000,
      stock: 300, unit: "kg", origin: "Sóc Trăng",
      isOrganic: false, isFeatured: true, catIdx: 4,
      soldCount: 430,
      shortDesc: "Gạo ST25 ngon nhất thế giới năm 2019, thơm dẻo vừa",
      desc: "<p>Gạo ST25 đặc sản Sóc Trăng, từng đoạt giải gạo ngon nhất thế giới năm 2019. Hạt dài, trắng trong, khi nấu chín có mùi thơm dứa nhẹ, dẻo vừa phải.</p>",
      images: [IMG("1536304993881-ff6e9eefa2a6")],
    },
    {
      name: "Hạt điều rang muối",
      price: 125000, salePrice: 109000,
      stock: 90, unit: "250g", origin: "Bình Phước",
      isOrganic: false, isFeatured: false, catIdx: 4,
      soldCount: 185,
      shortDesc: "Hạt điều rang muối nhạt giòn thơm đặc sản Bình Phước",
      desc: "<p>Hạt điều rang muối nhạt từ điều nguyên liệu Bình Phước. Rang chín giòn, thơm bơ tự nhiên, không dầu mỡ thêm. Giàu magie và axit béo omega-9.</p>",
      images: [IMG("1599599810694-b5b37304c041")],
    },
    {
      name: "Yến mạch cán dẹt Quaker",
      price: 68000,
      stock: 150, unit: "500g", origin: "Mỹ",
      isOrganic: false, isFeatured: false, catIdx: 4,
      soldCount: 210,
      shortDesc: "Yến mạch Quaker nguyên chất, không đường, nấu nhanh",
      desc: "<p>Yến mạch cán dẹt Quaker nhập khẩu Mỹ, nguyên chất 100% không thêm đường hay hương liệu. Giàu beta-glucan giúp kiểm soát đường huyết và cholesterol.</p>",
      images: [IMG("1599408043842-cc7bbabdeb0d")],
    },
    // Thực phẩm hữu cơ
    {
      name: "Mật ong hoa nhãn nguyên chất",
      price: 185000, salePrice: 155000,
      stock: 70, unit: "500ml", origin: "Hưng Yên",
      isOrganic: true, isFeatured: true, catIdx: 5,
      soldCount: 165,
      shortDesc: "Mật ong hoa nhãn Hưng Yên 100% tự nhiên, chưa qua xử lý nhiệt",
      desc: "<p>Mật ong hoa nhãn nguyên chất từ các tổ ong tại vùng nhãn Hưng Yên. Raw honey — chưa qua xử lý nhiệt, giữ nguyên enzyme và kháng sinh tự nhiên.</p>",
      images: [IMG("1558642452-9d2a7deb7f62")],
    },
    {
      name: "Dầu dừa hữu cơ ép lạnh",
      price: 149000,
      stock: 80, unit: "200ml", origin: "Bến Tre",
      isOrganic: true, isFeatured: false, catIdx: 5,
      soldCount: 120,
      shortDesc: "Dầu dừa organic ép lạnh, tinh khiết, đa năng",
      desc: "<p>Dầu dừa hữu cơ ép lạnh từ dừa tươi Bến Tre. Tinh khiết trong suốt, mùi dừa tự nhiên nhẹ. Dùng nấu ăn, làm đẹp da và tóc.</p>",
      images: [IMG("1590779033100-9f60a05a013d")],
    },
    {
      name: "Rau mầm hữu cơ mix 5 loại",
      price: 55000,
      stock: 100, unit: "hộp 200g", origin: "Đà Lạt",
      isOrganic: true, isFeatured: false, catIdx: 5,
      soldCount: 90,
      shortDesc: "Mix rau mầm đậu, cải, hướng dương, củ cải, lúa mạch",
      desc: "<p>Hộp rau mầm hữu cơ gồm 5 loại: mầm đậu xanh, mầm cải, mầm hướng dương, mầm củ cải và mầm lúa mạch. Giàu enzyme và dinh dưỡng cực cao.</p>",
      images: [IMG("1557844352-761f2565b576")],
    },
    {
      name: "Quinoa hữu cơ trắng",
      price: 195000, salePrice: 169000,
      stock: 60, unit: "500g", origin: "Peru",
      isOrganic: true, isFeatured: true, catIdx: 5,
      soldCount: 75,
      shortDesc: "Quinoa trắng hữu cơ nhập khẩu Peru, protein cao",
      desc: "<p>Quinoa trắng hữu cơ nhập khẩu từ Peru — thực phẩm siêu dinh dưỡng chứa đầy đủ 9 axit amin thiết yếu, gluten-free, giàu protein và chất xơ.</p>",
      images: [IMG("1546069901-ba9599a7e63c")],
    },
  ];

  const createdProducts: Array<{ id: string; name: string }> = [];

  for (const p of productSeeds) {
    const slug = slugify(p.name, { lower: true, locale: "vi" });
    const product = await prisma.product.upsert({
      where: { slug },
      update: {
        price: p.price,
        salePrice: p.salePrice ?? null,
        stock: p.stock,
        shortDescription: p.shortDesc,
        description: p.desc,
        isFeatured: p.isFeatured,
        soldCount: p.soldCount ?? 0,
      },
      create: {
        name: p.name,
        slug,
        price: p.price,
        salePrice: p.salePrice ?? null,
        stock: p.stock,
        unit: p.unit,
        origin: p.origin,
        isOrganic: p.isOrganic,
        isFeatured: p.isFeatured,
        shortDescription: p.shortDesc,
        description: p.desc,
        status: ProductStatus.ACTIVE,
        categoryId: categories[p.catIdx].id,
        soldCount: p.soldCount ?? 0,
        supplierId: p.catIdx <= 1 ? suppliers[0].id : p.catIdx === 2 ? suppliers[2].id : null,
      },
    });
    createdProducts.push({ id: product.id, name: product.name });

    // Upsert images
    for (let i = 0; i < p.images.length; i++) {
      await prisma.productImage.upsert({
        where: { id: `img-${product.id}-${i}` },
        update: { url: p.images[i] },
        create: {
          id: `img-${product.id}-${i}`,
          productId: product.id,
          url: p.images[i],
          alt: p.name,
          sortOrder: i,
          isPrimary: i === 0,
        },
      });
    }
  }
  console.log(`  ✔ ${createdProducts.length} products upserted with images`);

  // ── Reviews ────────────────────────────────────────────────────────────────
  const reviewTexts = [
    { rating: 5, comment: "Sản phẩm tươi ngon, giao hàng nhanh, đóng gói cẩn thận. Sẽ mua lại!" },
    { rating: 5, comment: "Chất lượng tuyệt vời, đúng như mô tả. Cả nhà đều thích." },
    { rating: 4, comment: "Sản phẩm tốt, tươi. Giao hàng hơi trễ nhưng chấp nhận được." },
    { rating: 5, comment: "Mua lần 3 rồi, lần nào cũng ổn. Giá hợp lý, chất lượng đảm bảo." },
    { rating: 4, comment: "Tươi ngon, nhưng hộp hơi bị móp khi giao. Hy vọng cải thiện đóng gói." },
    { rating: 3, comment: "Ổn, nhưng lần này có vài quả không được tươi bằng lần trước." },
    { rating: 5, comment: "Xuất sắc! Hữu cơ thật sự, mùi thơm tự nhiên, không như hàng thường." },
    { rating: 5, comment: "Ngon lắm, gia đình tôi rất hài lòng. Đặc biệt bé con ăn được vì không có hóa chất." },
  ];

  const reviewProducts = createdProducts.slice(0, 10);
  let reviewCount = 0;
  for (let pi = 0; pi < reviewProducts.length; pi++) {
    const numReviews = 2 + (pi % 3);
    for (let ri = 0; ri < numReviews && ri < customers.length; ri++) {
      const rv = reviewTexts[(pi + ri) % reviewTexts.length];
      try {
        await prisma.review.upsert({
          where: {
            userId_productId: {
              userId: customers[ri].id,
              productId: reviewProducts[pi].id,
            },
          },
          update: {},
          create: {
            userId: customers[ri].id,
            productId: reviewProducts[pi].id,
            rating: rv.rating,
            comment: rv.comment,
            isVerified: true,
            isVisible: true,
            createdAt: new Date(Date.now() - (pi * 3 + ri) * 24 * 60 * 60 * 1000),
          },
        });
        reviewCount++;
      } catch {
        // skip duplicate
      }
    }
  }
  console.log(`  ✔ ${reviewCount} reviews created`);

  // ── Orders ─────────────────────────────────────────────────────────────────
  const orderScenarios: Array<{
    custIdx: number;
    addrIdx: number;
    status: OrderStatus;
    payStatus: PaymentStatus;
    payMethod: PaymentMethod;
    items: Array<{ prodIdx: number; qty: number }>;
    note?: string;
    daysAgo: number;
  }> = [
    {
      custIdx: 0, addrIdx: 0,
      status: OrderStatus.DELIVERED, payStatus: PaymentStatus.PAID, payMethod: PaymentMethod.COD,
      items: [{ prodIdx: 0, qty: 2 }, { prodIdx: 2, qty: 1 }, { prodIdx: 17, qty: 1 }],
      daysAgo: 15,
    },
    {
      custIdx: 1, addrIdx: 1,
      status: OrderStatus.DELIVERED, payStatus: PaymentStatus.PAID, payMethod: PaymentMethod.BANK_TRANSFER,
      items: [{ prodIdx: 7, qty: 3 }, { prodIdx: 8, qty: 1 }],
      daysAgo: 10,
    },
    {
      custIdx: 2, addrIdx: 2,
      status: OrderStatus.SHIPPED, payStatus: PaymentStatus.PENDING, payMethod: PaymentMethod.COD,
      items: [{ prodIdx: 13, qty: 1 }, { prodIdx: 15, qty: 2 }, { prodIdx: 18, qty: 1 }],
      note: "Giao trước 11h sáng nhé shop",
      daysAgo: 2,
    },
    {
      custIdx: 3, addrIdx: 3,
      status: OrderStatus.PROCESSING, payStatus: PaymentStatus.PAID, payMethod: PaymentMethod.MOMO,
      items: [{ prodIdx: 20, qty: 5 }, { prodIdx: 21, qty: 2 }],
      daysAgo: 1,
    },
    {
      custIdx: 4, addrIdx: 4,
      status: OrderStatus.CONFIRMED, payStatus: PaymentStatus.PENDING, payMethod: PaymentMethod.COD,
      items: [{ prodIdx: 24, qty: 1 }, { prodIdx: 25, qty: 2 }, { prodIdx: 26, qty: 1 }],
      daysAgo: 0,
    },
    {
      custIdx: 0, addrIdx: 0,
      status: OrderStatus.PENDING, payStatus: PaymentStatus.PENDING, payMethod: PaymentMethod.COD,
      items: [{ prodIdx: 5, qty: 1 }, { prodIdx: 6, qty: 2 }],
      note: "Để ở cổng bảo vệ giúp mình",
      daysAgo: 0,
    },
    {
      custIdx: 1, addrIdx: 1,
      status: OrderStatus.CANCELLED, payStatus: PaymentStatus.FAILED, payMethod: PaymentMethod.VNPAY,
      items: [{ prodIdx: 10, qty: 1 }],
      daysAgo: 20,
    },
    {
      custIdx: 2, addrIdx: 2,
      status: OrderStatus.DELIVERED, payStatus: PaymentStatus.PAID, payMethod: PaymentMethod.COD,
      items: [{ prodIdx: 22, qty: 2 }, { prodIdx: 23, qty: 1 }, { prodIdx: 4, qty: 1 }],
      daysAgo: 30,
    },
  ];

  let orderCount = 0;
  for (const scenario of orderScenarios) {
    const items = scenario.items
      .map(({ prodIdx, qty }) => ({ product: createdProducts[prodIdx], qty }))
      .filter((i) => i.product);

    if (items.length === 0) continue;

    const productDetails = await Promise.all(
      items.map((i) => prisma.product.findUnique({ where: { id: i.product.id } }))
    );

    const subtotal = items.reduce((sum, item, idx) => {
      const p = productDetails[idx];
      if (!p) return sum;
      const price = p.salePrice ? Number(p.salePrice) : Number(p.price);
      return sum + price * item.qty;
    }, 0);

    const shippingFee = subtotal >= 300000 ? 0 : 25000;
    const total = subtotal + shippingFee;
    const createdAt = new Date(Date.now() - scenario.daysAgo * 24 * 60 * 60 * 1000);

    await prisma.order.create({
      data: {
        orderNumber: orderNum(),
        userId: customers[scenario.custIdx].id,
        addressId: addresses[scenario.addrIdx].id,
        status: scenario.status,
        paymentStatus: scenario.payStatus,
        paymentMethod: scenario.payMethod,
        subtotal,
        shippingFee,
        discount: 0,
        total,
        note: scenario.note,
        createdAt,
        updatedAt: createdAt,
        ...(scenario.status === OrderStatus.DELIVERED && {
          deliveredAt: new Date(createdAt.getTime() + 2 * 60 * 60 * 1000),
        }),
        ...(scenario.status === OrderStatus.CANCELLED && {
          cancelledAt: new Date(createdAt.getTime() + 30 * 60 * 1000),
        }),
        items: {
          create: items.map((item, idx) => {
            const p = productDetails[idx]!;
            const price = p.salePrice ? Number(p.salePrice) : Number(p.price);
            return {
              productId: p.id,
              productName: p.name,
              price,
              quantity: item.qty,
              subtotal: price * item.qty,
            };
          }),
        },
      },
    });
    orderCount++;
  }
  console.log(`  ✔ ${orderCount} orders created`);

  // ── Coupons ────────────────────────────────────────────────────────────────
  const coupons = [
    { code: "WELCOME10", type: "PERCENTAGE", value: 10, min: 100000, max: 50000, limit: 1000, desc: "Giảm 10% cho đơn đầu tiên" },
    { code: "FREESHIP", type: "FREE_SHIPPING", value: 30000, min: 200000, max: null, limit: 500, desc: "Miễn phí vận chuyển" },
    { code: "SUMMER50K", type: "FIXED_AMOUNT", value: 50000, min: 350000, max: null, limit: 200, desc: "Giảm 50k mùa hè" },
  ];

  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {},
      create: {
        code: c.code,
        type: c.type as never,
        value: c.value,
        minOrderAmount: c.min,
        maxDiscount: c.max,
        usageLimit: c.limit,
        isActive: true,
        expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log(`  ✔ ${coupons.length} coupons created`);

  // ── Banners ────────────────────────────────────────────────────────────────
  const banners = [
    {
      id: "banner-hero-1",
      title: "Thực phẩm sạch mỗi ngày",
      subtitle: "Giao hàng tận nơi trong 2 giờ — Đảm bảo tươi ngon",
      image: IMG("1542838132-fe6c0ba33e18"),
      linkUrl: "/products",
      position: "HERO",
      sortOrder: 1,
    },
    {
      id: "banner-hero-2",
      title: "Rau củ hữu cơ Đà Lạt",
      subtitle: "VietGAP & Organic — Không thuốc trừ sâu",
      image: IMG("1540420220822-b9b2fc66ef88"),
      linkUrl: "/categories/rau-cu",
      position: "HERO",
      sortOrder: 2,
    },
    {
      id: "banner-promo-1",
      title: "Giảm 10% đơn đầu tiên",
      subtitle: "Dùng mã WELCOME10",
      image: IMG("1607305387299-a3d9611cd469"),
      linkUrl: "/products",
      position: "PROMOTIONAL",
      sortOrder: 1,
    },
  ];

  for (const b of banners) {
    await prisma.banner.upsert({
      where: { id: b.id },
      update: { image: b.image, title: b.title, subtitle: b.subtitle },
      create: {
        id: b.id,
        title: b.title,
        subtitle: b.subtitle,
        image: b.image,
        linkUrl: b.linkUrl,
        position: b.position as never,
        sortOrder: b.sortOrder,
        isActive: true,
      },
    });
  }
  console.log(`  ✔ ${banners.length} banners created`);

  console.log("\n✅ Seed completed successfully!");
  console.log("──────────────────────────────");
  console.log("  Admin:  admin@freshfood.vn / Admin@123456");
  console.log("  User:   user@freshfood.vn  / User@123456");
  console.log("──────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

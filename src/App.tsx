import { useState, useMemo } from "react";
import { useCartStore } from "./store/useCartStore";
import { useWishlistStore } from "./store/useWishlistStore";
import { formatCurrency, getDiscountPercent, calculateShipping, generateOrderNumber } from "./utils";
import { SITE_CONFIG } from "./config/site";
import type { Product, OrderForm, PaymentMethod } from "./types";

// ─────────────────────────────────────────────────────────────
//  YOUR PRODUCTS — Edit prices/names here
//  HOW TO ADD YOUR OWN IMAGE:
//    1. Put image file in:  C:\Riya Jasmin Vastraabharana\riya-jasmin-vastraabharana\public\
//    2. In images field use:  ["/your-image-name.jpg"]
//    3. Example:  images: ["/kanjivaram-blue.jpg"]
//
//  HOW TO ADD A VIDEO:
//    1. Put video in public\ folder
//    2. Add field:  video: "/your-video.mp4"
//    3. It will play on hover over the product card
// ─────────────────────────────────────────────────────────────
const PRODUCTS: Product[] = [
  {
    id: "e001", sku: "RJV-EAR-001", name: "Pearl Drop Earrings", slug: "pearl-drop-earrings",
    price: 3299, originalPrice: 5000,
    images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80"],
    tag: "Trending", desc: "Freshwater pearls, sterling silver base",
    stock: 24, material: "Sterling Silver", occasion: ["Wedding","Festive"],
    category: "jewellery", subcategory: "earrings",
    whatsapp: "Hi! I want to order Pearl Drop Earrings (RJV-EAR-001) Rs 3299"
  },
  {
    id: "e002", sku: "RJV-EAR-002", name: "Kundan Jhumkas", slug: "kundan-jhumkas",
    price: 2199, originalPrice: 3500,
    images: ["https://images.unsplash.com/photo-1601121141461-9d6647bef0a1?w=400&q=80"],
    tag: "Bestseller", desc: "Traditional Rajasthani gold plated jhumkas",
    stock: 15, material: "Gold Plated", occasion: ["Wedding","Festive","Bridal"],
    category: "jewellery", subcategory: "earrings",
    whatsapp: "Hi! I want to order Kundan Jhumkas (RJV-EAR-002) Rs 2199"
  },
  {
    id: "n001", sku: "RJV-NEC-001", name: "Temple Gold Necklace", slug: "temple-gold-necklace",
    price: 9499, originalPrice: 14000,
    images: ["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80"],
    tag: "Premium", desc: "22K gold plated, south Indian temple style",
    stock: 10, material: "Gold Plated", occasion: ["Wedding","Bridal","Festive"],
    category: "jewellery", subcategory: "necklaces",
    whatsapp: "Hi! I want to order Temple Gold Necklace (RJV-NEC-001) Rs 9499"
  },
  {
    id: "b001", sku: "RJV-BAN-001", name: "Polki Diamond Bangles", slug: "polki-diamond-bangles",
    price: 18999, originalPrice: 28000,
    images: ["https://images.unsplash.com/photo-1573408301185-9519f94ae9e8?w=400&q=80"],
    tag: "Premium", desc: "Set of 4, antique finish polki bangles",
    stock: 6, material: "Gold Plated Brass", occasion: ["Wedding","Bridal"],
    category: "jewellery", subcategory: "bangles",
    whatsapp: "Hi! I want to order Polki Bangles (RJV-BAN-001) Rs 18999"
  },
  {
    id: "s001", sku: "RJV-SAR-KAN-001", name: "Ruby Red Kanjivaram", slug: "ruby-red-kanjivaram",
    price: 8499, originalPrice: 12000,
    images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80"],
    tag: "Bestseller", desc: "Pure Zari work bridal Kanjivaram silk saree",
    stock: 8, material: "Pure Mulberry Silk", occasion: ["Wedding","Bridal","Festive"],
    category: "sarees", subcategory: "kanjivaram",
    whatsapp: "Hi! I want to order Ruby Red Kanjivaram (RJV-SAR-KAN-001) Rs 8499"
  },
  {
    id: "s002", sku: "RJV-SAR-BAN-001", name: "Royal Blue Banarasi", slug: "royal-blue-banarasi",
    price: 6299, originalPrice: 9500,
    images: ["https://images.unsplash.com/photo-1583391733956-6c78276477e4?w=400&q=80"],
    tag: "New", desc: "Handwoven Banarasi silk with golden brocade",
    stock: 12, material: "Pure Silk", occasion: ["Wedding","Festive","Reception"],
    category: "sarees", subcategory: "banarasi",
    whatsapp: "Hi! I want to order Royal Blue Banarasi (RJV-SAR-BAN-001) Rs 6299"
  },
  {
    id: "s003", sku: "RJV-SAR-COT-001", name: "Sage Green Chanderi Cotton", slug: "sage-green-chanderi",
    price: 2799, originalPrice: 4200,
    images: ["https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&q=80"],
    tag: "Sale", desc: "Lightweight Chanderi cotton, office and casual wear",
    stock: 30, material: "Chanderi Cotton", occasion: ["Daily","Office","Casual"],
    category: "sarees", subcategory: "cotton",
    whatsapp: "Hi! I want to order Sage Green Chanderi (RJV-SAR-COT-001) Rs 2799"
  },
  {
    id: "s003", sku: "RJV-SAR-COT-001", name: "Sage Green Chanderi Cotton", slug: "sage-green-chanderi",
    price: 2799, originalPrice: 4200,
    images: ["https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&q=80"],
    tag: "Sale", desc: "Lightweight Chanderi cotton, office and casual wear",
    stock: 30, material: "Chanderi Cotton", occasion: ["Daily","Office","Casual"],
    category: "sarees", subcategory: "cotton",
    whatsapp: "Hi! I want to order Sage Green Chanderi (RJV-SAR-COT-001) Rs 2799"
  },
  {
    id: "s004", sku: "RJV-SAR-MYS-001", name: "Mysore Crepe Silk", slug: "mysore-crepe-silk",
    price: 4599, originalPrice: 6800,
    images: ["/Mission-Impossible.jpeg"],
    tag: "New", desc: "Traditional temple border, pure Mysore silk",
    stock: 18, material: "Pure Silk", occasion: ["Festive","Wedding","Puja"],
    category: "sarees", subcategory: "mysore-silk",
    whatsapp: "Hi! I want to order Mysore Crepe Silk (RJV-SAR-MYS-001) Rs 4599"
  },
  // ── ADD YOUR OWN PRODUCTS BELOW THIS LINE ──────────────────
  // Example with your own image from public\ folder:
  // {
  //   id: "s005", sku: "RJV-SAR-KAN-002", name: "Blue Kanjivaram", slug: "blue-kanjivaram",
  //   price: 8999, originalPrice: 13000,
  //   images: ["/kanjivaram-blue.jpg"],   <-- put file in public\ folder, use /filename
  //   tag: "Bestseller", desc: "Pure Zari work bridal Kanjivaram silk saree",
  //   stock: 5, material: "Pure Mulberry Silk", occasion: ["Wedding","Bridal"],
  //   category: "sarees", subcategory: "kanjivaram",
  //   whatsapp: "Hi! I want to order Blue Kanjivaram (RJV-SAR-KAN-002) Rs 8999"
  // },
];

// ─────────────────────────────────────────────────────────────
//  YOUR UPI & PAYMENT DETAILS — Fill these in!
// ─────────────────────────────────────────────────────────────
const PAYMENT_DETAILS = {
  upiId: "billa14673370@ybl",          // Change to your UPI ID
  phonePe: "9381021541",              // Your PhonePe number
  googlePay: "9381021541",            // Your GPay number
  paytm: "9381021541",                // Your Paytm number
  bankName: "Union Bank of India",    // Your bank name
  accountName: "Abdul Sattar Billa",         // Account holder name
  accountNumber: "178710100122045",      // Your account number
  ifsc: "UBIN0817856",              // Your IFSC code
  qrImage: "/payment-qr.png",        // Put your QR code image in public\ folder
};

const TAG_COLORS: Record<string, string> = {
  Bestseller: "#B8860B", New: "#2E7D5C", Sale: "#C0392B", Premium: "#6B1A8B", Trending: "#1A3A6B",
};

const CATEGORIES = [
  { key: "all",       label: "All Products" },
  { key: "sarees",    label: "Sarees"       },
  { key: "jewellery", label: "Jewellery"    },
];

const INDIAN_STATES = ["Andhra Pradesh","Assam","Bihar","Delhi","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra",
  "Odisha","Punjab","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","Uttarakhand","West Bengal"];

// ── Scrolling ticker messages — edit these! ──────────────────
const TICKER_MESSAGES = [
  "Free Shipping on orders above Rs. 1,999",
  "New Festive Collection 2025 — Shop Now!",
  "Authentic handwoven sarees from master weavers",
  "WhatsApp us at +91 93810 21541 for custom orders",
  "Easy 7-day returns on all products",
  "Follow us on Instagram @rj_alankara for new arrivals",
 // "Pay via UPI: " billa14673370@ybl,
];

// SVG Icons
const IconWhatsApp = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="#25D366">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const IconInstagram = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="#E1306C">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const IconFacebook = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const IconCart = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

const IconHeart = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill={filled ? "#C0392B" : "none"} stroke="#C0392B" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);

// ── Scrolling Ticker ─────────────────────────────────────────
function Ticker() {
  const text = TICKER_MESSAGES.join("   •   ") + "   •   ";
  return (
    <div style={{ background: "#B8860B", color: "#fff", height: 34, display: "flex", alignItems: "center", overflow: "hidden", position: "relative" }}>
      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-inner {
          display: inline-flex;
          white-space: nowrap;
          animation: ticker 30s linear infinite;
        }
        .ticker-inner:hover { animation-play-state: paused; }
      `}</style>
      <div className="ticker-inner" style={{ fontSize: 13, letterSpacing: 0.5, fontFamily: "'EB Garamond', Georgia, serif" }}>
        <span>{text}{text}</span>
      </div>
    </div>
  );
}

export default function App() {
  const { items, addItem, removeItem, updateQuantity, clearCart, total, itemCount } = useCartStore();
  const { toggle, has } = useWishlistStore();

  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [payStep, setPayStep] = useState<1 | 2>(1);
  const [payMethod, setPayMethod] = useState<PaymentMethod>("upi");
  const [orderDone, setOrderDone] = useState("");
  const [toast, setToast] = useState("");
  const [form, setForm] = useState<OrderForm>({ name: "", email: "", phone: "", address: "", city: "", state: "", pincode: "" });
  const [cardNum, setCardNum] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
/*   const [upiId, setUpiId] = useState(""); */
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const filtered = useMemo(() =>
    PRODUCTS.filter(p =>
      (category === "all" || p.category === category) &&
      p.name.toLowerCase().includes(search.toLowerCase())
    ), [category, search]);

  const shipping = calculateShipping(total);
  const grandTotal = total + shipping;

  const handleCategoryClick = (key: string) => {
    setCategory(key);
    // Scroll to products
    document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAddToCart = (p: Product) => { addItem(p); showToast(p.name + " added to cart!"); };
  const handleWhatsApp = (p: Product) => {
    window.open(SITE_CONFIG.whatsapp.link + "?text=" + encodeURIComponent(p.whatsapp || ""), "_blank");
  };

  const handlePlaceOrder = () => {
    const orderNum = generateOrderNumber();
    const msg = "New Order #" + orderNum +
      "\nCustomer: " + form.name +
      "\nPhone: " + form.phone +
      "\nAddress: " + form.address + ", " + form.city + ", " + form.state + " - " + form.pincode +
      "\n\nItems:\n" + items.map(i => "- " + i.product.name + " x" + i.quantity + " = " + formatCurrency(i.product.price * i.quantity)).join("\n") +
      "\n\nTotal: " + formatCurrency(grandTotal) +
      "\nPayment: " + payMethod.toUpperCase() +
      (payMethod === "upi" ? "\nUPI paid to: " + PAYMENT_DETAILS.upiId : "");
    clearCart();
    setOrderDone(orderNum);
    setTimeout(() => {
      window.open(SITE_CONFIG.whatsapp.link + "?text=" + encodeURIComponent(msg), "_blank");
    }, 1500);
  };

  const resetCheckout = () => {
    setCheckoutOpen(false); setPayStep(1); setOrderDone("");
    setPaymentConfirmed(false);
    setForm({ name: "", email: "", phone: "", address: "", city: "", state: "", pincode: "" });
  };

  const inp: React.CSSProperties = {
    padding: "10px 12px", borderRadius: 6, border: "1.5px solid #d4b896",
    fontFamily: "inherit", fontSize: 14, color: "#2c1810", background: "#fffaf5",
    outline: "none", width: "100%", boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fdf6ef", fontFamily: "'EB Garamond', Georgia, serif", color: "#2c1810" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=EB+Garamond:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* ── SCROLLING TICKER ── */}
      <Ticker />

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, background: "#2c1810", color: "#f5e6d3", padding: "12px 20px", borderRadius: 8, zIndex: 9999, fontSize: 15, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
          {toast}
        </div>
      )}

      {/* ── HEADER ── */}
      <header style={{ background: "#2c1810", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(0,0,0,0.4)", gap: 12, minHeight: 64 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#B8860B,#DAA520)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>RJ</span>
          </div>
          <div>
            <div style={{ fontFamily: "Cormorant Garamond", fontSize: 15, fontWeight: 600, color: "#f5e6d3", letterSpacing: 1 }}>RIYA JASMIN VASTRAABHARANA</div>
            <div style={{ fontSize: 9, color: "#B8860B", letterSpacing: 3, textTransform: "uppercase" }}>Sarees &amp; Jewellery</div>
          </div>
        </div>

        <input placeholder="Search sarees, jewellery..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, maxWidth: 340, padding: "8px 16px", borderRadius: 24, border: "1.5px solid #4a2e1a", background: "rgba(255,255,255,0.07)", color: "#f5e6d3", fontSize: 13, outline: "none" }} />

        <div style={{ display: "flex", gap: 14, alignItems: "center", flexShrink: 0 }}>
          <a href={SITE_CONFIG.social.instagram.url} target="_blank" rel="noreferrer" title="@rj_alankara" style={{ textDecoration: "none", display: "flex" }}><IconInstagram /></a>
          <a href={SITE_CONFIG.social.facebook.url} target="_blank" rel="noreferrer" title="rj_alankara" style={{ textDecoration: "none", display: "flex" }}><IconFacebook /></a>
          <a href={SITE_CONFIG.whatsapp.link} target="_blank" rel="noreferrer" title="WhatsApp" style={{ textDecoration: "none", display: "flex" }}><IconWhatsApp /></a>
          <button onClick={() => setCartOpen(true)} style={{ background: "#B8860B", border: "none", color: "#fff", padding: "8px 18px", borderRadius: 24, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <IconCart /> Cart {itemCount > 0 && <span style={{ background: "#C0392B", borderRadius: "50%", width: 20, height: 20, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>{itemCount}</span>}
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <div style={{ background: "linear-gradient(135deg,#2c1810 0%,#5a2d0c 50%,#8B1A4A 100%)", padding: "64px 28px", textAlign: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: 6, color: "#B8860B", textTransform: "uppercase", marginBottom: 10 }}>Festive Collection 2025</div>
        <h1 style={{ fontFamily: "Cormorant Garamond", fontSize: 52, fontWeight: 300, color: "#f5e6d3", margin: "0 0 12px", lineHeight: 1.1 }}>
          Draped in<br /><em style={{ fontWeight: 600, color: "#DAA520" }}>Timeless Grace</em>
        </h1>
        <p style={{ color: "#d4b896", fontSize: 16, maxWidth: 440, margin: "0 auto 26px", lineHeight: 1.7 }}>
          Handcrafted sarees &amp; jewellery from India's finest artisans.<br />Free shipping above Rs. 1,999
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => handleCategoryClick("sarees")}
            style={{ background: "#B8860B", border: "none", color: "#fff", padding: "12px 28px", borderRadius: 4, cursor: "pointer", fontFamily: "Cormorant Garamond", fontSize: 16 }}>
            Shop Sarees
          </button>
          <button onClick={() => handleCategoryClick("jewellery")}
            style={{ background: "transparent", border: "2px solid #B8860B", color: "#DAA520", padding: "12px 28px", borderRadius: 4, cursor: "pointer", fontFamily: "Cormorant Garamond", fontSize: 16 }}>
            Shop Jewellery
          </button>
          <a href={SITE_CONFIG.whatsapp.link} target="_blank" rel="noreferrer"
            style={{ background: "#25D366", color: "#fff", padding: "12px 28px", borderRadius: 4, fontFamily: "Cormorant Garamond", fontSize: 16, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
            <IconWhatsApp /> Order on WhatsApp
          </a>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 36, marginTop: 32, flexWrap: "wrap" }}>
          <a href={SITE_CONFIG.social.instagram.url} target="_blank" rel="noreferrer" style={{ textAlign: "center", textDecoration: "none" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}><IconInstagram size={22} /></div>
            <div style={{ fontSize: 12, color: "#B8860B" }}>@rj_alankara</div>
            <div style={{ fontSize: 11, color: "#8B6040" }}>Instagram</div>
          </a>
          <a href={SITE_CONFIG.social.facebook.url} target="_blank" rel="noreferrer" style={{ textAlign: "center", textDecoration: "none" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}><IconFacebook size={22} /></div>
            <div style={{ fontSize: 12, color: "#B8860B" }}>rj_alankara</div>
            <div style={{ fontSize: 11, color: "#8B6040" }}>Facebook</div>
          </a>
          <a href={SITE_CONFIG.whatsapp.link} target="_blank" rel="noreferrer" style={{ textAlign: "center", textDecoration: "none" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}><IconWhatsApp size={22} /></div>
            <div style={{ fontSize: 12, color: "#B8860B" }}>+91 93810 21541</div>
            <div style={{ fontSize: 11, color: "#8B6040" }}>WhatsApp</div>
          </a>
        </div>
      </div>

      {/* ── TRUST BADGES ── */}
      <div style={{ display: "flex", justifyContent: "center", gap: 36, padding: "14px 28px", borderBottom: "1px solid #e8d5bf", flexWrap: "wrap" }}>
        {[["Free Shipping","Above Rs. 1,999"],["7-Day Returns","Easy returns"],["100% Authentic","Handcrafted"],["Secure Payment","UPI & Cards"],["WhatsApp Support","+91 93810 21541"]].map(([title, sub]) => (
          <div key={title} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{title}</div>
            <div style={{ fontSize: 11, color: "#8B6040" }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* ── CATEGORY TABS ── */}
      <div id="products-section" style={{ display: "flex", justifyContent: "center", gap: 8, padding: "20px 28px 8px" }}>
        {CATEGORIES.map(c => (
          <button key={c.key} onClick={() => setCategory(c.key)}
            style={{ padding: "9px 24px", borderRadius: 4, border: category === c.key ? "2px solid #B8860B" : "1.5px solid #d4b896", background: category === c.key ? "#B8860B" : "transparent", color: category === c.key ? "#fff" : "#8B6040", cursor: "pointer", fontSize: 14, transition: "all 0.2s", fontWeight: category === c.key ? 600 : 400 }}>
            {c.label}
          </button>
        ))}
      </div>

      {/* ── PRODUCT GRID ── */}
      <div style={{ padding: "16px 28px 48px" }}>
        <div style={{ marginBottom: 16, color: "#8B6040", fontSize: 13 }}>
          Showing {filtered.length} {category !== "all" ? category : "products"}
          {search && ` matching "${search}"`}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 22 }}>
          {filtered.map(product => (
            <div key={product.id}
              style={{ background: "#fff", borderRadius: 8, overflow: "hidden", boxShadow: "0 2px 12px rgba(44,24,16,0.08)", transition: "transform 0.2s,box-shadow 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 28px rgba(44,24,16,0.16)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "none"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(44,24,16,0.08)"; }}>
              {/* Product image */}
              <div style={{ position: "relative", height: 220, overflow: "hidden", background: "#f0e6d8" }}>
                <img
                  src={product.images[0]}
                  alt={product.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
                  onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.06)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "none")}
                  onError={e => {
                    // If image fails, show placeholder
                    (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1583391733956-6c78276477e4?w=400&q=80";
                  }}
                />
                <div style={{ position: "absolute", top: 9, left: 9, background: TAG_COLORS[product.tag] || "#B8860B", color: "#fff", padding: "3px 9px", borderRadius: 3, fontSize: 11, fontWeight: 600 }}>{product.tag}</div>
                <button onClick={() => toggle(product)} style={{ position: "absolute", top: 7, right: 7, background: "rgba(255,255,255,0.92)", border: "none", width: 30, height: 30, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IconHeart filled={has(product.id)} />
                </button>
              </div>
              <div style={{ padding: "13px 15px" }}>
                <div style={{ fontSize: 10, color: "#B8860B", letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>{product.subcategory}</div>
                <h3 style={{ fontFamily: "Cormorant Garamond", fontSize: 17, margin: "0 0 4px" }}>{product.name}</h3>
                <p style={{ fontSize: 12, color: "#8B6040", margin: "0 0 8px", lineHeight: 1.5 }}>{product.desc}</p>
                {product.material && <div style={{ fontSize: 11, color: "#aaa", marginBottom: 8 }}>{product.material}</div>}
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 11 }}>
                  <span style={{ fontSize: 18, fontWeight: 600 }}>{formatCurrency(product.price)}</span>
                  <span style={{ fontSize: 12, color: "#bbb", textDecoration: "line-through" }}>{formatCurrency(product.originalPrice)}</span>
                  <span style={{ fontSize: 11, background: "#e8f5e9", color: "#2E7D5C", padding: "2px 5px", borderRadius: 3, fontWeight: 600 }}>{getDiscountPercent(product.price, product.originalPrice)}% OFF</span>
                </div>
                <div style={{ display: "flex", gap: 7 }}>
                  <button onClick={() => handleAddToCart(product)}
                    style={{ flex: 2, background: "#2c1810", color: "#f5e6d3", border: "none", padding: "9px 0", borderRadius: 4, cursor: "pointer", fontSize: 13, transition: "background 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#B8860B")}
                    onMouseLeave={e => (e.currentTarget.style.background = "#2c1810")}>
                    Add to Cart
                  </button>
                  <button onClick={() => handleWhatsApp(product)} title="Order on WhatsApp"
                    style={{ flex: 1, background: "#25D366", color: "#fff", border: "none", padding: "9px 0", borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <IconWhatsApp />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0", color: "#8B6040", fontSize: 18 }}>
              No products found{search ? ` for "${search}"` : ""}
            </div>
          )}
        </div>
      </div>

      {/* ── CART DRAWER ── */}
      {cartOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500 }}>
          <div onClick={() => setCartOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 380, background: "#fdf6ef", display: "flex", flexDirection: "column", boxShadow: "-4px 0 24px rgba(0,0,0,0.2)" }}>
            <div style={{ padding: "16px 20px", background: "#2c1810", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "Cormorant Garamond", fontSize: 20, color: "#f5e6d3" }}>Your Cart ({itemCount})</span>
              <button onClick={() => setCartOpen(false)} style={{ background: "none", border: "none", color: "#f5e6d3", fontSize: 22, cursor: "pointer" }}>x</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px" }}>
              {items.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#8B6040" }}>
                  <div style={{ fontFamily: "Cormorant Garamond", fontSize: 20, marginBottom: 10 }}>Your cart is empty</div>
                  <button onClick={() => setCartOpen(false)} style={{ background: "#B8860B", color: "#fff", border: "none", padding: "9px 20px", borderRadius: 4, cursor: "pointer", fontFamily: "Cormorant Garamond", fontSize: 15 }}>Browse Products</button>
                </div>
              ) : items.map(item => (
                <div key={item.product.id} style={{ display: "flex", gap: 11, marginBottom: 12, background: "#fff", borderRadius: 8, padding: 11 }}>
                  <img src={item.product.images[0]} alt={item.product.name} style={{ width: 65, height: 65, objectFit: "cover", borderRadius: 6 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "Cormorant Garamond", fontSize: 15, marginBottom: 2 }}>{item.product.name}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#B8860B", marginBottom: 7 }}>{formatCurrency(item.product.price)} each</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <button onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))} style={{ width: 26, height: 26, border: "1px solid #d4b896", borderRadius: 4, cursor: "pointer", background: "#fff", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>-</button>
                      <span style={{ fontWeight: 600, minWidth: 20, textAlign: "center" }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} style={{ width: 26, height: 26, border: "1px solid #d4b896", borderRadius: 4, cursor: "pointer", background: "#fff", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                      <span style={{ marginLeft: "auto", fontSize: 13, fontWeight: 600 }}>{formatCurrency(item.product.price * item.quantity)}</span>
                      <button onClick={() => removeItem(item.product.id)} style={{ background: "none", border: "none", color: "#C0392B", cursor: "pointer", fontSize: 12 }}>x</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {items.length > 0 && (
              <div style={{ padding: "16px 18px", borderTop: "1px solid #e8d5bf" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13 }}><span style={{ color: "#8B6040" }}>Subtotal ({itemCount} items)</span><span>{formatCurrency(total)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 13 }}><span style={{ color: "#8B6040" }}>Shipping</span><span style={{ color: shipping === 0 ? "#2E7D5C" : "#2c1810", fontWeight: 600 }}>{shipping === 0 ? "FREE" : formatCurrency(shipping)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, fontFamily: "Cormorant Garamond", fontSize: 20, fontWeight: 600 }}><span>Total</span><span style={{ color: "#B8860B" }}>{formatCurrency(grandTotal)}</span></div>
                <button onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}
                  style={{ width: "100%", background: "#B8860B", color: "#fff", border: "none", padding: "13px 0", borderRadius: 4, cursor: "pointer", fontFamily: "Cormorant Garamond", fontSize: 17, marginBottom: 8 }}>
                  Proceed to Checkout
                </button>
                <a href={SITE_CONFIG.whatsapp.link + "?text=" + encodeURIComponent("Hi! I want to order:\n" + items.map(i => "- " + i.product.name + " x" + i.quantity + " = " + formatCurrency(i.product.price * i.quantity)).join("\n") + "\n\nTotal: " + formatCurrency(grandTotal))}
                  target="_blank" rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#25D366", color: "#fff", padding: "11px 0", borderRadius: 4, textDecoration: "none", fontSize: 14, boxSizing: "border-box" }}>
                  <IconWhatsApp /> Order via WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CHECKOUT MODAL ── */}
      {checkoutOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={resetCheckout} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} />
          <div style={{ position: "relative", background: "#fdf6ef", borderRadius: 12, width: "100%", maxWidth: 500, maxHeight: "93vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
            {orderDone ? (
              /* ── ORDER SUCCESS ── */
              <div style={{ padding: "48px 32px", textAlign: "center" }}>
                <div style={{ width: 64, height: 64, background: "#e8f5e9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28 }}>
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#2E7D5C" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h2 style={{ fontFamily: "Cormorant Garamond", fontSize: 28, color: "#2E7D5C", marginBottom: 6 }}>Order Placed!</h2>
                <div style={{ fontSize: 13, color: "#B8860B", marginBottom: 10, fontWeight: 600 }}>Order #{orderDone}</div>
                <p style={{ color: "#8B6040", lineHeight: 1.7, marginBottom: 16 }}>Thank you, {form.name}!<br />WhatsApp confirmation opening now...</p>
                <div style={{ background: "#e8f5e9", borderRadius: 8, padding: "12px 18px", marginBottom: 18, fontSize: 13, color: "#2E7D5C" }}>Delivery in 5-7 business days</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  <a href={SITE_CONFIG.social.instagram.url} target="_blank" rel="noreferrer" style={{ flex: 1, background: "#833AB4", color: "#fff", padding: "9px 0", borderRadius: 6, textAlign: "center", textDecoration: "none", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}><IconInstagram size={14} /> Follow @rj_alankara</a>
                  <a href={SITE_CONFIG.social.facebook.url} target="_blank" rel="noreferrer" style={{ flex: 1, background: "#1877F2", color: "#fff", padding: "9px 0", borderRadius: 6, textAlign: "center", textDecoration: "none", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}><IconFacebook size={14} /> Like on Facebook</a>
                </div>
                <button onClick={resetCheckout} style={{ background: "#2c1810", color: "#f5e6d3", border: "none", padding: "10px 28px", borderRadius: 4, cursor: "pointer", fontFamily: "Cormorant Garamond", fontSize: 15 }}>Continue Shopping</button>
              </div>
            ) : (
              <>
                {/* Header */}
                <div style={{ padding: "16px 22px", background: "#2c1810", borderRadius: "12px 12px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "Cormorant Garamond", fontSize: 19, color: "#f5e6d3" }}>{payStep === 1 ? "Delivery Details" : "Payment"}</span>
                  <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                    {([1,2] as const).map(s => <div key={s} style={{ width: s <= payStep ? 28 : 16, height: 5, borderRadius: 3, background: s <= payStep ? "#B8860B" : "rgba(255,255,255,0.3)", transition: "all 0.3s" }} />)}
                    <button onClick={resetCheckout} style={{ background: "none", border: "none", color: "#f5e6d3", fontSize: 20, cursor: "pointer", marginLeft: 8 }}>x</button>
                  </div>
                </div>
                <div style={{ padding: "22px" }}>
                  {/* ── STEP 1: DELIVERY ── */}
                  {payStep === 1 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div><label style={{ fontSize: 11, color: "#8B6040", display: "block", marginBottom: 4, fontWeight: 600 }}>Full Name *</label><input style={inp} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Priya Sharma" /></div>
                        <div><label style={{ fontSize: 11, color: "#8B6040", display: "block", marginBottom: 4, fontWeight: 600 }}>Phone *</label><input style={inp} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="93810 21541" /></div>
                      </div>
                      <div><label style={{ fontSize: 11, color: "#8B6040", display: "block", marginBottom: 4, fontWeight: 600 }}>Email</label><input style={inp} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="priya@example.com" /></div>
                      <div><label style={{ fontSize: 11, color: "#8B6040", display: "block", marginBottom: 4, fontWeight: 600 }}>Delivery Address *</label><textarea style={{ ...inp, resize: "none", height: "68px" } as React.CSSProperties} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="House No, Street, Area, Landmark..." /></div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div><label style={{ fontSize: 11, color: "#8B6040", display: "block", marginBottom: 4, fontWeight: 600 }}>City *</label><input style={inp} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} placeholder="Hyderabad" /></div>
                        <div><label style={{ fontSize: 11, color: "#8B6040", display: "block", marginBottom: 4, fontWeight: 600 }}>Pincode *</label><input style={inp} value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} placeholder="500001" /></div>
                      </div>
                      <div><label style={{ fontSize: 11, color: "#8B6040", display: "block", marginBottom: 4, fontWeight: 600 }}>State *</label>
                        <select style={inp} value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}>
                          <option value="">Select State</option>
                          {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      {/* Order summary */}
                      <div style={{ background: "#fff", borderRadius: 8, padding: "12px 14px", border: "1px solid #e8d5bf" }}>
                        <div style={{ fontFamily: "Cormorant Garamond", fontSize: 15, marginBottom: 8 }}>Order Summary</div>
                        {items.map(i => <div key={i.product.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#8B6040", marginBottom: 3 }}><span>{i.product.name} x {i.quantity}</span><span style={{ fontWeight: 600 }}>{formatCurrency(i.product.price * i.quantity)}</span></div>)}
                        <div style={{ borderTop: "1px solid #e8d5bf", marginTop: 7, paddingTop: 7, display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 15, color: "#B8860B" }}><span>Total</span><span>{formatCurrency(grandTotal)}</span></div>
                      </div>
                      <button onClick={() => { if (form.name && form.phone && form.address && form.city && form.state && form.pincode) setPayStep(2); else showToast("Please fill all required fields"); }}
                        style={{ width: "100%", background: "#B8860B", color: "#fff", border: "none", padding: "13px 0", borderRadius: 4, cursor: "pointer", fontFamily: "Cormorant Garamond", fontSize: 17 }}>
                        Continue to Payment
                      </button>
                    </div>
                  )}

                  {/* ── STEP 2: PAYMENT ── */}
                  {payStep === 2 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {/* Method tabs */}
                      <div style={{ display: "flex", gap: 7 }}>
                        {([["upi","UPI / QR"],["card","Card"],["cod","Cash on Delivery"]] as [PaymentMethod,string][]).map(([val,label]) => (
                          <button key={val} onClick={() => setPayMethod(val)}
                            style={{ flex: 1, padding: "9px 4px", border: payMethod === val ? "2px solid #B8860B" : "1.5px solid #d4b896", borderRadius: 6, background: payMethod === val ? "#fff8ee" : "#fff", cursor: "pointer", fontSize: 12, color: payMethod === val ? "#B8860B" : "#8B6040", fontWeight: payMethod === val ? 600 : 400 }}>
                            {label}
                          </button>
                        ))}
                      </div>

                      {/* ── UPI PAYMENT ── */}
                      {payMethod === "upi" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {/* Amount to pay */}
                          <div style={{ background: "#B8860B", borderRadius: 8, padding: "14px 18px", textAlign: "center", color: "#fff" }}>
                            <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 4 }}>Amount to Pay</div>
                            <div style={{ fontFamily: "Cormorant Garamond", fontSize: 28, fontWeight: 600 }}>{formatCurrency(grandTotal)}</div>
                          </div>

                          {/* UPI options */}
                          <div style={{ background: "#fff", borderRadius: 8, padding: "16px", border: "1px solid #e8d5bf" }}>
                            <div style={{ fontFamily: "Cormorant Garamond", fontSize: 16, marginBottom: 12, color: "#2c1810" }}>Pay via UPI</div>

                            {/* UPI ID */}
                            <div style={{ background: "#fff8ee", borderRadius: 6, padding: "10px 14px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px dashed #B8860B" }}>
                              <div>
                                <div style={{ fontSize: 11, color: "#8B6040", marginBottom: 2 }}>UPI ID</div>
                                <div style={{ fontWeight: 700, fontSize: 16, color: "#2c1810", fontFamily: "monospace" }}>{PAYMENT_DETAILS.upiId}</div>
                              </div>
                              <button onClick={() => { navigator.clipboard.writeText(PAYMENT_DETAILS.upiId); showToast("UPI ID copied!"); }}
                                style={{ background: "#B8860B", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>
                                Copy
                              </button>
                            </div>

                            {/* App buttons */}
                            <div style={{ fontSize: 12, color: "#8B6040", marginBottom: 8 }}>Open in your UPI app and pay to this number:</div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                              {[
                                { name: "Google Pay", number: PAYMENT_DETAILS.googlePay, color: "#4285F4", link: "gpay://upi/pay?pa=" + PAYMENT_DETAILS.upiId + "&pn=RiyaJasmin&am=" + grandTotal + "&cu=INR" },
                                { name: "PhonePe", number: PAYMENT_DETAILS.phonePe, color: "#5f259f", link: "phonepe://pay?pa=" + PAYMENT_DETAILS.upiId + "&pn=RiyaJasmin&am=" + grandTotal + "&cu=INR" },
                                { name: "Paytm", number: PAYMENT_DETAILS.paytm, color: "#00BAF2", link: "paytm://pay?pa=" + PAYMENT_DETAILS.upiId + "&pn=RiyaJasmin&am=" + grandTotal + "&cu=INR" },
                                { name: "BHIM UPI", number: PAYMENT_DETAILS.upiId, color: "#FF6B35", link: "upi://pay?pa=" + PAYMENT_DETAILS.upiId + "&pn=RiyaJasmin&am=" + grandTotal + "&cu=INR" },
                              ].map(app => (
                                <a key={app.name} href={app.link}
                                  style={{ background: app.color, color: "#fff", padding: "10px 8px", borderRadius: 6, textDecoration: "none", textAlign: "center", fontSize: 13, fontWeight: 600 }}>
                                  {app.name}<br />
                                  <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.9 }}>{app.number}</span>
                                </a>
                              ))}
                            </div>

                            {/* Bank transfer */}
                            <div style={{ marginTop: 14, padding: "12px", background: "#f9f5f0", borderRadius: 6, fontSize: 12, color: "#8B6040" }}>
                              <div style={{ fontWeight: 600, color: "#2c1810", marginBottom: 6 }}>Bank Transfer (NEFT/IMPS)</div>
                              <div>Bank: {PAYMENT_DETAILS.bankName}</div>
                              <div>Name: {PAYMENT_DETAILS.accountName}</div>
                              <div>A/C: {PAYMENT_DETAILS.accountNumber}</div>
                              <div>IFSC: {PAYMENT_DETAILS.ifsc}</div>
                            </div>
                          </div>

                          {/* Payment screenshot confirmation */}
                          <div style={{ background: "#e8f5e9", borderRadius: 8, padding: "14px", border: "1px solid #c8e6c9" }}>
                            <div style={{ fontSize: 13, color: "#2E7D5C", fontWeight: 600, marginBottom: 6 }}>After paying:</div>
                            <div style={{ fontSize: 12, color: "#2E7D5C", lineHeight: 1.7 }}>
                              Send your payment screenshot to WhatsApp +91 93810 21541<br />
                              Your order will be confirmed within 1 hour.
                            </div>
                            <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, cursor: "pointer" }}>
                              <input type="checkbox" checked={paymentConfirmed} onChange={e => setPaymentConfirmed(e.target.checked)}
                                style={{ width: 16, height: 16, cursor: "pointer" }} />
                              <span style={{ fontSize: 12, color: "#2E7D5C" }}>I have paid {formatCurrency(grandTotal)} and will send screenshot</span>
                            </label>
                          </div>

                          <div style={{ display: "flex", gap: 9 }}>
                            <button onClick={() => setPayStep(1)} style={{ flex: 1, background: "#fff", color: "#2c1810", border: "1.5px solid #d4b896", padding: "11px 0", borderRadius: 4, cursor: "pointer", fontFamily: "Cormorant Garamond", fontSize: 15 }}>Back</button>
                            <button onClick={handlePlaceOrder} disabled={!paymentConfirmed}
                              style={{ flex: 2, background: paymentConfirmed ? "#2E7D5C" : "#ccc", color: "#fff", border: "none", padding: "11px 0", borderRadius: 4, cursor: paymentConfirmed ? "pointer" : "not-allowed", fontFamily: "Cormorant Garamond", fontSize: 16 }}>
                              Confirm Order
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ── CARD ── */}
                      {payMethod === "card" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          <div style={{ background: "#fff8ee", borderRadius: 8, padding: "12px 14px", fontSize: 13, color: "#B8860B", border: "1px solid #e8d5bf" }}>
                            Card payments via Razorpay — coming soon!<br />
                            <span style={{ fontSize: 12 }}>For now, please use UPI or WhatsApp to order.</span>
                          </div>
                          <div><label style={{ fontSize: 11, color: "#8B6040", display: "block", marginBottom: 4, fontWeight: 600 }}>Card Number</label><input style={inp} value={cardNum} onChange={e => setCardNum(e.target.value.replace(/\D/g,"").replace(/(.{4})/g,"$1 ").trim())} placeholder="1234 5678 9012 3456" maxLength={19} /></div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                            <div><label style={{ fontSize: 11, color: "#8B6040", display: "block", marginBottom: 4, fontWeight: 600 }}>Expiry</label><input style={inp} value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} placeholder="MM/YY" /></div>
                            <div><label style={{ fontSize: 11, color: "#8B6040", display: "block", marginBottom: 4, fontWeight: 600 }}>CVV</label><input style={inp} type="password" value={cardCvv} onChange={e => setCardCvv(e.target.value)} placeholder="***" maxLength={3} /></div>
                          </div>
                          <div style={{ display: "flex", gap: 9 }}>
                            <button onClick={() => setPayStep(1)} style={{ flex: 1, background: "#fff", color: "#2c1810", border: "1.5px solid #d4b896", padding: "11px 0", borderRadius: 4, cursor: "pointer", fontFamily: "Cormorant Garamond", fontSize: 15 }}>Back</button>
                            <button onClick={handlePlaceOrder} style={{ flex: 2, background: "#2E7D5C", color: "#fff", border: "none", padding: "11px 0", borderRadius: 4, cursor: "pointer", fontFamily: "Cormorant Garamond", fontSize: 16 }}>Place Order</button>
                          </div>
                        </div>
                      )}

                      {/* ── COD ── */}
                      {payMethod === "cod" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          <div style={{ background: "#fff8ee", border: "1px solid #e8d5bf", borderRadius: 8, padding: "20px", textAlign: "center" }}>
                            <div style={{ fontFamily: "Cormorant Garamond", fontSize: 20, marginBottom: 6, color: "#2c1810" }}>Cash on Delivery</div>
                            <div style={{ fontSize: 28, fontWeight: 700, color: "#B8860B", marginBottom: 6 }}>{formatCurrency(grandTotal + 49)}</div>
                            <div style={{ fontSize: 13, color: "#8B6040" }}>Includes Rs. 49 COD handling fee<br />Pay cash when your order arrives</div>
                          </div>
                          <div style={{ display: "flex", gap: 9 }}>
                            <button onClick={() => setPayStep(1)} style={{ flex: 1, background: "#fff", color: "#2c1810", border: "1.5px solid #d4b896", padding: "11px 0", borderRadius: 4, cursor: "pointer", fontFamily: "Cormorant Garamond", fontSize: 15 }}>Back</button>
                            <button onClick={handlePlaceOrder} style={{ flex: 2, background: "#2E7D5C", color: "#fff", border: "none", padding: "11px 0", borderRadius: 4, cursor: "pointer", fontFamily: "Cormorant Garamond", fontSize: 16 }}>Place Order</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer style={{ background: "#2c1810", color: "#d4b896", padding: "40px 28px 24px", marginTop: 32 }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 28, marginBottom: 28 }}>
            <div>
              <div style={{ fontFamily: "Cormorant Garamond", fontSize: 18, color: "#DAA520", marginBottom: 7 }}>Riya Jasmin Vastraabharana</div>
              <p style={{ fontSize: 12, color: "#8B6040", lineHeight: 1.7 }}>Bringing India's finest weavers and jewellers to your doorstep.</p>
              <div style={{ marginTop: 12, fontSize: 12, color: "#8B6040" }}>
                <div style={{ marginBottom: 3 }}>UPI: {PAYMENT_DETAILS.upiId}</div>
                <div>GPay / PhonePe: {PAYMENT_DETAILS.phonePe}</div>
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "Cormorant Garamond", fontSize: 15, color: "#f5e6d3", marginBottom: 10 }}>Contact</div>
              <a href={SITE_CONFIG.whatsapp.link} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, color: "#25D366", textDecoration: "none", fontSize: 13, marginBottom: 6 }}><IconWhatsApp /> +91 93810 21541</a>
              <a href={"mailto:" + SITE_CONFIG.email} style={{ display: "block", color: "#d4b896", textDecoration: "none", fontSize: 13 }}>{SITE_CONFIG.email}</a>
            </div>
            <div>
              <div style={{ fontFamily: "Cormorant Garamond", fontSize: 15, color: "#f5e6d3", marginBottom: 10 }}>Follow Us</div>
              <a href={SITE_CONFIG.social.instagram.url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, color: "#E1306C", textDecoration: "none", fontSize: 13, marginBottom: 6 }}><IconInstagram /> @rj_alankara</a>
              <a href={SITE_CONFIG.social.facebook.url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, color: "#1877F2", textDecoration: "none", fontSize: 13 }}><IconFacebook /> rj_alankara</a>
            </div>
          </div>
          <div style={{ borderTop: "1px solid #3a2010", paddingTop: 16, textAlign: "center", fontSize: 11, color: "#5a3a2a" }}>
            &copy; 2025 Riya Jasmin Vastraabharana. All rights reserved. Handcrafted with love in India.
          </div>
        </div>
      </footer>
    </div>
  );
}

import { useState, useMemo } from "react";
import { useCartStore } from "./store/useCartStore";
import { useWishlistStore } from "./store/useWishlistStore";
import { formatCurrency, getDiscountPercent, calculateShipping, generateOrderNumber } from "./utils";
import { SITE_CONFIG } from "./config/site";
import type { Product, OrderForm, PaymentMethod } from "./types";

const PRODUCTS: Product[] = [
  { id: "e001", sku: "RJV-EAR-001", name: "Pearl Drop Earrings", slug: "pearl-drop-earrings", price: 3299, originalPrice: 5000, images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80"], tag: "Trending", desc: "Freshwater pearls, sterling silver base", stock: 24, material: "Sterling Silver", occasion: ["Wedding","Festive"], category: "jewellery", subcategory: "earrings", whatsapp: "Hi! I want to order Pearl Drop Earrings (RJV-EAR-001) Rs 3299" },
  { id: "e002", sku: "RJV-EAR-002", name: "Kundan Jhumkas", slug: "kundan-jhumkas", price: 2199, originalPrice: 3500, images: ["https://images.unsplash.com/photo-1601121141461-9d6647bef0a1?w=400&q=80"], tag: "Bestseller", desc: "Traditional Rajasthani gold plated jhumkas", stock: 15, material: "Gold Plated", occasion: ["Wedding","Festive","Bridal"], category: "jewellery", subcategory: "earrings", whatsapp: "Hi! I want to order Kundan Jhumkas (RJV-EAR-002) Rs 2199" },
  { id: "n001", sku: "RJV-NEC-001", name: "Temple Gold Necklace", slug: "temple-gold-necklace", price: 9499, originalPrice: 14000, images: ["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80"], tag: "Premium", desc: "22K gold plated, south Indian temple style", stock: 10, material: "Gold Plated", occasion: ["Wedding","Bridal","Festive"], category: "jewellery", subcategory: "necklaces", whatsapp: "Hi! I want to order Temple Gold Necklace (RJV-NEC-001) Rs 9499" },
  { id: "b001", sku: "RJV-BAN-001", name: "Polki Diamond Bangles", slug: "polki-diamond-bangles", price: 18999, originalPrice: 28000, images: ["https://images.unsplash.com/photo-1573408301185-9519f94ae9e8?w=400&q=80"], tag: "Premium", desc: "Set of 4, antique finish polki bangles", stock: 6, material: "Gold Plated Brass", occasion: ["Wedding","Bridal"], category: "jewellery", subcategory: "bangles", whatsapp: "Hi! I want to order Polki Bangles (RJV-BAN-001) Rs 18999" },
  { id: "s001", sku: "RJV-SAR-KAN-001", name: "Ruby Red Kanjivaram", slug: "ruby-red-kanjivaram", price: 8499, originalPrice: 12000, images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&q=80"], tag: "Bestseller", desc: "Pure Zari work bridal Kanjivaram silk saree", stock: 8, material: "Pure Mulberry Silk", occasion: ["Wedding","Bridal","Festive"], category: "sarees", subcategory: "kanjivaram", whatsapp: "Hi! I want to order Ruby Red Kanjivaram (RJV-SAR-KAN-001) Rs 8499" },
  { id: "s002", sku: "RJV-SAR-BAN-001", name: "Royal Blue Banarasi", slug: "royal-blue-banarasi", price: 6299, originalPrice: 9500, images: ["https://images.unsplash.com/photo-1583391733956-6c78276477e4?w=400&q=80"], tag: "New", desc: "Handwoven Banarasi silk with golden brocade", stock: 12, material: "Pure Silk", occasion: ["Wedding","Festive","Reception"], category: "sarees", subcategory: "banarasi", whatsapp: "Hi! I want to order Royal Blue Banarasi (RJV-SAR-BAN-001) Rs 6299" },
  { id: "s003", sku: "RJV-SAR-COT-001", name: "Sage Green Chanderi Cotton", slug: "sage-green-chanderi", price: 2799, originalPrice: 4200, images: ["https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&q=80"], tag: "Sale", desc: "Lightweight Chanderi cotton, office and casual wear", stock: 30, material: "Chanderi Cotton", occasion: ["Daily","Office","Casual"], category: "sarees", subcategory: "cotton", whatsapp: "Hi! I want to order Sage Green Chanderi (RJV-SAR-COT-001) Rs 2799" },
  { id: "s004", sku: "RJV-SAR-MYS-001", name: "Mysore Crepe Silk", slug: "mysore-crepe-silk", price: 4599, originalPrice: 6800, images: ["https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400&q=80"], tag: "New", desc: "Traditional temple border, pure Mysore silk", stock: 18, material: "Pure Silk", occasion: ["Festive","Wedding","Puja"], category: "sarees", subcategory: "mysore-silk", whatsapp: "Hi! I want to order Mysore Crepe Silk (RJV-SAR-MYS-001) Rs 4599" },
];

const TAG_COLORS: Record<string, string> = {
  Bestseller: "#B8860B", New: "#2E7D5C", Sale: "#C0392B", Premium: "#6B1A8B", Trending: "#1A3A6B",
};

const CATEGORIES = [
  { key: "all", label: "All Products" },
  { key: "sarees", label: "Sarees" },
  { key: "jewellery", label: "Jewellery" },
];

const INDIAN_STATES = ["Andhra Pradesh","Assam","Bihar","Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Odisha","Punjab","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","Uttarakhand","West Bengal"];

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
  const [upiId, setUpiId] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2800); };

  const filtered = useMemo(() =>
    PRODUCTS.filter(p =>
      (category === "all" || p.category === category) &&
      p.name.toLowerCase().includes(search.toLowerCase())
    ), [category, search]);

  const shipping = calculateShipping(total);
  const grandTotal = total + shipping;

  const handleAddToCart = (p: Product) => { addItem(p); showToast(p.name + " added to cart!"); };
  const handleWhatsApp = (p: Product) => { window.open(SITE_CONFIG.whatsapp.link + "?text=" + encodeURIComponent(p.whatsapp || ""), "_blank"); };

  const handlePlaceOrder = () => {
    const orderNum = generateOrderNumber();
    const msg = "New Order #" + orderNum + "\nCustomer: " + form.name + "\nPhone: " + form.phone + "\nAddress: " + form.address + ", " + form.city + ", " + form.state + " - " + form.pincode + "\n\nItems:\n" + items.map(i => "- " + i.product.name + " x" + i.quantity + " = " + formatCurrency(i.product.price * i.quantity)).join("\n") + "\n\nTotal: " + formatCurrency(grandTotal) + "\nPayment: " + payMethod.toUpperCase();
    clearCart();
    setOrderDone(orderNum);
    setTimeout(() => { window.open(SITE_CONFIG.whatsapp.link + "?text=" + encodeURIComponent(msg), "_blank"); }, 1500);
  };

  const resetCheckout = () => { setCheckoutOpen(false); setPayStep(1); setOrderDone(""); setForm({ name: "", email: "", phone: "", address: "", city: "", state: "", pincode: "" }); };

  const inp = { padding: "10px 12px", borderRadius: "6px", border: "1.5px solid #d4b896", fontFamily: "inherit", fontSize: "14px", color: "#2c1810", background: "#fffaf5", outline: "none", width: "100%", boxSizing: "border-box" as const };

  return (
    <div style={{ minHeight: "100vh", background: "#fdf6ef", fontFamily: "'EB Garamond', Georgia, serif", color: "#2c1810" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=EB+Garamond:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* Toast */}
      {toast && <div style={{ position: "fixed", top: 20, right: 20, background: "#2c1810", color: "#f5e6d3", padding: "12px 20px", borderRadius: 8, zIndex: 9999, fontSize: 15, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>{toast}</div>}

      {/* HEADER */}
      <header style={{ background: "#2c1810", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(0,0,0,0.4)", flexWrap: "wrap", gap: 8, minHeight: 64 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#B8860B,#DAA520)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>ðŸª·</div>
          <div>
            <div style={{ fontFamily: "Cormorant Garamond", fontSize: 15, fontWeight: 600, color: "#f5e6d3", letterSpacing: 1 }}>RIYA JASMIN VASTRAABHARANA</div>
            <div style={{ fontSize: 9, color: "#B8860B", letterSpacing: 3, textTransform: "uppercase" }}>Sarees & Jewellery</div>
          </div>
        </div>
        <input placeholder="Search sarees, jewellery..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, maxWidth: 320, margin: "0 16px", padding: "7px 14px", borderRadius: 24, border: "1.5px solid #4a2e1a", background: "rgba(255,255,255,0.07)", color: "#f5e6d3", fontSize: 13, outline: "none" }} />
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a href={SITE_CONFIG.social.instagram.url} target="_blank" rel="noreferrer" title="Instagram @rj_alankara" style={{ color: "#d4b896", fontSize: 18, textDecoration: "none" }}>ðŸ“·</a>
          <a href={SITE_CONFIG.social.facebook.url} target="_blank" rel="noreferrer" title="Facebook rj_alankara" style={{ color: "#d4b896", fontSize: 18, textDecoration: "none" }}>ðŸ“˜</a>
          <a href={SITE_CONFIG.whatsapp.link} target="_blank" rel="noreferrer" title="WhatsApp" style={{ color: "#d4b896", fontSize: 18, textDecoration: "none" }}>ðŸ’¬</a>
          <button onClick={() => setCartOpen(true)} style={{ background: "#B8860B", border: "none", color: "#fff", padding: "7px 16px", borderRadius: 24, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
            Cart {itemCount > 0 && <span style={{ background: "#C0392B", borderRadius: "50%", width: 20, height: 20, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>{itemCount}</span>}
          </button>
        </div>
      </header>

      {/* HERO */}
      <div style={{ background: "linear-gradient(135deg,#2c1810 0%,#5a2d0c 50%,#8B1A4A 100%)", padding: "60px 28px", textAlign: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: 6, color: "#B8860B", textTransform: "uppercase", marginBottom: 10 }}>Festive Collection 2025</div>
        <h1 style={{ fontFamily: "Cormorant Garamond", fontSize: 50, fontWeight: 300, color: "#f5e6d3", margin: "0 0 12px", lineHeight: 1.1 }}>
          Draped in<br /><em style={{ fontWeight: 600, color: "#DAA520" }}>Timeless Grace</em>
        </h1>
        <p style={{ color: "#d4b896", fontSize: 16, maxWidth: 440, margin: "0 auto 24px", lineHeight: 1.7 }}>
          Handcrafted sarees & jewellery from India&apos;s finest artisans.<br />Free shipping above â‚¹1,999
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => setCategory("sarees")} style={{ background: "#B8860B", border: "none", color: "#fff", padding: "11px 26px", borderRadius: 4, cursor: "pointer", fontFamily: "Cormorant Garamond", fontSize: 16 }}>ðŸ¥» Shop Sarees</button>
          <button onClick={() => setCategory("jewellery")} style={{ background: "transparent", border: "1.5px solid #B8860B", color: "#DAA520", padding: "11px 26px", borderRadius: 4, cursor: "pointer", fontFamily: "Cormorant Garamond", fontSize: 16 }}>ðŸ’Ž Shop Jewellery</button>
          <a href={SITE_CONFIG.whatsapp.link} target="_blank" rel="noreferrer" style={{ background: "#25D366", color: "#fff", padding: "11px 26px", borderRadius: 4, fontFamily: "Cormorant Garamond", fontSize: 16, textDecoration: "none", display: "inline-block" }}>ðŸ’¬ WhatsApp Order</a>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 28, flexWrap: "wrap" }}>
          <a href={SITE_CONFIG.social.instagram.url} target="_blank" rel="noreferrer" style={{ textAlign: "center", textDecoration: "none" }}><div style={{ fontSize: 20 }}>ðŸ“·</div><div style={{ fontSize: 12, color: "#B8860B" }}>@rj_alankara</div><div style={{ fontSize: 11, color: "#8B6040" }}>Instagram</div></a>
          <a href={SITE_CONFIG.social.facebook.url} target="_blank" rel="noreferrer" style={{ textAlign: "center", textDecoration: "none" }}><div style={{ fontSize: 20 }}>ðŸ“˜</div><div style={{ fontSize: 12, color: "#B8860B" }}>rj_alankara</div><div style={{ fontSize: 11, color: "#8B6040" }}>Facebook</div></a>
          <div style={{ textAlign: "center" }}><div style={{ fontSize: 20 }}>ðŸ’¬</div><div style={{ fontSize: 12, color: "#B8860B" }}>+91 93810 21541</div><div style={{ fontSize: 11, color: "#8B6040" }}>WhatsApp</div></div>
        </div>
      </div>

      {/* TRUST BADGES */}
      <div style={{ display: "flex", justifyContent: "center", gap: 32, padding: "14px 28px", borderBottom: "1px solid #e8d5bf", flexWrap: "wrap" }}>
        {[["ðŸšš","Free Shipping","Above â‚¹1,999"],["â†©ï¸","7-Day Returns","Easy returns"],["âœ…","100% Authentic","Handcrafted"],["ðŸ”’","Secure Payment","UPI & Cards"],["ðŸ’¬","WhatsApp Support","+91 93810 21541"]].map(([icon,title,sub]) => (
          <div key={title} style={{ textAlign: "center" }}><div style={{ fontSize: 18 }}>{icon}</div><div style={{ fontSize: 12, fontWeight: 600 }}>{title}</div><div style={{ fontSize: 11, color: "#8B6040" }}>{sub}</div></div>
        ))}
      </div>

      {/* CATEGORY TABS */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "20px 28px 8px" }}>
        {CATEGORIES.map(c => (
          <button key={c.key} onClick={() => setCategory(c.key)} style={{ padding: "8px 22px", borderRadius: 4, border: category === c.key ? "2px solid #B8860B" : "1.5px solid #d4b896", background: category === c.key ? "#B8860B" : "transparent", color: category === c.key ? "#fff" : "#8B6040", cursor: "pointer", fontSize: 14, transition: "all 0.2s" }}>
            {c.key === "all" ? "âœ¨ " : c.key === "sarees" ? "ðŸ¥» " : "ðŸ’Ž "}{c.label}
          </button>
        ))}
      </div>

      {/* PRODUCT GRID */}
      <div style={{ padding: "16px 28px 48px" }}>
        <div style={{ marginBottom: 16, color: "#8B6040", fontSize: 13 }}>Showing {filtered.length} products</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 22 }}>
          {filtered.map(product => (
            <div key={product.id} style={{ background: "#fff", borderRadius: 8, overflow: "hidden", boxShadow: "0 2px 12px rgba(44,24,16,0.08)", transition: "transform 0.2s,box-shadow 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 28px rgba(44,24,16,0.16)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "none"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(44,24,16,0.08)"; }}>
              <div style={{ position: "relative", height: 210, overflow: "hidden" }}>
                <img src={product.images[0]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
                  onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.06)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "none")} />
                <div style={{ position: "absolute", top: 9, left: 9, background: TAG_COLORS[product.tag] || "#B8860B", color: "#fff", padding: "3px 9px", borderRadius: 3, fontSize: 11, fontWeight: 600 }}>{product.tag}</div>
                <button onClick={() => toggle(product)} style={{ position: "absolute", top: 7, right: 7, background: "rgba(255,255,255,0.92)", border: "none", width: 30, height: 30, borderRadius: "50%", cursor: "pointer", fontSize: 14 }}>
                  {has(product.id) ? "â¤ï¸" : "ðŸ¤"}
                </button>
              </div>
              <div style={{ padding: "13px 15px" }}>
                <div style={{ fontSize: 10, color: "#B8860B", letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>{product.subcategory}</div>
                <h3 style={{ fontFamily: "Cormorant Garamond", fontSize: 17, margin: "0 0 4px" }}>{product.name}</h3>
                <p style={{ fontSize: 12, color: "#8B6040", margin: "0 0 8px", lineHeight: 1.5 }}>{product.desc}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 11 }}>
                  <span style={{ fontSize: 18, fontWeight: 600 }}>{formatCurrency(product.price)}</span>
                  <span style={{ fontSize: 12, color: "#bbb", textDecoration: "line-through" }}>{formatCurrency(product.originalPrice)}</span>
                  <span style={{ fontSize: 11, background: "#e8f5e9", color: "#2E7D5C", padding: "2px 5px", borderRadius: 3, fontWeight: 600 }}>{getDiscountPercent(product.price, product.originalPrice)}% OFF</span>
                </div>
                <div style={{ display: "flex", gap: 7 }}>
                  <button onClick={() => handleAddToCart(product)} style={{ flex: 2, background: "#2c1810", color: "#f5e6d3", border: "none", padding: "9px 0", borderRadius: 4, cursor: "pointer", fontSize: 13, transition: "background 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#B8860B")}
                    onMouseLeave={e => (e.currentTarget.style.background = "#2c1810")}>Add to Cart</button>
                  <button onClick={() => handleWhatsApp(product)} title="Order on WhatsApp" style={{ flex: 1, background: "#25D366", color: "#fff", border: "none", padding: "9px 0", borderRadius: 4, cursor: "pointer", fontSize: 15 }}>ðŸ’¬</button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0", color: "#8B6040", fontSize: 18 }}>No products found for "{search}"</div>}
        </div>
      </div>

      {/* CART DRAWER */}
      {cartOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500 }}>
          <div onClick={() => setCartOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 380, background: "#fdf6ef", display: "flex", flexDirection: "column", boxShadow: "-4px 0 24px rgba(0,0,0,0.2)" }}>
            <div style={{ padding: "16px 20px", background: "#2c1810", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "Cormorant Garamond", fontSize: 20, color: "#f5e6d3" }}>ðŸ›’ Cart ({itemCount})</span>
              <button onClick={() => setCartOpen(false)} style={{ background: "none", border: "none", color: "#f5e6d3", fontSize: 20, cursor: "pointer" }}>âœ•</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px" }}>
              {items.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#8B6040" }}><div style={{ fontSize: 48, marginBottom: 12 }}>ðŸ›ï¸</div><div style={{ fontFamily: "Cormorant Garamond", fontSize: 20 }}>Your cart is empty</div></div>
              ) : items.map(item => (
                <div key={item.product.id} style={{ display: "flex", gap: 11, marginBottom: 12, background: "#fff", borderRadius: 8, padding: 11 }}>
                  <img src={item.product.images[0]} alt={item.product.name} style={{ width: 65, height: 65, objectFit: "cover", borderRadius: 6 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "Cormorant Garamond", fontSize: 15, marginBottom: 2 }}>{item.product.name}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#B8860B", marginBottom: 7 }}>{formatCurrency(item.product.price)}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <button onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))} style={{ width: 24, height: 24, border: "1px solid #d4b896", borderRadius: 4, cursor: "pointer", background: "#fff" }}>âˆ’</button>
                      <span style={{ fontWeight: 600, minWidth: 18, textAlign: "center" }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} style={{ width: 24, height: 24, border: "1px solid #d4b896", borderRadius: 4, cursor: "pointer", background: "#fff" }}>+</button>
                      <button onClick={() => removeItem(item.product.id)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#C0392B", cursor: "pointer", fontSize: 12 }}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {items.length > 0 && (
              <div style={{ padding: "16px 18px", borderTop: "1px solid #e8d5bf" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13 }}><span style={{ color: "#8B6040" }}>Subtotal</span><span>{formatCurrency(total)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 13 }}><span style={{ color: "#8B6040" }}>Shipping</span><span style={{ color: shipping === 0 ? "#2E7D5C" : "#2c1810", fontWeight: 600 }}>{shipping === 0 ? "FREE" : formatCurrency(shipping)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, fontFamily: "Cormorant Garamond", fontSize: 19, fontWeight: 600 }}><span>Total</span><span>{formatCurrency(grandTotal)}</span></div>
                <button onClick={() => { setCartOpen(false); setCheckoutOpen(true); }} style={{ width: "100%", background: "#B8860B", color: "#fff", border: "none", padding: "12px 0", borderRadius: 4, cursor: "pointer", fontFamily: "Cormorant Garamond", fontSize: 16, marginBottom: 8 }}>Proceed to Checkout â†’</button>
                <a href={SITE_CONFIG.whatsapp.link + "?text=" + encodeURIComponent("Hi! I want to order:\n" + items.map(i => "- " + i.product.name + " x" + i.quantity).join("\n") + "\nTotal: " + formatCurrency(grandTotal))} target="_blank" rel="noreferrer"
                  style={{ display: "block", width: "100%", background: "#25D366", color: "#fff", padding: "10px 0", borderRadius: 4, textAlign: "center", textDecoration: "none", fontSize: 14, boxSizing: "border-box" }}>ðŸ’¬ Order via WhatsApp</a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {checkoutOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={resetCheckout} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} />
          <div style={{ position: "relative", background: "#fdf6ef", borderRadius: 12, width: "100%", maxWidth: 490, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
            {orderDone ? (
              <div style={{ padding: "48px 32px", textAlign: "center" }}>
                <div style={{ fontSize: 56, marginBottom: 14 }}>ðŸŽ‰</div>
                <h2 style={{ fontFamily: "Cormorant Garamond", fontSize: 28, color: "#2E7D5C", marginBottom: 6 }}>Order Placed!</h2>
                <div style={{ fontSize: 13, color: "#B8860B", marginBottom: 10, fontWeight: 600 }}>Order #{orderDone}</div>
                <p style={{ color: "#8B6040", lineHeight: 1.7, marginBottom: 16 }}>Thank you, {form.name}!<br />WhatsApp confirmation sent to +91 {form.phone}</p>
                <div style={{ background: "#e8f5e9", borderRadius: 8, padding: "12px 18px", marginBottom: 18, fontSize: 13, color: "#2E7D5C" }}>ðŸ“¦ Delivery in 5â€“7 business days</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                  <a href={SITE_CONFIG.social.instagram.url} target="_blank" rel="noreferrer" style={{ flex: 1, background: "#833AB4", color: "#fff", padding: "9px 0", borderRadius: 6, textAlign: "center", textDecoration: "none", fontSize: 12 }}>ðŸ“· Follow @rj_alankara</a>
                  <a href={SITE_CONFIG.social.facebook.url} target="_blank" rel="noreferrer" style={{ flex: 1, background: "#1877F2", color: "#fff", padding: "9px 0", borderRadius: 6, textAlign: "center", textDecoration: "none", fontSize: 12 }}>ðŸ“˜ Like on Facebook</a>
                </div>
                <button onClick={resetCheckout} style={{ background: "#2c1810", color: "#f5e6d3", border: "none", padding: "10px 26px", borderRadius: 4, cursor: "pointer", fontFamily: "Cormorant Garamond", fontSize: 15 }}>Continue Shopping</button>
              </div>
            ) : (
              <>
                <div style={{ padding: "16px 22px", background: "#2c1810", borderRadius: "12px 12px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "Cormorant Garamond", fontSize: 19, color: "#f5e6d3" }}>{payStep === 1 ? "ðŸ“¦ Delivery Details" : "ðŸ’³ Payment"}</span>
                  <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                    {([1,2] as const).map(s => <div key={s} style={{ width: s <= payStep ? 26 : 16, height: 5, borderRadius: 3, background: s <= payStep ? "#B8860B" : "rgba(255,255,255,0.3)", transition: "all 0.3s" }} />)}
                    <button onClick={resetCheckout} style={{ background: "none", border: "none", color: "#f5e6d3", fontSize: 18, cursor: "pointer", marginLeft: 8 }}>âœ•</button>
                  </div>
                </div>
                <div style={{ padding: "22px" }}>
                  {payStep === 1 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div><label style={{ fontSize: 11, color: "#8B6040", display: "block", marginBottom: 4, fontWeight: 600 }}>Full Name *</label><input style={inp} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Priya Sharma" /></div>
                        <div><label style={{ fontSize: 11, color: "#8B6040", display: "block", marginBottom: 4, fontWeight: 600 }}>Phone *</label><input style={inp} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="93810 21541" /></div>
                      </div>
                      <div><label style={{ fontSize: 11, color: "#8B6040", display: "block", marginBottom: 4, fontWeight: 600 }}>Email</label><input style={inp} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="priya@example.com" /></div>
                      <div><label style={{ fontSize: 11, color: "#8B6040", display: "block", marginBottom: 4, fontWeight: 600 }}>Address *</label><textarea style={{ ...inp, resize: "none", height: "68px" } as React.CSSProperties} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="House No, Street, Area, Landmark..." /></div>
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
                      <div style={{ background: "#fff", borderRadius: 8, padding: "12px 14px", border: "1px solid #e8d5bf" }}>
                        <div style={{ fontFamily: "Cormorant Garamond", fontSize: 15, marginBottom: 8 }}>Order Summary</div>
                        {items.map(i => <div key={i.product.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#8B6040", marginBottom: 3 }}><span>{i.product.name} Ã— {i.quantity}</span><span>{formatCurrency(i.product.price * i.quantity)}</span></div>)}
                        <div style={{ borderTop: "1px solid #e8d5bf", marginTop: 7, paddingTop: 7, display: "flex", justifyContent: "space-between", fontWeight: 600, fontSize: 14 }}><span>Total</span><span>{formatCurrency(grandTotal)}</span></div>
                      </div>
                      <button onClick={() => { if (form.name && form.phone && form.address && form.city && form.state && form.pincode) setPayStep(2); else showToast("Please fill all required fields"); }} style={{ width: "100%", background: "#B8860B", color: "#fff", border: "none", padding: "12px 0", borderRadius: 4, cursor: "pointer", fontFamily: "Cormorant Garamond", fontSize: 16 }}>Continue to Payment â†’</button>
                    </div>
                  )}
                  {payStep === 2 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ display: "flex", gap: 7 }}>
                        {([["upi","ðŸ“± UPI"],["card","ðŸ’³ Card"],["cod","ðŸ  COD"]] as [PaymentMethod,string][]).map(([val,label]) => (
                          <button key={val} onClick={() => setPayMethod(val)} style={{ flex: 1, padding: "9px 0", border: payMethod === val ? "2px solid #B8860B" : "1.5px solid #d4b896", borderRadius: 6, background: payMethod === val ? "#fff8ee" : "#fff", cursor: "pointer", fontSize: 13, color: payMethod === val ? "#B8860B" : "#8B6040", fontWeight: payMethod === val ? 600 : 400 }}>{label}</button>
                        ))}
                      </div>
                      {payMethod === "upi" && (
                        <div>
                          <label style={{ fontSize: 11, color: "#8B6040", display: "block", marginBottom: 4, fontWeight: 600 }}>UPI ID</label>
                          <input style={inp} value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="name@paytm  /  @gpay  /  @phonepe" />
                          <div style={{ display: "flex", gap: 7, marginTop: 10 }}>
                            {["ðŸ“² GPay","ðŸ’° PhonePe","ðŸ’™ Paytm","ðŸ›ï¸ BHIM"].map(a => <div key={a} style={{ flex: 1, textAlign: "center", fontSize: 11, background: "#fff", border: "1px solid #e8d5bf", borderRadius: 6, padding: "7px 3px", color: "#8B6040" }}>{a}</div>)}
                          </div>
                        </div>
                      )}
                      {payMethod === "card" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          <div><label style={{ fontSize: 11, color: "#8B6040", display: "block", marginBottom: 4, fontWeight: 600 }}>Card Number</label><input style={inp} value={cardNum} onChange={e => setCardNum(e.target.value.replace(/\D/g,"").replace(/(.{4})/g,"$1 ").trim())} placeholder="1234 5678 9012 3456" maxLength={19} /></div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                            <div><label style={{ fontSize: 11, color: "#8B6040", display: "block", marginBottom: 4, fontWeight: 600 }}>Expiry MM/YY</label><input style={inp} value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} placeholder="12/27" /></div>
                            <div><label style={{ fontSize: 11, color: "#8B6040", display: "block", marginBottom: 4, fontWeight: 600 }}>CVV</label><input style={inp} type="password" value={cardCvv} onChange={e => setCardCvv(e.target.value)} placeholder="â€¢â€¢â€¢" maxLength={3} /></div>
                          </div>
                        </div>
                      )}
                      {payMethod === "cod" && (
                        <div style={{ background: "#fff8ee", border: "1px solid #e8d5bf", borderRadius: 8, padding: "16px", textAlign: "center", color: "#8B6040" }}>
                          <div style={{ fontSize: 28, marginBottom: 7 }}>ðŸ </div>
                          <div style={{ fontFamily: "Cormorant Garamond", fontSize: 17, marginBottom: 5 }}>Cash on Delivery</div>
                          <div style={{ fontSize: 13 }}>Pay {formatCurrency(grandTotal + 49)} on delivery<br />(includes â‚¹49 COD fee)</div>
                        </div>
                      )}
                      <div style={{ background: "#e8f5e9", borderRadius: 6, padding: "9px 13px", fontSize: 12, color: "#2E7D5C" }}>ðŸ”’ 100% secure. SSL encrypted.</div>
                      <div style={{ display: "flex", gap: 9 }}>
                        <button onClick={() => setPayStep(1)} style={{ flex: 1, background: "#fff", color: "#2c1810", border: "1.5px solid #d4b896", padding: "10px 0", borderRadius: 4, cursor: "pointer", fontFamily: "Cormorant Garamond", fontSize: 14 }}>â† Back</button>
                        <button onClick={handlePlaceOrder} style={{ flex: 2, background: "#2E7D5C", color: "#fff", border: "none", padding: "10px 0", borderRadius: 4, cursor: "pointer", fontFamily: "Cormorant Garamond", fontSize: 16 }}>
                          {payMethod === "cod" ? "âœ… Place Order" : "ðŸ’³ Pay " + formatCurrency(grandTotal)}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer style={{ background: "#2c1810", color: "#d4b896", padding: "40px 28px 24px", marginTop: 32 }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 28, marginBottom: 28 }}>
            <div>
              <div style={{ fontFamily: "Cormorant Garamond", fontSize: 18, color: "#DAA520", marginBottom: 7 }}>ðŸª· Riya Jasmin Vastraabharana</div>
              <p style={{ fontSize: 12, color: "#8B6040", lineHeight: 1.7 }}>Bringing India&apos;s finest weavers and jewellers to your doorstep.</p>
            </div>
            <div>
              <div style={{ fontFamily: "Cormorant Garamond", fontSize: 15, color: "#f5e6d3", marginBottom: 10 }}>Contact</div>
              <a href={SITE_CONFIG.whatsapp.link} target="_blank" rel="noreferrer" style={{ display: "block", color: "#25D366", textDecoration: "none", fontSize: 13, lineHeight: 2 }}>ðŸ’¬ WhatsApp: +91 93810 21541</a>
              <a href={"mailto:" + SITE_CONFIG.email} style={{ display: "block", color: "#d4b896", textDecoration: "none", fontSize: 13 }}>âœ‰ï¸ {SITE_CONFIG.email}</a>
            </div>
            <div>
              <div style={{ fontFamily: "Cormorant Garamond", fontSize: 15, color: "#f5e6d3", marginBottom: 10 }}>Follow Us</div>
              <a href={SITE_CONFIG.social.instagram.url} target="_blank" rel="noreferrer" style={{ display: "block", color: "#E1306C", textDecoration: "none", fontSize: 13, lineHeight: 2 }}>ðŸ“· @rj_alankara</a>
              <a href={SITE_CONFIG.social.facebook.url} target="_blank" rel="noreferrer" style={{ display: "block", color: "#1877F2", textDecoration: "none", fontSize: 13 }}>ðŸ“˜ rj_alankara</a>
            </div>
          </div>
          <div style={{ borderTop: "1px solid #3a2010", paddingTop: 16, textAlign: "center", fontSize: 11, color: "#5a3a2a" }}>
            Â© 2025 Riya Jasmin Vastraabharana. All rights reserved. Handcrafted with â¤ï¸ in India.
          </div>
        </div>
      </footer>
    </div>
  );
}

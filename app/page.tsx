"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { ShoppingBag, X, Menu, ArrowRight, Check, Plus, Minus, CreditCard, Banknote, MapPin, Truck, Package, Clock, ClipboardList, Wallet, Box } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Mock Data ---
const PRODUCTS = [
  {
    id: 1,
    name: "Heavyweight Box Tee",
    price: 35,
    colors: ["#FFFFFF", "#171717", "#D4D4D8"],
    image: "/prod-tee.png",
    tag: "Essential"
  },
  {
    id: 2,
    name: "Everyday Hoodie",
    price: 85,
    colors: ["#171717", "#52525B", "#F4F4F5"],
    image: "/prod-hoodie.png",
    tag: "Best Seller"
  },
  {
    id: 3,
    name: "Pleated Trouser",
    price: 95,
    colors: ["#27272A", "#18181B"],
    image: "/prod-tee.png", // Reusing for demo
    tag: "New"
  },
  {
    id: 4,
    name: "Structure Coat",
    price: 220,
    colors: ["#171717"],
    image: "/prod-hoodie.png", // Reusing for demo
    tag: "Limited"
  }
];

const SIZES = ["S", "M", "L", "XL", "XXL"];

type CartItem = {
  id: number;
  uniqueKey: string;
  qty: number;
  size: string;
  selected: boolean;
};

// --- Mock Order History Data ---
const ORDER_TABS = ["To Pay", "To Ship", "To Receive", "Completed", "Cancelled"];

const MOCK_ORDERS = [
  {
    id: "ORD-9281",
    status: "To Receive",
    date: "Oct 24, 2026",
    total: 120,
    items: [
      { name: "Heavyweight Box Tee", variant: "White / L", qty: 2, image: "/prod-tee.png" },
      { name: "Everyday Hoodie", variant: "Black / M", qty: 1, image: "/prod-hoodie.png" }
    ],
    tracking: [
      { status: "Arrived at Logistics Facility", time: "10:30 AM, Today", active: true },
      { status: "Departed from Transit Center", time: "08:15 AM, Today", active: false },
      { status: "Seller has shipped your order", time: "Yesterday", active: false },
    ]
  },
  {
    id: "ORD-9280",
    status: "Completed",
    date: "Sep 12, 2026",
    total: 85,
    items: [
      { name: "Everyday Hoodie", variant: "Grey / M", qty: 1, image: "/prod-hoodie.png" }
    ],
    tracking: []
  },
  {
    id: "ORD-9282",
    status: "To Ship",
    date: "Oct 25, 2026",
    total: 35,
    items: [
      { name: "Heavyweight Box Tee", variant: "Black / XL", qty: 1, image: "/prod-tee.png" }
    ],
    tracking: []
  }
];

export default function Home() {
  // Navigation Refs
  const shopRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const journalRef = useRef<HTMLElement>(null);
  const storesRef = useRef<HTMLElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
    if (ref.current) {
      const navOffset = 80;
      const elementPosition = ref.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - navOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("To Receive");

  // Product Selection Modal State
  const [selectedProduct, setSelectedProduct] = useState<typeof PRODUCTS[0] | null>(null);
  const [selectionSize, setSelectionSize] = useState("M");
  const [selectionQty, setSelectionQty] = useState(1);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [checkoutStep, setCheckoutStep] = useState(0);

  // Open "Add to Cart" Modal
  const openAddToCartModal = (product: typeof PRODUCTS[0]) => {
    setSelectedProduct(product);
    setSelectionSize("M");
    setSelectionQty(1);
  };

  // Confirm Add to Cart
  const confirmAddToCart = () => {
    if (!selectedProduct) return;

    const uniqueKey = `${selectedProduct.id}-${selectionSize}`;

    setCartItems(prev => {
      const existing = prev.find(item => item.uniqueKey === uniqueKey);
      if (existing) {
        return prev.map(item => item.uniqueKey === uniqueKey ? { ...item, qty: item.qty + selectionQty } : item);
      }
      return [...prev, {
        id: selectedProduct.id,
        uniqueKey,
        qty: selectionQty,
        size: selectionSize,
        selected: true // Default to selected
      }];
    });

    setSelectedProduct(null);
    setIsCartOpen(true);
  };

  // Cart Logic
  const toggleItemSelection = (uniqueKey: string) => {
    setCartItems(prev => prev.map(item => item.uniqueKey === uniqueKey ? { ...item, selected: !item.selected } : item));
  };

  const updateQty = (uniqueKey: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.uniqueKey === uniqueKey) {
        return { ...item, qty: Math.max(1, item.qty + delta) };
      }
      return item;
    }));
  };

  const removeItem = (uniqueKey: string) => {
    setCartItems(prev => prev.filter(item => item.uniqueKey !== uniqueKey));
  };

  const selectedItems = cartItems.filter(item => item.selected);
  const cartTotal = selectedItems.reduce((acc, item) => {
    const product = PRODUCTS.find(p => p.id === item.id);
    return acc + (product ? product.price * item.qty : 0);
  }, 0);

  // Filter orders for tabs
  const filteredOrders = MOCK_ORDERS.filter(order => order.status === activeTab);

  return (
    <div className="min-h-screen w-full bg-white text-neutral-900 selection:bg-neutral-200">

      {/* Sticky Navbar (Glassmorphism) */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 border-b border-black/5 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-1">
            <Menu className="h-5 w-5" />
          </button>
          <span onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-xl font-bold tracking-tighter uppercase cursor-pointer">KK Plain Clothing.</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium tracking-wide">
          <button onClick={() => scrollToSection(shopRef)} className="hover:text-neutral-500 transition-colors">Shop</button>
          <button onClick={() => scrollToSection(aboutRef)} className="hover:text-neutral-500 transition-colors">About</button>
          <button onClick={() => scrollToSection(journalRef)} className="hover:text-neutral-500 transition-colors">Journal</button>
          <button onClick={() => scrollToSection(storesRef)} className="hover:text-neutral-500 transition-colors">Stores</button>
          <button onClick={() => { setIsTrackOrderOpen(true); }} className="text-neutral-400 hover:text-black transition-colors flex items-center gap-1"><ClipboardList className="h-4 w-4" /> My Orders</button>
        </div>
        <button onClick={() => setIsCartOpen(true)} className="relative group p-2">
          <ShoppingBag className="h-5 w-5" />
          {cartItems.length > 0 && (
            <span className="absolute top-1 right-0 h-2 w-2 rounded-full bg-black ring-2 ring-white" />
          )}
        </button>
      </nav>

      {/* Hero Section */}
      <header className="relative mt-16 md:mt-0 h-[80vh] w-full flex items-center justify-center bg-neutral-50 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/banner-hero.png"
            alt="Minimalist Clothing Stack"
            fill
            className="object-cover opacity-90"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/40 to-transparent" />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">Essentials Defined.</h1>
          <p className="text-lg md:text-xl font-light tracking-wide text-white/90 mb-8 max-w-lg mx-auto">
            Elevated basics engineered for the modern wardrobe. No logos, just form.
          </p>
          <button
            onClick={() => scrollToSection(shopRef)}
            className="bg-white text-black px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors"
          >
            Shop Collection
          </button>
        </div>
      </header>

      {/* Product Grid */}
      <section ref={shopRef} id="shop" className="px-6 py-24 md:px-12 max-w-[1600px] mx-auto scroll-mt-20">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-3xl font-bold tracking-tight">New Arrivals.</h2>
          <a href="#" className="text-xs font-semibold uppercase border-b border-black pb-1 hover:border-transparent transition-colors">View All</a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {PRODUCTS.map((product) => (
            <div key={product.id} className="group cursor-pointer" onClick={() => openAddToCartModal(product)}>
              <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 mb-4">
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 text-[10px] uppercase font-bold tracking-wider z-10">
                  {product.tag}
                </span>
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                {/* Hover Overlay Button */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <button
                    className="w-full bg-black text-white py-3 text-xs uppercase font-bold tracking-widest hover:bg-neutral-800"
                  >
                    Add to Cart - ${product.price}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium">{product.name}</h3>
                  <p className="text-sm text-neutral-500 mt-1">${product.price}</p>
                </div>
                <div className="flex gap-1 mt-1">
                  {product.colors.map(color => (
                    <div key={color} className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: color }}></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Horizontal Scroll Best Sellers */}
      <section className="py-20 bg-neutral-900 text-white overflow-hidden">
        <div className="px-6 md:px-12 mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Best Sellers.</h2>
          <div className="flex gap-2"> {/* Placeholders for arrow functionality */}
            <ArrowRight className="h-6 w-6 rotate-180 opacity-50" />
            <ArrowRight className="h-6 w-6 opacity-50" />
          </div>
        </div>
        <div className="flex gap-6 overflow-x-auto px-6 md:px-12 pb-8 no-scrollbar snap-x">
          {[...PRODUCTS, ...PRODUCTS].map((product, idx) => (
            <div key={`${product.id}-${idx}`} className="flex-none w-[280px] snap-center group cursor-pointer" onClick={() => openAddToCartModal(product)}>
              <div className="relative aspect-square bg-neutral-800 mb-3 overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                />
              </div>
              <h3 className="text-sm font-medium">{product.name}</h3>
              <p className="text-sm text-neutral-400 mt-0.5">${product.price}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section ref={aboutRef} className="py-24 px-6 md:px-12 bg-neutral-50">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">Engineered for Silence.</h2>
            <p className="text-neutral-500 text-lg leading-relaxed">
              At KK Plain, we believe that style shouldn't scream. It should whisper.
              Our collection is born from a desire to strip away the unnecessary, leaving only the essential.
              No logos, no noise—just pure, architectural form and premium fabrics sourced from the finest mills in Japan.
            </p>
            <div className="flex gap-8 pt-4">
              <div>
                <h4 className="font-bold text-2xl">04</h4>
                <span className="text-xs uppercase text-neutral-400 font-bold tracking-widest">Collections</span>
              </div>
              <div>
                <h4 className="font-bold text-2xl">12k+</h4>
                <span className="text-xs uppercase text-neutral-400 font-bold tracking-widest">Happy Customers</span>
              </div>
            </div>
          </div>
          <div className="flex-1 relative h-[400px] w-full bg-neutral-200">
            <div className="absolute inset-0 bg-neutral-300 flex items-center justify-center text-neutral-400 text-xs font-bold uppercase tracking-widest">
              Studio Image Placeholder
            </div>
          </div>
        </div>
      </section>

      {/* Journal Section */}
      <section ref={journalRef} className="py-24 px-6 md:px-12 border-t border-neutral-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight mb-12 text-center md:text-left">The Journal.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="group cursor-pointer">
                <div className="relative aspect-[16/9] bg-neutral-100 mb-6 overflow-hidden">
                  <div className="absolute inset-0 bg-neutral-200 group-hover:scale-105 transition-transform duration-500" />
                </div>
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Editorials — Oct {24 + i}</span>
                <h3 className="text-xl font-bold mt-2 mb-2 group-hover:underline decoration-1 underline-offset-4">Minimalism in the Modern Age</h3>
                <p className="text-neutral-500 text-sm">Exploring how stripping back the noise creates space for what truly matters.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations / Stores Section */}
      <section ref={storesRef} className="py-24 bg-black text-white px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Visit Our Stores.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Tokyo</h3>
              <p className="text-neutral-400 text-sm">Shibuya City, 1-23-4<br />Tokyo, Japan</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold">New York</h3>
              <p className="text-neutral-400 text-sm">142 Grand St,<br />SoHo, NY 10013</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold">London</h3>
              <p className="text-neutral-400 text-sm">42 Redchurch St,<br />Shoreditch, E2 7DP</p>
            </div>
          </div>
        </div>
      </section>


      <AnimatePresence>

        {/* MOBILE MENU */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 left-0 w-[80%] max-w-sm bg-white shadow-2xl p-6 flex flex-col z-10"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="text-xl font-bold tracking-tighter uppercase">KK Plain.</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-neutral-100 rounded-full">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex flex-col gap-6 text-lg font-bold tracking-tight">
                <button onClick={() => { scrollToSection(shopRef); setIsMobileMenuOpen(false); }} className="text-left hover:text-neutral-500 transition-colors">Shop</button>
                <button onClick={() => { scrollToSection(aboutRef); setIsMobileMenuOpen(false); }} className="text-left hover:text-neutral-500 transition-colors">About</button>
                <button onClick={() => { scrollToSection(journalRef); setIsMobileMenuOpen(false); }} className="text-left hover:text-neutral-500 transition-colors">Journal</button>
                <button onClick={() => { scrollToSection(storesRef); setIsMobileMenuOpen(false); }} className="text-left hover:text-neutral-500 transition-colors">Stores</button>

                <div className="h-px bg-neutral-100 my-2" />

                <button onClick={() => { setIsTrackOrderOpen(true); setIsMobileMenuOpen(false); }} className="text-left text-neutral-500 flex items-center gap-2 hover:text-black">
                  <ClipboardList className="h-5 w-5" /> My Orders
                </button>
              </div>

              <div className="mt-auto text-xs text-neutral-400 uppercase tracking-widest">
                © 2026 KK Plain Clothing.<br />Designed for Silence.
              </div>
            </motion.div>
          </div>
        )}

        {/* MY ORDERS / TRACKING MODAL */}
        {isTrackOrderOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setIsTrackOrderOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-2xl h-[70vh] rounded-lg shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-white text-sm font-bold uppercase tracking-widest">
                <span>My Purchases</span>
                <button onClick={() => setIsTrackOrderOpen(false)} className="hover:bg-neutral-100 p-1 rounded-full"><X className="h-5 w-5" /></button>
              </div>

              {/* Tabs mimicking Shopee/App style */}
              <div className="flex border-b border-neutral-100 overflow-x-auto no-scrollbar">
                {ORDER_TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 min-w-[100px] py-4 text-xs font-bold uppercase tracking-wider relative transition-colors ${activeTab === tab ? 'text-black' : 'text-neutral-400 hover:text-black'}`}
                  >
                    {tab}
                    {activeTab === tab && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
                  </button>
                ))}
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto bg-neutral-50 p-4">
                {filteredOrders.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-neutral-400 space-y-4">
                    <ClipboardList className="h-12 w-12 opacity-20" />
                    <p className="text-sm">No orders yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map(order => (
                      <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm border border-neutral-100 animate-in slide-in-from-bottom-2 duration-300">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-neutral-50">
                          <span className="text-xs font-bold text-neutral-500">Shop: KK Plain</span>
                          <span className="text-xs font-bold uppercase text-black">{order.status}</span>
                        </div>

                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex gap-4 mb-4">
                            <div className="h-16 w-16 bg-neutral-100 relative rounded-sm flex-shrink-0">
                              <Image src={item.image} alt={item.name} fill className="object-cover" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-bold line-clamp-1">{item.name}</h4>
                              <p className="text-xs text-neutral-500 mt-1">{item.variant}</p>
                              <div className="flex justify-between items-end mt-2">
                                <span className="text-xs">x{item.qty}</span>
                                {/* Price would go here */}
                              </div>
                            </div>
                          </div>
                        ))}

                        <div className="flex justify-between items-center py-3 border-t border-neutral-50">
                          <span className="text-xs text-neutral-500">{order.items.length} items</span>
                          <div className="text-sm font-bold">Order Total: ${order.total}</div>
                        </div>

                        {/* Tracking Info - specifically for 'To Receive' or 'To Ship' */}
                        {order.tracking.length > 0 && (
                          <div className="mt-3 bg-neutral-50 p-3 rounded text-sm space-y-3">
                            <h5 className="text-xs font-bold uppercase tracking-widest text-green-600 flex items-center gap-2">
                              <Truck className="h-3 w-3" /> Delivery Status
                            </h5>
                            {order.tracking.map((track, i) => (
                              <div key={i} className={`flex gap-3 ${i === 0 ? 'opacity-100' : 'opacity-50'}`}>
                                <div className="flex flex-col items-center">
                                  <div className={`h-2 w-2 rounded-full ${i === 0 ? 'bg-green-500' : 'bg-neutral-300'}`} />
                                  {i !== order.tracking.length - 1 && <div className="w-px h-full bg-neutral-200 my-1" />}
                                </div>
                                <div>
                                  <p className="text-xs font-medium">{track.status}</p>
                                  <p className="text-[10px] text-neutral-400">{track.time}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-4 flex gap-2 justify-end">
                          <button className="px-4 py-2 border border-neutral-200 text-xs font-bold rounded hover:bg-neutral-50">Contact Seller</button>
                          <button className="px-4 py-2 bg-black text-white text-xs font-bold rounded hover:bg-neutral-800">
                            {order.status === 'Completed' ? 'Buy Again' : 'Track Order'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* ADD TO CART MODAL - Centered */}
        {selectedProduct && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedProduct(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-sm rounded-lg shadow-2xl p-6 z-10"
            >
              <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4"><X className="h-5 w-5 text-gray-400 hover:text-black" /></button>

              <div className="flex gap-4 mb-6">
                <div className="relative h-24 w-20 bg-neutral-100 rounded-md overflow-hidden">
                  <Image src={selectedProduct.image} alt={selectedProduct.name} fill className="object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">{selectedProduct.name}</h3>
                  <p className="text-neutral-500 mt-1 text-sm">${selectedProduct.price}</p>
                  <p className="text-xs text-neutral-400 uppercase tracking-widest mt-2">{selectedProduct.tag}</p>
                </div>
              </div>

              {/* Size Selector */}
              <div className="mb-4">
                <div className="text-xs font-bold uppercase tracking-widest mb-2">Size</div>
                <div className="flex gap-2">
                  {SIZES.map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectionSize(s)}
                      className={`h-10 w-10 flex items-center justify-center border text-sm font-medium transition-colors ${selectionSize === s ? 'border-black bg-black text-white' : 'border-neutral-200 hover:border-black'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Qty Selector */}
              <div className="mb-6">
                <div className="text-xs font-bold uppercase tracking-widest mb-2">Quantity</div>
                <div className="flex items-center w-32 border border-neutral-200 rounded-sm">
                  <button onClick={() => setSelectionQty(Math.max(1, selectionQty - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-neutral-50"><Minus className="h-3 w-3" /></button>
                  <span className="flex-1 text-center font-medium text-sm">{selectionQty}</span>
                  <button onClick={() => setSelectionQty(selectionQty + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-neutral-50"><Plus className="h-3 w-3" /></button>
                </div>
              </div>

              {/* Payment Options Visual */}
              <div className="mb-6 bg-neutral-50 p-3 rounded-md">
                <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Payment Options Available</div>
                <div className="flex gap-3 text-neutral-600">
                  <div className="flex items-center gap-1 bg-white border border-neutral-200 px-2 py-1 rounded text-xs shadow-sm"><CreditCard className="h-3 w-3" /> Card</div>
                  <div className="flex items-center gap-1 bg-white border border-neutral-200 px-2 py-1 rounded text-xs shadow-sm"><Banknote className="h-3 w-3" /> Cash</div>
                  <div className="flex items-center gap-1 bg-white border border-neutral-200 px-2 py-1 rounded text-xs shadow-sm font-bold italic">Gcash</div>
                </div>
              </div>

              <button
                onClick={confirmAddToCart}
                className="w-full bg-black text-white py-3.5 text-sm font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors"
              >
                Add to Cart - ${(selectedProduct.price * selectionQty).toFixed(2)}
              </button>
            </motion.div>
          </div>
        )}

        {/* CART MODAL - Centered */}
        {isCartOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white z-50 rounded-lg shadow-2xl flex flex-col max-h-[85vh]"
            >
              <div className="p-6 flex items-center justify-between border-b border-neutral-100">
                <h2 className="text-lg font-bold uppercase tracking-widest">
                  {checkoutStep === 0 ? "Your Cart" : checkoutStep === 1 ? "Shipping" : checkoutStep === 2 ? "Payment" : "Complete"}
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="hover:bg-neutral-100 p-1 rounded-full"><X className="h-5 w-5" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 transition-all">
                {checkoutStep === 0 && (
                  cartItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-neutral-400 py-12">
                      <ShoppingBag className="h-12 w-12 mb-4 opacity-20" />
                      <p>Your bag is empty.</p>
                      <button onClick={() => setIsCartOpen(false)} className="mt-4 text-black underline text-sm font-bold">Start Shopping</button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {cartItems.map((item) => {
                        const product = PRODUCTS.find(p => p.id === item.id);
                        return product ? (
                          <div key={item.uniqueKey} className="flex gap-4 items-start animate-in slide-in-from-bottom-2 duration-300">
                            {/* Checkbox for Selection */}
                            <div className="pt-8">
                              <input
                                type="checkbox"
                                checked={item.selected}
                                onChange={() => toggleItemSelection(item.uniqueKey)}
                                className="h-5 w-5 border-neutral-300 rounded text-black focus:ring-black cursor-pointer accent-black"
                              />
                            </div>

                            <div className="relative h-24 w-20 bg-neutral-100 flex-shrink-0 border border-neutral-100 rounded-sm">
                              <Image src={product.image} alt={product.name} fill className="object-cover" />
                            </div>

                            <div className="flex-1 flex flex-col justify-between min-h-[6rem]">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="text-sm font-bold">{product.name}</h3>
                                  <p className="text-xs text-neutral-500 mt-0.5">Size: {item.size}</p>
                                </div>
                                <button onClick={() => removeItem(item.uniqueKey)}><X className="h-4 w-4 text-neutral-400 hover:text-red-500 transition-colors" /></button>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 border border-neutral-200 px-2 py-1 rounded-sm">
                                  <button onClick={() => updateQty(item.uniqueKey, -1)} className="p-1 hover:bg-neutral-100 rounded"><Minus className="h-3 w-3" /></button>
                                  <span className="text-xs font-medium w-4 text-center">{item.qty}</span>
                                  <button onClick={() => updateQty(item.uniqueKey, 1)} className="p-1 hover:bg-neutral-100 rounded"><Plus className="h-3 w-3" /></button>
                                </div>
                                <p className="text-sm font-bold">${product.price * item.qty}</p>
                              </div>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )
                )}

                {checkoutStep === 1 && (
                  <div className="space-y-4 animate-in slide-in-from-right duration-300">
                    <p className="text-xs uppercase font-bold text-neutral-400 tracking-widest mb-2">Checking out {selectedItems.length} items</p>
                    <input type="email" placeholder="Email Address" className="w-full p-3 border border-neutral-200 rounded text-sm focus:outline-none focus:border-black" />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="First Name" className="w-full p-3 border border-neutral-200 rounded text-sm focus:outline-none focus:border-black" />
                      <input type="text" placeholder="Last Name" className="w-full p-3 border border-neutral-200 rounded text-sm focus:outline-none focus:border-black" />
                    </div>
                    <input type="text" placeholder="Shipping Address" className="w-full p-3 border border-neutral-200 rounded text-sm focus:outline-none focus:border-black" />
                  </div>
                )}

                {checkoutStep === 3 && (
                  <div className="h-full flex flex-col items-center justify-center text-center animate-in zoom-in duration-300 py-8">
                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
                      <Check className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Order Confirmed.</h3>
                    <p className="text-neutral-500 text-sm max-w-[200px] mx-auto mb-6">Thank you for shopping with KK Plain. We'll email you the details.</p>
                    <button onClick={() => { setCheckoutStep(0); setCartItems([]); setIsCartOpen(false); }} className="text-xs font-bold underline">Close Window</button>
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              {checkoutStep < 3 && cartItems.length > 0 && (
                <div className="p-6 border-t border-neutral-100 bg-neutral-50 rounded-b-lg">
                  <div className="flex justify-between items-center mb-4 text-sm">
                    <span className="text-neutral-500">
                      {checkoutStep === 0 ? "Total (Selected)" : "Total"}
                    </span>
                    <span className="font-bold text-lg">${cartTotal}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (checkoutStep === 0 && selectedItems.length === 0) return; // Prevent checkout with 0 items
                      setCheckoutStep(prev => prev + 1);
                    }}
                    className={`w-full bg-black text-white py-4 text-sm font-bold uppercase tracking-widest hover:bg-neutral-800 rounded shadow-lg transition-all ${checkoutStep === 0 && selectedItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {checkoutStep === 0 ? `Checkout (${selectedItems.length})` : checkoutStep === 2 ? "Pay Now" : "Continue"}
                  </button>
                  {checkoutStep > 0 && (
                    <button onClick={() => setCheckoutStep(prev => prev - 1)} className="w-full mt-3 text-xs text-neutral-500 underline hover:text-black">
                      Back
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

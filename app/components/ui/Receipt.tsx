"use client";

import { X, Printer, Truck, MapPin, User, Calendar, Hash, Building2 } from "lucide-react";
import { motion } from "framer-motion";

interface ReceiptProps {
  order: {
    id: string;
    date: string;
    customer?: string;
    items: any[] | string;
    total: number;
    paymentMethod?: string;
    status?: string;
    trackingNumber?: string;
    courier?: string;
    weight?: string;
  };
  onClose: () => void;
}

export function Receipt({ order, onClose }: ReceiptProps) {
  const shopName = "KK PLAIN CLOTHING.";
  const shopAddress = "Block 49 Lot 14 Heroesville Phase 1 Brgy. Gaya-gaya";
  const courier = order.courier || "J&T Express";
  const trackingNumber = order.trackingNumber || "7701" + Math.floor(Math.random() * 90000000 + 10000000);
  
  const items = Array.isArray(order.items) 
    ? order.items 
    : [{ name: order.items, qty: 1, price: order.total }];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 print:p-0">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md print:hidden"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative bg-white w-full max-w-[420px] shadow-2xl overflow-hidden flex flex-col print:shadow-none print:w-full print:max-w-none max-h-[95vh]"
      >
        {/* Compact Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-white print:hidden">
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 leading-none mb-1">KK Plain Official</span>
            <span className="text-[11px] font-bold text-black uppercase">Logistic Waybill</span>
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="p-2 hover:bg-neutral-50 border border-neutral-100 rounded-full transition-all" title="Print">
              <Printer className="h-3.5 w-3.5 text-black" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-neutral-50 border border-neutral-100 rounded-full transition-all">
              <X className="h-3.5 w-3.5 text-black" />
            </button>
          </div>
        </div>

        {/* LOGISTIC CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-black font-sans leading-relaxed print:p-10 bg-white">
          
          {/* Top Brand & QR Code Section */}
          <div className="flex justify-between items-start gap-4 pb-6 border-b border-black/5">
            <div className="flex-1">
              <h2 className="text-3xl font-black tracking-tighter uppercase leading-none mb-3">{shopName}</h2>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-black text-white text-[9px] font-black uppercase tracking-wider italic">{courier}</span>
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">{trackingNumber}</span>
                </div>
                <div className="flex items-start gap-1.5 mt-2">
                    <Building2 className="h-3 w-3 text-neutral-300 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-neutral-400">Seller Location</p>
                        <p className="text-[10px] font-bold leading-tight">{shopAddress}</p>
                    </div>
                </div>
              </div>
            </div>
            
            {/* ULTRA-REALISTIC QR CODE (Vectorized Example) */}
            <div className="flex-shrink-0 w-24 h-24 bg-white p-1 border border-black/10 rounded-sm">
                <svg viewBox="0 0 29 29" className="w-full h-full" style={{ shapeRendering: 'crispEdges' }}>
                  {/* Position Indicators */}
                  <path d="M0 0h7v7H0zM1 1h5v5H1zM2 2h3v3H2zM22 0h7v7h-7zM23 1h5v5h-5zM24 2h3v3h-3zM0 22h7v7H0zM1 23h5v5H1zM2 24h3v3H2z" fill="black" />
                  {/* High-density Data Matrix Pattern */}
                  <path d="M8 0h1v1h-1zM10 0h1v1h-1zM12 0h2v1h-2zM15 0h1v1h-1zM17 0h1v1h-1zM19 0h2v1h-2zM8 1h1v1h-1zM10 1h2v1h-2zM13 1h1v1h-1zM15 1h2v2h-2zM18 1h1v1h-1zM20 1h1v1h-1zM9 2h1v1h-1zM11 2h1v1h-1zM13 2h1v1H13zM16 2h1v1h-1zM18 2h1v1h-1zM20 2h1v1h-1zM8 3h2v1H8zM11 3h2v1h-2zM14 3h1v1h-1zM16 3h2v1h-2zM19 3h2v1h-2zM9 4h1v1H9zM11 4h1v1h-1zM13 4h2v1h-2zM16 4h1v1h-1zM18 4h2v1h-2zM8 5h1v1H8zM10 5h1v1h-1zM12 5h1v1h-1zM14 5h1v1h-1zM16 5h2v1h-2zM19 5h1v1h-1zM9 6h1v1H9zM11 6h2v1h-2zM14 6h1v1h-1zM16 6h1v1h-1zM18 6h3v1h-3zM0 8h1v1H0zM2 8h2v1H2zM5 8h2v1H5zM8 8h1v1H8zM10 8h1v1h-1zM12 8h2v1h-2zM15 8h1v1h-1zM17 8h1v1h-1zM19 8h1v1h-1zM21 8h1v1h-1zM23 8h1v1h-1zM25 8h1v1h-1zM27 8h2v1h-2zM1 9h1v1H1zM3 9h1v1H3zM5 9h1v1H5zM7 9h1v1H7zM9 9h1v1H9zM11 9h1v1h-1zM13 9h2v1h-2zM16 9h2v1h-2zM19 9h1v1h-1zM21 9h1v1h-1zM23 9h1v1h-1zM25 9h2v1h-2zM28 9h1v1h-1zM0 10h2v1H0zM3 10h1v1H3zM5 10h1v1H5zM8 10h2v1H8zM11 10h2v1h-2zM14 10h1v1h-1zM16 10h1v1h-1zM18 10h1v1h-1zM20 10h2v1h-2zM23 10h1v1h-1zM25 10h1v1h-1zM27 10h1v1h-1zM1 11h1v1H1zM4 11h1v1H4zM6 11h1v1H6zM9 11h1v1H9zM11 11h1v1h-1zM13 11h2v1h-2zM16 11h1v1h-1zM18 11h1v1h-1zM20 11h1v1h-1zM22 11h1v1h-1zM24 11h1v1h-1zM26 11h3v1h-3zM0 12h1v1H0zM2 12h2v1H2z" fill="black" />
                  <path d="M8 12h1v1H8zM10 12h1v1h-1zM12 12h2v1h-2zM15 12h1v1h-1zM17 12h2v1h-2zM20 12h1v1h-1zM22 12h1v1h-1zM24 12h1v1h-1zM26 12h2v1h-2zM1 13h1v1H1zM3 13h1v1H3zM5 13h2v1H5zM9 13h1v1H9zM11 13h1v1h-1zM13 13h1v1h-1zM15 13h2v1h-2zM18 13h1v1h-1zM21 13h2v1h-2zM24 13h1v1h-1zM27 13h1v1h-1zM0 14h2v1H0zM3 14h1v1H3z" fill="black" />
                  <path d="M8 14h2v1H8zM11 14h1v1h-1zM13 14h1v1h-1zM15 14h1v1h-1zM17 14h2v1h-2zM20 14h2v1h-2zM23 14h1v1h-1zM25 14h1v1h-1zM27 14h2v1h-2zM1 15h1v1H1zM4 15h1v1H4zM6 15h1v1H6zM9 15h1v1H9zM11 15h2v1h-2zM14 15h1v1h-1zM16 15h1v1h-1zM18 15h1v1h-1zM20 15h1v1h-1zM22 15h1v1h-1zM24 15h1v1h-1zM26 15h2v1h-2zM0 16h1v1H0zM2 16h2v1H2zM5 16h2v1H5zM8 16h1v1H8zM10 16h3v1h-3zM14 16h3v1h-3zM18 16h2v1h-2zM21 16h1v1h-1zM23 16h1v1h-1zM25 16h1v1h-1zM27 16h1v1h-1zM1 17h2v1H1zM4 17h1v1H4zM6 17h1v1H6zM9 17h1v1H9zM11 17h1v1h-1zM13 17h2v1h-2zM16 17h2v1h-2zM19 17h1v1h-1zM21 17h1v1h-1zM23 17h1v1h-1zM25 17h2v1h-2zM28 17h1v1h-1zM0 18h2v1H0zM3 18h1v1H3zM5 18h1v1H5zM8 18h2v1H8zM11 18h1v1h-1zM13 18h1v1h-1zM15 18h2v1h-2zM18 18h1v1h-1zM20 18h2v1h-2zM23 18h1v1h-1zM25 18h1v1h-1zM27 18h1v1h-1z" fill="black" />
                  <path d="M8 19h1v1H8zM10 19h1v1h-1zM12 19h2v1h-2zM15 19h1v1h-1zM17 19h1v1h-1zM19 19h1v1h-1zM21 19h1v1h-1zM23 19h1v1h-1zM25 19h3v1h-3zM8 21h2v1H8zM11 21h1v1h-1zM13 21h1v1h-1zM15 21h1v1h-1zM17 21h2v1h-2zM20 21h1v1h-1zM22 21h1v1h-1zM24 21h2v1h-2zM27 21h1v1h-1z" fill="black" />
                  <path d="M8 22h1v1H8zM10 22h1v1h-1zM12 22h2v1h-2zM15 22h1v1h-1zM17 22h3v1h-3zM21 22h1v1h-1zM23 22h1v1h-1zM25 22h1v1h-1zM27 22h2v1h-2zM8 23h2v1H8zM11 23h1v1h-1zM13 23h1v1h-1zM15 23h2v1h-2zM18 23h1v1h-1zM20 23h1v1h-1zM22 23h1v1h-1zM24 23h1v1h-1zM26 23h3v1h-3zM8 24h1v1H8zM10 24h1v1h-1zM12 24h1v1h-1zM14 24h1v1h-1zM16 24h1v1h-1zM18 24h2v1h-2zM21 24h1v1h-1zM23 24h1v1h-1zM25 24h1v1h-1zM27 24h1v1h-1zM8 25h2v1H8zM11 25h1v1h-1zM13 25h2v1h-2zM16 25h1v1h-1zM18 25h1v1h-1zM20 25h1v1h-1zM22 25h1v1h-1zM24 25h1v1h-1zM26 25h2v1h-2zM28 25h1v1h-1zM8 26h1v1H8zM10 26h1v1h-1zM12 26h1v1h-1zM14 26h1v1h-1zM16 26h2v1h-2zM19 26h1v1h-1zM21 26h1v1h-1zM23 26h1v1h-1zM25 26h1v1h-1zM27 26h1v1h-1zM8 27h3v1H8zM12 27h1v1h-1zM14 27h2v1h-2zM17 27h1v1h-1zM19 27h2v1h-2zM22 27h1v1h-1zM24 27h1v1h-1zM26 27h2v1h-2zM28 27h1v1h-1zM8 28h1v1H8zM10 28h2v1h-2zM13 28h1v1h-1zM15 28h1v1h-1zM17 28h1v1h-1zM19 28h1v1h-1zM21 28h1v1h-1zM23 28h1v1h-1zM25 28h1v1h-1zM27 28h2v1h-2z" fill="black" />
                </svg>
            </div>
          </div>

          {/* Recipient Details */}
          <div className="grid grid-cols-[1.5fr_1fr] gap-6">
            <div className="space-y-4">
               <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <User className="h-3 w-3 text-neutral-300" />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-neutral-400">Recipient Information</span>
                  </div>
                  <p className="text-sm font-black uppercase tracking-tight">{order.customer || "Customer"}</p>
                  <p className="text-[10px] font-bold text-neutral-500 leading-tight mt-1">Brgy. Anabu 2C, Imus, Cavite, PH 4103</p>
               </div>
            </div>
            <div className="pl-6 border-l border-neutral-100 flex flex-col justify-between">
               <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-1">Order Summary</p>
                  <p className="text-[10px] font-black">Ref: {order.id}</p>
                  <p className="text-[10px] font-black">Date: {order.date}</p>
               </div>
               <div className="text-right mt-4 grayscale opacity-40">
                    <p className="text-[10px] font-black tracking-widest leading-none">SBD-PH</p>
                    <p className="text-[8px] font-bold">L-4103</p>
               </div>
            </div>
          </div>

          {/* Item Content (Clean Listing) */}
          <div className="pt-6 border-t border-black/5 space-y-4">
             <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">
                <span>Description of Contents</span>
                <span>Unit Price</span>
             </div>
             <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 bg-black rounded-full" />
                        <div>
                            <p className="text-xs font-black uppercase tracking-tight leading-none">{item.name}</p>
                            <p className="text-[9px] font-bold text-neutral-400 mt-1 uppercase">Qty: {item.qty} • {item.variant || "Std Selection"}</p>
                        </div>
                    </div>
                    <p className="text-xs font-black tracking-tight">₱{(item.price || (order.total / (items.length || 1))).toFixed(2)}</p>
                  </div>
                ))}
             </div>
          </div>

          {/* Financials & REALISTIC BARCODE */}
          <div className="pt-8 border-t-2 border-black space-y-6">
             <div className="flex justify-between items-end">
                <div className="space-y-1">
                   <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">Total Valuation</p>
                   <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black uppercase">{order.paymentMethod || "COD"} Payment</span>
                       <span className="h-1 w-1 bg-neutral-200 rounded-full" />
                       <span className="text-[10px] font-bold text-neutral-400 italic">Net Payable</span>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-3xl font-black italic tracking-tighter leading-none">₱{order.total.toFixed(2)}</p>
                </div>
             </div>

             {/* PRO-LEVEL LOGISTIC BARCODE (Code 128 / EAN style) */}
             <div className="pt-4 flex flex-col items-center space-y-2">
                <div className="h-16 w-full bg-white border border-neutral-100 p-2 rounded flex items-end justify-center overflow-hidden">
                   <div className="flex items-end h-full gap-0 justify-center w-full">
                      {[
                        1,3,1,1,2,1,4,1,1,3,2,1,1,1,4,2,1,1,2,3,1,1,1,2,1,4,1,1,1,3,1,1,2,4,1,1,1,2,2,1,1,3,1,1,4,1,1,1,2,2,1,1,3,1,1,1,4,2,1,1,1,2,3,1,1,1,3,1,1,2,1,4,1,1,3,2,1,2,1,1
                      ].map((width, i) => (
                        <div 
                           key={i} 
                           className={`${i % 2 === 0 ? 'bg-black' : 'bg-transparent'}`} 
                           style={{ 
                             flex: `${width}`, 
                             height: i % 10 === 0 ? '100%' : '90%',
                             minWidth: i % 2 === 0 ? '0.5px' : '0'
                           }} 
                        />
                      ))}
                   </div>
                </div>
                <div className="flex justify-between w-full px-2 text-[10px] font-mono font-bold tracking-[0.3em] text-black">
                    <span>{trackingNumber.slice(0, 4)}</span>
                    <span className="text-neutral-300">|</span>
                    <span>{trackingNumber.slice(4, 9)}</span>
                    <span className="text-neutral-300">|</span>
                    <span>{trackingNumber.slice(9)}</span>
                </div>
             </div>
          </div>

          {/* Social / Footer */}
          <div className="pt-8 flex justify-between items-center border-t border-neutral-50">
             <p className="text-[8px] font-black uppercase tracking-[0.3em] text-neutral-300">KK PLAIN CLOTHING • PHILIPPINES</p>
             <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-black" />
                <div className="h-2 w-2 rounded-full bg-neutral-200" />
                <div className="h-2 w-2 rounded-full bg-neutral-100" />
             </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

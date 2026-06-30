import { useState } from 'react';
import { Star, ShoppingCart, ShieldCheck } from 'lucide-react';
import { MERCH_STORE } from '../data';
import { MerchItem, CartItem } from '../types';

interface MerchStoreProps {
  onAddToCart: (item: MerchItem, selectedSize?: string) => void;
  cart: CartItem[];
  merchItems?: MerchItem[];
}

export default function MerchStore({ onAddToCart, cart, merchItems }: MerchStoreProps) {
  const storeItems = merchItems || MERCH_STORE;
  const [activeCategory, setActiveCategory] = useState<'all' | 'apparel' | 'music' | 'accessories'>('all');
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

  // Filter list based on category selector
  const filteredProducts = storeItems.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  const handleSizeSelect = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: size
    }));
  };

  const handleAddClick = (product: MerchItem) => {
    // If product has sizes (Apparel), verify size was chosen
    if (product.sizes && product.sizes.length > 0) {
      const chosenSize = selectedSizes[product.id];
      if (!chosenSize) {
        alert('Please select a size (S, M, L...) before adding this item to your cart.');
        return;
      }
      onAddToCart(product, chosenSize);
    } else {
      onAddToCart(product, undefined);
    }
  };

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#F9F6F2] dark:bg-[#0A0D14] text-[#3D3A35] dark:text-[#E2E8F0]" id="merch-store-page">
      {/* Page Header */}
      <div className="text-center max-w-xl mx-auto space-y-3 pt-6" id="merch-intro">
        <span className="font-mono text-xs text-[#BC6C25] dark:text-[#F59E0B] tracking-widest block uppercase font-bold">OFFICIAL BAND MERCHANDISE</span>
        <h1 className="font-serif font-bold text-3xl md:text-5xl text-[#4A5D4E] dark:text-emerald-400 tracking-tight">Velvet Horizon Shop</h1>
        <p className="font-serif text-[#6B655C] dark:text-[#94A3B8] text-sm italic">
          "Limited editions gatefold records, retro cassette loops, screen-printed organic apparel, and precision metal keyrings. Globally shipped."
        </p>
      </div>

      {/* Merch categories filter row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-2 border-b border-[#E5DED4] dark:border-[#1E2638] pb-6" id="merch-filters-row">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2" id="merch-category-selectors">
          {([
            { id: 'all', label: 'All Merch' },
            { id: 'apparel', label: 'Apparel' },
            { id: 'music', label: 'Vinyl & Tapes' },
            { id: 'accessories', label: 'Accessories' }
          ] as const).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              id={`filter-merch-${cat.id}`}
              className={`px-5 py-2 rounded-full text-xs font-mono font-bold tracking-widest uppercase transition-all cursor-pointer focus:outline-none ${
                activeCategory === cat.id
                  ? 'bg-[#4A5D4E] dark:bg-emerald-600 text-white shadow-sm'
                  : 'bg-[#F2ECE4]/70 dark:bg-[#1E2638]/70 text-[#6B655C] dark:text-[#94A3B8] border border-[#E5DED4] dark:border-[#2A354F] hover:bg-[#E5DED4] dark:hover:bg-[#20293D]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Quality guarantee indicators */}
        <div className="flex items-center space-x-4 text-[11px] font-mono text-[#6B655C] dark:text-[#94A3B8] font-bold" id="merch-guarantees">
          <div className="flex items-center space-x-1">
            <ShieldCheck className="w-4 h-4 text-[#4A5D4E] dark:text-emerald-400" />
            <span>Organic Fabrics</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>•</span>
            <span>Secure Checkout</span>
          </div>
        </div>
      </div>

      {/* Grid of merchandising items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="products-catalog-grid">
        {filteredProducts.map((product) => {
          const hasSizes = product.sizes && product.sizes.length > 0;
          const userSelectedSize = selectedSizes[product.id];

          // Count existing matches in shopping cart to display badge
          const quantityInCart = cart
            .filter((ci) => ci.merchItem.id === product.id)
            .reduce((sum, ci) => sum + ci.quantity, 0);

          return (
            <div
              key={product.id}
              className="group rounded-[24px] border border-[#E5DED4] dark:border-[#1E2638] bg-white dark:bg-[#111625] hover:border-[#4A5D4E]/30 dark:hover:border-emerald-500/30 transition-all flex flex-col h-full overflow-hidden shadow-sm"
              id={`product-card-${product.id}`}
            >
              {/* Product Visual Container */}
              <div className="relative aspect-square overflow-hidden bg-[#FCFAF7] dark:bg-[#151B2B] border-b border-[#E5DED4] dark:border-b-[#1E2638]">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  referrerPolicy="no-referrer"
                />

                {/* Overlaid category tag */}
                <div className="absolute top-4 left-4 block">
                  <span className="font-mono text-[9px] font-bold px-2.5 py-1 rounded-full bg-white/95 dark:bg-[#1E2638]/95 border border-[#E5DED4] dark:border-[#2A354F] text-[#BC6C25] dark:text-[#F59E0B] uppercase tracking-widest leading-none">
                    {product.name.includes("Vinyl") || product.name.includes("Tape") ? "music" : product.category}
                  </span>
                </div>

                {/* Overlaid cart quantity indication badge */}
                {quantityInCart > 0 && (
                  <div className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#4A5D4E] dark:bg-emerald-600 text-[10px] font-bold text-white border-2 border-white dark:border-[#111625] shadow-sm">
                    +{quantityInCart}
                  </div>
                )}

                {/* Featured callouts */}
                {product.isFeatured && (
                  <div className="absolute bottom-4 left-4">
                    <span className="font-mono text-[9px] px-2.5 py-1 rounded-full bg-[#BC6C25] dark:bg-[#F59E0B] text-white dark:text-[#0A0D14] font-bold uppercase tracking-wider shadow-sm">
                      BEST SELLER
                    </span>
                  </div>
                )}
              </div>

              {/* Product details */}
              <div className="p-5 flex-grow flex flex-col justify-between text-left space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[#3D3A35] dark:text-[#E2E8F0]">
                    <h3 className="font-serif font-bold text-base leading-snug group-hover:text-[#BC6C25] dark:group-hover:text-[#F59E0B] transition-colors">
                      {product.name}
                    </h3>
                  </div>

                  {/* Stars Rating */}
                  <div className="flex items-center space-x-1">
                    <div className="flex items-center text-[#BC6C25] dark:text-[#F59E0B] space-x-0.5">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <span className="font-mono text-[10px] text-[#6B655C] dark:text-[#94A3B8]">
                      ({product.rating} / 5.0)
                    </span>
                  </div>

                  <p className="font-serif text-xs text-[#6B655C] dark:text-[#94A3B8] leading-relaxed line-clamp-3">
                    {product.description}
                  </p>
                </div>

                {/* Size selections if Apparel item */}
                {hasSizes && (
                  <div className="space-y-1.5" id={`sizes-box-${product.id}`}>
                    <span className="font-mono text-[9px] text-[#6B655C] dark:text-[#94A3B8] uppercase tracking-wider block font-bold">
                      SELECT SIZE: <span className="text-[#BC6C25] dark:text-[#F59E0B] font-bold">{userSelectedSize || 'None'}</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {product.sizes?.map((sz) => {
                        const isSizeChosen = userSelectedSize === sz;
                        return (
                          <button
                            key={sz}
                            onClick={() => handleSizeSelect(product.id, sz)}
                            id={`size-btn-${product.id}-${sz}`}
                            className={`h-7 w-9 flex items-center justify-center rounded font-mono text-[10px] font-semibold border cursor-pointer transition-all focus:outline-none ${
                              isSizeChosen
                                ? 'bg-[#BC6C25] dark:bg-[#F59E0B] text-white dark:text-[#0A0D14] border-[#BC6C25] dark:border-[#F59E0B] shadow-sm'
                                : 'bg-[#F2ECE4]/50 dark:bg-[#1D2535] text-[#6B655C] dark:text-[#94A3B8] border-[#E5DED4] dark:border-[#2A354F] hover:bg-[#E5DED4] dark:hover:bg-[#20293D] hover:text-[#3D3A35] dark:hover:text-white'
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Price and Add checkout control details */}
                <div className="pt-3 border-t border-[#E5DED4] dark:border-t-[#1E2638] flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[9px] text-[#6B655C] dark:text-[#94A3B8] block uppercase tracking-wider font-bold">UNIT PRICE</span>
                    <span className="font-serif font-bold text-lg text-[#3D3A35] dark:text-[#E2E8F0]">
                      ${product.price} USD
                    </span>
                  </div>

                  <div className="text-right">
                    {/* Stock counter */}
                    {product.stock <= 15 ? (
                      <span className="font-mono text-[9px] text-[#BC6C25] dark:text-[#F59E0B] block pb-1.5 font-bold text-right0 animate-pulse">
                        Only {product.stock} left!
                      </span>
                    ) : (
                      <span className="font-mono text-[9px] text-[#6B655C] dark:text-[#94A3B8] block pb-1.5 text-right font-medium">
                        Active Stock ({product.stock})
                      </span>
                    )}

                    <button
                      onClick={() => handleAddClick(product)}
                      id={`add-cart-btn-${product.id}`}
                      className="inline-flex items-center space-x-1.5 px-4.5 py-2.5 rounded-full bg-[#4A5D4E] dark:bg-emerald-600 hover:bg-[#5B6F5F] dark:hover:bg-emerald-500 text-white font-mono font-bold text-[10px] tracking-widest uppercase transition-all shadow-sm cursor-pointer focus:outline-none"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>ADD ITEMS</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

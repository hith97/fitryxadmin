import React, { useState, useRef } from 'react';
import {
  Plus, Search, Pencil, Trash2, Package, ShoppingCart,
  CheckCircle2, X, TrendingUp, Boxes, ImagePlus, Store,
  ChevronDown, ChevronUp, Layers,
} from 'lucide-react';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Avatar from '../components/ui/Avatar';
import { productApi, memberApi, uploadApi } from '../services/planApi';

// ── Helpers ────────────────────────────────────────────────────
const inputCls = (err) =>
  `w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all ${
    err ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-slate-50 focus:border-primary focus:bg-white'
  }`;

const FormField = ({ label, required, error, children, className = '' }) => (
  <div className={className}>
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {label}{required && <span className="ml-1 text-rose-500">*</span>}
    </label>
    {children}
    {error && <div className="mt-1.5 text-xs text-rose-600">{error}</div>}
  </div>
);

// ── Image Uploader ─────────────────────────────────────────────
const ImageUploader = ({ images, onChange }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files) => {
    setUploading(true);
    try {
      const uploads = await Promise.all(Array.from(files).map((f) => uploadApi.uploadImage(f)));
      onChange([...images, ...uploads.map((u) => u.url)]);
    } catch {
      toast.error('Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {images.map((url, i) => (
          <div key={i} className="relative h-20 w-20 flex-shrink-0">
            <img src={url} alt="" className="h-full w-full rounded-2xl object-cover border border-slate-200" />
            <button type="button" onClick={() => onChange(images.filter((_, idx) => idx !== i))}
              className="absolute -right-1.5 -top-1.5 rounded-full bg-rose-500 p-0.5 text-white hover:bg-rose-600">
              <X size={10} />
            </button>
          </div>
        ))}
        <button type="button" disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="h-20 w-20 flex-shrink-0 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-primary hover:text-primary transition-colors disabled:opacity-50">
          {uploading ? (
            <div className="h-4 w-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          ) : (
            <>
              <ImagePlus size={18} />
              <span className="text-[10px] font-medium">Add Photo</span>
            </>
          )}
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
        onChange={(e) => e.target.files?.length && handleFiles(e.target.files)} />
    </div>
  );
};

// ── Variant Row ────────────────────────────────────────────────
const EMPTY_VARIANT = { name: '', sku: '', sellingPrice: '', buyingPrice: '', stock: '' };

const VariantsEditor = ({ variants, onChange }) => {
  const add = () => onChange([...variants, { ...EMPTY_VARIANT }]);
  const remove = (i) => onChange(variants.filter((_, idx) => idx !== i));
  const update = (i, f, v) => onChange(variants.map((vr, idx) => idx === i ? { ...vr, [f]: v } : vr));

  return (
    <div className="space-y-3">
      {variants.map((vr, i) => (
        <div key={i} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <input value={vr.name} onChange={(e) => update(i, 'name', e.target.value)}
              placeholder="Variant name (e.g. 500g, Large, Chocolate)"
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary" />
            <input value={vr.sku} onChange={(e) => update(i, 'sku', e.target.value)}
              placeholder="SKU (optional)"
              className="w-28 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary" />
            <button type="button" onClick={() => remove(i)}
              className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors">
              <X size={14} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-slate-400">Selling Price (₹)</label>
              <input type="number" min="0" value={vr.sellingPrice}
                onChange={(e) => update(i, 'sellingPrice', e.target.value)}
                placeholder="Same as base"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-slate-400">Buying Price (₹)</label>
              <input type="number" min="0" value={vr.buyingPrice}
                onChange={(e) => update(i, 'buyingPrice', e.target.value)}
                placeholder="Optional"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold text-slate-400">Stock (units)</label>
              <input type="number" min="0" value={vr.stock}
                onChange={(e) => update(i, 'stock', e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={add}
        className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline">
        <Plus size={13} /> Add Variant
      </button>
      {variants.length > 0 && (
        <p className="text-[11px] text-slate-400">
          When variants exist, stock is tracked per-variant. Leave selling price blank to inherit from base product.
        </p>
      )}
    </div>
  );
};

// ── Product Modal ──────────────────────────────────────────────
const EMPTY_PROD = {
  name: '', description: '', category: '',
  buyingPrice: '', sellingPrice: '', stock: '',
  isActive: true, inStore: false,
  images: [], variants: [],
};

const ProductModal = ({ isOpen, onClose, product, onSaved }) => {
  const [form, setForm] = useState(EMPTY_PROD);
  const [errors, setErrors] = useState({});
  const isEdit = Boolean(product);

  React.useEffect(() => {
    if (isOpen) {
      setErrors({});
      if (product) {
        setForm({
          name: product.name || '',
          description: product.description || '',
          category: product.category || '',
          buyingPrice: product.buyingPrice ?? '',
          sellingPrice: product.sellingPrice ?? '',
          stock: product.stock ?? '',
          isActive: product.isActive ?? true,
          inStore: product.inStore ?? false,
          images: product.images || [],
          variants: (product.variants || []).map((v) => ({
            name: v.name || '',
            sku: v.sku || '',
            sellingPrice: v.sellingPrice ?? '',
            buyingPrice: v.buyingPrice ?? '',
            stock: v.stock ?? '',
          })),
        });
      } else {
        setForm(EMPTY_PROD);
      }
    }
  }, [isOpen, product]);

  const set = (f, v) => { setForm((p) => ({ ...p, [f]: v })); setErrors((e) => ({ ...e, [f]: undefined })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Product name is required.';
    if (!form.sellingPrice || Number(form.sellingPrice) <= 0) e.sellingPrice = 'Enter a valid selling price.';
    for (const [i, vr] of form.variants.entries()) {
      if (!vr.name.trim()) e[`v_name_${i}`] = 'Variant name required.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const mutation = useMutation({
    mutationFn: (payload) =>
      isEdit ? productApi.update(product.id, payload) : productApi.create(payload),
    onSuccess: () => {
      toast.success(isEdit ? 'Product updated.' : 'Product created.');
      onSaved?.();
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = () => {
    if (!validate()) return;
    mutation.mutate({
      name: form.name.trim(),
      description: form.description.trim() || null,
      category: form.category.trim() || null,
      buyingPrice: form.buyingPrice !== '' ? Number(form.buyingPrice) : 0,
      sellingPrice: Number(form.sellingPrice),
      stock: form.variants.length > 0 ? 0 : (form.stock !== '' ? Number(form.stock) : 0),
      images: form.images,
      isActive: form.isActive,
      inStore: form.inStore,
      variants: form.variants.filter((v) => v.name.trim()).map((v) => ({
        name: v.name.trim(),
        sku: v.sku.trim() || null,
        sellingPrice: v.sellingPrice !== '' ? Number(v.sellingPrice) : null,
        buyingPrice: v.buyingPrice !== '' ? Number(v.buyingPrice) : null,
        stock: Number(v.stock) || 0,
      })),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Product' : 'Add Product'}
      width="700px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            <CheckCircle2 size={15} />
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Basic info */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Product Name" required error={errors.name}>
            <input value={form.name} onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Whey Protein" className={inputCls(errors.name)} />
          </FormField>
          <FormField label="Category">
            <input value={form.category} onChange={(e) => set('category', e.target.value)}
              placeholder="e.g. Supplements" className={inputCls(false)} />
          </FormField>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <FormField label="Selling Price (₹)" required error={errors.sellingPrice}>
            <input type="number" min="0" value={form.sellingPrice}
              onChange={(e) => set('sellingPrice', e.target.value)} placeholder="0" className={inputCls(errors.sellingPrice)} />
          </FormField>
          <FormField label="Buying Price (₹)">
            <input type="number" min="0" value={form.buyingPrice}
              onChange={(e) => set('buyingPrice', e.target.value)} placeholder="0 (optional)" className={inputCls(false)} />
          </FormField>
          <FormField label="Stock (units)" className={form.variants.length > 0 ? 'opacity-40 pointer-events-none' : ''}>
            <input type="number" min="0" value={form.variants.length > 0 ? '' : form.stock}
              onChange={(e) => set('stock', e.target.value)}
              placeholder={form.variants.length > 0 ? 'Per variant' : '0'} className={inputCls(false)} />
          </FormField>
        </div>

        <FormField label="Description">
          <textarea rows={2} value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Optional product description..." className={`${inputCls(false)} resize-none`} />
        </FormField>

        {/* Product Photos */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Product Photos</label>
          <ImageUploader images={form.images} onChange={(imgs) => set('images', imgs)} />
        </div>

        {/* Variants */}
        <div className="border-t border-slate-100 pt-5">
          <label className="mb-3 block text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Layers size={15} className="text-slate-400" />
            Variants
            <span className="text-xs font-normal text-slate-400">(optional — e.g. size, flavor, weight)</span>
          </label>
          <VariantsEditor variants={form.variants} onChange={(v) => set('variants', v)} />
        </div>

        {/* Toggles */}
        <div className="border-t border-slate-100 pt-4 flex flex-wrap gap-6">
          <label className="flex cursor-pointer items-center gap-3">
            <button type="button" onClick={() => set('isActive', !form.isActive)}
              className={`relative h-6 w-11 rounded-full transition-colors ${form.isActive ? 'bg-primary' : 'bg-slate-200'}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
            <span className="text-sm font-medium text-slate-700">Active</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3">
            <button type="button" onClick={() => set('inStore', !form.inStore)}
              className={`relative h-6 w-11 rounded-full transition-colors ${form.inStore ? 'bg-emerald-500' : 'bg-slate-200'}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.inStore ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
            <span className="text-sm font-medium text-slate-700">Add to Store</span>
          </label>
        </div>
      </div>
    </Modal>
  );
};

// ── Stock Adjust Modal ─────────────────────────────────────────
const StockModal = ({ isOpen, onClose, product, onSaved }) => {
  const [variantId, setVariantId] = useState('');
  const [delta, setDelta] = useState('');
  const [type, setType] = useState('add');
  const hasVariants = product?.variants?.length > 0;
  const currentStock = hasVariants
    ? (product.variants.find((v) => v.id === variantId)?.stock ?? 0)
    : (product?.stock ?? 0);

  React.useEffect(() => {
    if (isOpen) {
      setDelta(''); setType('add');
      setVariantId(hasVariants ? (product._focusVariant ?? product.variants[0]?.id ?? '') : '');
    }
  }, [isOpen, hasVariants]);

  const mutation = useMutation({
    mutationFn: () => productApi.adjustStock(product.id, type === 'add' ? Number(delta) : -Number(delta), variantId || undefined),
    onSuccess: () => { toast.success('Stock updated.'); onSaved?.(); onClose(); },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Adjust Stock — ${product?.name}`} width="420px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={() => mutation.mutate()} disabled={!delta || mutation.isPending}>
            {mutation.isPending ? 'Updating...' : 'Update Stock'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {hasVariants && (
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Variant</label>
            <select value={variantId} onChange={(e) => setVariantId(e.target.value)} className={inputCls(false)}>
              {product.variants.map((v) => (
                <option key={v.id} value={v.id}>{v.name} (Stock: {v.stock})</option>
              ))}
            </select>
          </div>
        )}
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
          Current stock: <strong className="text-slate-900">{currentStock} units</strong>
        </div>
        <div className="flex gap-3">
          {['add', 'remove'].map((t) => (
            <button key={t} type="button" onClick={() => setType(t)}
              className={`flex-1 rounded-2xl border py-2.5 text-sm font-semibold transition-colors ${type === t ? 'border-primary bg-primary-light text-primary' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {t === 'add' ? '+ Add Stock' : '− Remove Stock'}
            </button>
          ))}
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Quantity</label>
          <input type="number" min="1" value={delta} onChange={(e) => setDelta(e.target.value)}
            placeholder="e.g. 10" className={inputCls(false)} />
        </div>
      </div>
    </Modal>
  );
};

// ── Create Order Modal ─────────────────────────────────────────
const OrderModal = ({ isOpen, onClose, onSaved }) => {
  const [items, setItems] = useState([{ productId: '', variantId: '', quantity: 1 }]);
  const [customerName, setCustomerName] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [memberId, setMemberId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');

  const { data: productsData = [] } = useQuery({ queryKey: ['products'], queryFn: productApi.list, enabled: isOpen });
  const { data: membersData } = useQuery({
    queryKey: ['members-search', memberSearch],
    queryFn: () => memberApi.list({ search: memberSearch || undefined, limit: 10 }),
    enabled: isOpen && memberSearch.length > 1,
  });
  const products = Array.isArray(productsData) ? productsData.filter((p) => p.isActive) : [];
  const members = membersData?.data ?? [];

  React.useEffect(() => {
    if (isOpen) { setItems([{ productId: '', variantId: '', quantity: 1 }]); setCustomerName(''); setMemberId(''); setMemberSearch(''); setAmountPaid(''); }
  }, [isOpen]);

  const getUnitPrice = (item) => {
    const prod = products.find((p) => p.id === item.productId);
    if (!prod) return 0;
    if (item.variantId) {
      const variant = prod.variants?.find((v) => v.id === item.variantId);
      return variant?.sellingPrice ?? prod.sellingPrice;
    }
    return prod.sellingPrice;
  };

  const getMaxStock = (item) => {
    const prod = products.find((p) => p.id === item.productId);
    if (!prod) return 0;
    if (item.variantId) return prod.variants?.find((v) => v.id === item.variantId)?.stock ?? 0;
    return prod.stock;
  };

  const totalAmount = items.reduce((sum, item) => sum + getUnitPrice(item) * (item.quantity || 0), 0);

  const addItem = () => setItems((p) => [...p, { productId: '', variantId: '', quantity: 1 }]);
  const removeItem = (i) => setItems((p) => p.filter((_, idx) => idx !== i));
  const updateItem = (i, f, v) => setItems((p) => p.map((item, idx) =>
    idx === i ? { ...item, [f]: v, ...(f === 'productId' ? { variantId: '' } : {}) } : item
  ));

  const mutation = useMutation({
    mutationFn: () => productApi.createOrder({
      items: items.filter((i) => i.productId).map((i) => ({
        productId: i.productId,
        variantId: i.variantId || undefined,
        quantity: i.quantity,
      })),
      memberId: memberId || undefined,
      customerName: customerName.trim() || undefined,
      paymentMethod,
      amountPaid: amountPaid !== '' ? Number(amountPaid) : totalAmount,
      status: 'COMPLETED',
    }),
    onSuccess: () => { toast.success('Order created!'); onSaved?.(); onClose(); },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Sale Order" width="680px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending || !items.some((i) => i.productId)}>
            <ShoppingCart size={15} />
            {mutation.isPending ? 'Processing...' : 'Confirm Order'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {items.map((item, i) => {
          const prod = products.find((p) => p.id === item.productId);
          const hasVariants = prod?.variants?.length > 0;
          const lineTotal = getUnitPrice(item) * (item.quantity || 0);
          return (
            <div key={i} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <select value={item.productId} onChange={(e) => updateItem(i, 'productId', e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary">
                  <option value="">Select product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}{p.variants?.length > 0 ? ` (${p.variants.length} variants)` : ` — Stock: ${p.stock}`}</option>
                  ))}
                </select>
                {items.length > 1 && (
                  <button onClick={() => removeItem(i)} className="text-rose-400 hover:text-rose-600 p-1 flex-shrink-0"><X size={14} /></button>
                )}
              </div>
              {hasVariants && (
                <select value={item.variantId} onChange={(e) => updateItem(i, 'variantId', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary">
                  <option value="">Select variant</option>
                  {prod.variants.map((v) => (
                    <option key={v.id} value={v.id}>{v.name} — ₹{v.sellingPrice ?? prod.sellingPrice} (Stock: {v.stock})</option>
                  ))}
                </select>
              )}
              {item.productId && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-500">Qty:</label>
                    <input type="number" min="1" max={getMaxStock(item)} value={item.quantity}
                      onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))}
                      className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary" />
                  </div>
                  <div className="text-xs text-slate-500">
                    ₹{getUnitPrice(item).toLocaleString()} each
                  </div>
                  {lineTotal > 0 && (
                    <div className="ml-auto text-sm font-bold text-primary">₹{lineTotal.toLocaleString()}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        <button onClick={addItem} className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline">
          <Plus size={12} /> Add another product
        </button>

        <div className="grid gap-4 md:grid-cols-2 pt-2 border-t border-slate-100">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Customer Name</label>
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Walk-in customer" className={inputCls(false)} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Link to Member (optional)</label>
            <div className="space-y-1.5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                <input value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search by name, phone or ID..." className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-primary focus:bg-white" />
              </div>
              {members.length > 0 && (
                <div className="max-h-32 overflow-y-auto rounded-2xl border border-slate-200 bg-white">
                  {members.map((m) => (
                    <button key={m.id} type="button" onClick={() => { setMemberId(m.id); setMemberSearch(m.fullName); }}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-slate-50 ${memberId === m.id ? 'bg-primary-light text-primary font-semibold' : 'text-slate-700'}`}>
                      <Avatar name={m.fullName} size="xs" />
                      {m.fullName} · {m.phone}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Payment Method</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={inputCls(false)}>
              {['cash', 'upi', 'card', 'bank_transfer'].map((m) => (
                <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1).replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Amount Paid (₹)</label>
            <input type="number" min="0" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)}
              placeholder={`Total: ₹${totalAmount.toLocaleString()}`} className={inputCls(false)} />
          </div>
        </div>

        {totalAmount > 0 && (
          <div className="rounded-2xl bg-primary-light px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Order Total</span>
            <span className="text-xl font-bold text-primary">₹{totalAmount.toLocaleString()}</span>
          </div>
        )}
      </div>
    </Modal>
  );
};

// ── Expandable Variants Row ────────────────────────────────────
const VariantsRow = ({ variants, productId, colSpan, onStockClick }) => (
  <tr>
    <td colSpan={colSpan} className="px-0 pb-0">
      <div className="mx-5 mb-3 rounded-2xl border border-slate-100 bg-slate-50/70 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/60">
              <th className="px-4 py-2 text-left font-semibold text-slate-400">Variant</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-400">SKU</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-400">Sell Price</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-400">Buy Price</th>
              <th className="px-4 py-2 text-left font-semibold text-slate-400">Stock</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {variants.map((v) => (
              <tr key={v.id} className="hover:bg-white transition-colors">
                <td className="px-4 py-2 font-medium text-slate-800">{v.name}</td>
                <td className="px-4 py-2 text-slate-400">{v.sku || '—'}</td>
                <td className="px-4 py-2 font-semibold text-primary">
                  {v.sellingPrice != null ? `₹${v.sellingPrice.toLocaleString()}` : <span className="text-slate-400">Base</span>}
                </td>
                <td className="px-4 py-2 text-slate-500">{v.buyingPrice != null ? `₹${v.buyingPrice.toLocaleString()}` : '—'}</td>
                <td className="px-4 py-2">
                  <span className={`font-semibold ${v.stock <= 5 ? 'text-amber-600' : 'text-slate-700'}`}>
                    {v.stock} {v.stock <= 5 && v.stock > 0 ? '⚠️' : ''}{v.stock === 0 ? ' (Out)' : ''}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <button onClick={() => onStockClick(v)}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-[10px] font-semibold text-slate-600 hover:bg-white transition-colors">
                    Adjust
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </td>
  </tr>
);

// ── Main Page ──────────────────────────────────────────────────
const Products = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('products');
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [stockProduct, setStockProduct] = useState(null);
  const [stockVariant, setStockVariant] = useState(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderPage, setOrderPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState({});

  const { data: productsData = [], isLoading: prodLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productApi.list,
  });
  const products = Array.isArray(productsData) ? productsData : [];

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', orderPage],
    queryFn: () => productApi.listOrders({ page: orderPage, limit: 20 }),
    enabled: tab === 'orders',
  });
  const orders = ordersData?.data ?? [];
  const orderMeta = ordersData?.meta ?? { total: 0, totalPages: 1 };

  const filtered = search
    ? products.filter((p) => `${p.name} ${p.category || ''}`.toLowerCase().includes(search.toLowerCase()))
    : products;

  const deleteMutation = useMutation({
    mutationFn: (id) => productApi.remove(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); toast.success('Product deleted.'); },
    onError: (err) => toast.error(err.message),
  });

  const toggleStoreMutation = useMutation({
    mutationFn: (id) => productApi.toggleStore(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
    onError: (err) => toast.error(err.message),
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  };

  const toggleExpand = (id) => setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));

  const totalProducts = products.length;
  const inStoreCount = products.filter((p) => p.inStore).length;
  const lowStock = products.filter((p) => {
    if (p.variants?.length > 0) return p.variants.some((v) => v.stock <= 5);
    return p.stock <= 5;
  }).length;
  const totalValue = products.reduce((s, p) => {
    if (p.variants?.length > 0) return s + p.variants.reduce((vs, v) => vs + (v.sellingPrice ?? p.sellingPrice) * v.stock, 0);
    return s + p.sellingPrice * p.stock;
  }, 0);

  const TABLE_COLS = ['', 'Photo', 'Product', 'Category', 'Sell Price', 'Buy Price', 'Stock', 'In Store', 'Status', ''];

  return (
    <div className="max-w-[1300px] mx-auto pb-12 space-y-8">
      <ProductModal isOpen={addOpen || Boolean(editProduct)} onClose={() => { setAddOpen(false); setEditProduct(null); }} product={editProduct} onSaved={handleRefresh} />
      <StockModal
        isOpen={Boolean(stockProduct)}
        onClose={() => { setStockProduct(null); setStockVariant(null); }}
        product={stockProduct}
        onSaved={handleRefresh}
      />
      <OrderModal isOpen={orderOpen} onClose={() => setOrderOpen(false)} onSaved={handleRefresh} />

      {/* Header */}
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Products
          </div>
          <h1 className="mt-4 text-[2rem] font-bold tracking-tight text-slate-900">Product & Inventory</h1>
          <p className="mt-2 text-sm text-slate-500">Manage products, variants, stock, and sale orders.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="h-12 rounded-2xl px-5" onClick={() => setOrderOpen(true)}>
            <ShoppingCart size={18} /> New Sale
          </Button>
          <Button className="h-12 rounded-2xl px-5" onClick={() => setAddOpen(true)}>
            <Plus size={18} /> Add Product
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total Products', value: totalProducts, icon: Package, cls: 'text-primary bg-primary-light' },
          { label: 'In Store', value: inStoreCount, icon: Store, cls: 'text-emerald-600 bg-emerald-50' },
          { label: 'Low / Out of Stock', value: lowStock, icon: Boxes, cls: 'text-amber-600 bg-amber-50' },
          { label: 'Stock Value', value: `₹${Math.round(totalValue).toLocaleString()}`, icon: TrendingUp, cls: 'text-cyan-600 bg-cyan-50' },
        ].map(({ label, value, icon: Icon, cls }) => (
          <div key={label} className="card border-slate-200 p-5">
            <div className={`inline-flex rounded-xl p-2 ${cls} mb-3`}><Icon size={18} /></div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="mt-1 text-xs font-medium text-slate-400">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl bg-slate-100 p-1 w-fit">
        {[{ key: 'products', label: 'Products' }, { key: 'orders', label: 'Orders' }].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`rounded-xl px-5 py-2 text-sm font-semibold transition-colors ${tab === t.key ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'products' && (
        <>
          <div className="card border-slate-200 p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or category..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:bg-white" />
            </div>
          </div>

          {prodLoading ? (
            <div className="py-20 text-center text-sm text-slate-400">Loading products...</div>
          ) : filtered.length === 0 ? (
            <div className="card border-slate-200 p-16 flex flex-col items-center text-center">
              <Package size={40} className="text-slate-200 mb-4" />
              <div className="text-lg font-semibold text-slate-700">No products found</div>
              <div className="mt-2 text-sm text-slate-400 mb-6">Add your first product to get started.</div>
              <Button onClick={() => setAddOpen(true)}><Plus size={16} /> Add Product</Button>
            </div>
          ) : (
            <div className="card border-slate-200 shadow-[0_8px_30px_rgba(15,23,42,0.06)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      {TABLE_COLS.map((h) => (
                        <th key={h} className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((prod) => {
                      const isExpanded = expandedRows[prod.id];
                      const hasVariants = prod.variants?.length > 0;
                      const displayStock = hasVariants
                        ? prod.variants.reduce((s, v) => s + v.stock, 0)
                        : prod.stock;
                      const isLow = hasVariants
                        ? prod.variants.some((v) => v.stock <= 5)
                        : prod.stock <= 5;
                      const profit = prod.buyingPrice > 0 ? prod.sellingPrice - prod.buyingPrice : null;

                      return (
                        <React.Fragment key={prod.id}>
                          <tr className={`hover:bg-slate-50/70 transition-colors ${isExpanded ? 'bg-slate-50/50' : ''}`}>
                            {/* Expand toggle */}
                            <td className="px-4 py-3 w-10">
                              {hasVariants && (
                                <button onClick={() => toggleExpand(prod.id)}
                                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors">
                                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>
                              )}
                            </td>

                            {/* Photo */}
                            <td className="px-4 py-3 w-14">
                              {prod.images?.length > 0 ? (
                                <img src={prod.images[0]} alt={prod.name}
                                  className="h-11 w-11 rounded-xl object-cover border border-slate-200" />
                              ) : (
                                <div className="h-11 w-11 rounded-xl bg-slate-100 flex items-center justify-center">
                                  <Package size={18} className="text-slate-300" />
                                </div>
                              )}
                            </td>

                            {/* Name */}
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-900">{prod.name}</div>
                              {prod.description && (
                                <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{prod.description}</div>
                              )}
                              {hasVariants && (
                                <button onClick={() => toggleExpand(prod.id)}
                                  className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline">
                                  <Layers size={10} /> {prod.variants.length} variant{prod.variants.length > 1 ? 's' : ''}
                                </button>
                              )}
                            </td>

                            {/* Category */}
                            <td className="px-4 py-3">
                              {prod.category ? (
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                                  {prod.category}
                                </span>
                              ) : <span className="text-slate-300">—</span>}
                            </td>

                            {/* Sell price */}
                            <td className="px-4 py-3">
                              <div className="font-bold text-slate-900">₹{prod.sellingPrice.toLocaleString()}</div>
                              {profit !== null && (
                                <div className="text-[10px] text-emerald-600 font-medium">+₹{profit.toLocaleString()} margin</div>
                              )}
                            </td>

                            {/* Buy price */}
                            <td className="px-4 py-3 text-[12px] text-slate-500">
                              {prod.buyingPrice > 0 ? `₹${prod.buyingPrice.toLocaleString()}` : '—'}
                            </td>

                            {/* Stock */}
                            <td className="px-4 py-3">
                              <div className={`font-semibold text-[13px] ${isLow ? 'text-amber-600' : 'text-slate-800'}`}>
                                {hasVariants ? `${displayStock} total` : `${prod.stock} units`}
                              </div>
                              {isLow && <div className="text-[10px] text-amber-500 font-medium">Low stock</div>}
                              {!hasVariants && (
                                <button onClick={() => setStockProduct(prod)}
                                  className="mt-1 text-[10px] text-primary font-semibold hover:underline">
                                  Adjust
                                </button>
                              )}
                            </td>

                            {/* In Store checkbox */}
                            <td className="px-4 py-3">
                              <label className="flex cursor-pointer items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={prod.inStore}
                                  onChange={() => toggleStoreMutation.mutate(prod.id)}
                                  className="h-4 w-4 rounded accent-primary cursor-pointer"
                                />
                                <span className={`text-xs font-semibold ${prod.inStore ? 'text-emerald-600' : 'text-slate-400'}`}>
                                  {prod.inStore ? 'Yes' : 'No'}
                                </span>
                              </label>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3">
                              <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                                prod.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                              }`}>
                                {prod.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                {hasVariants && (
                                  <button onClick={() => setStockProduct(prod)}
                                    className="rounded-xl border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors whitespace-nowrap">
                                    Stock
                                  </button>
                                )}
                                <button onClick={() => setEditProduct(prod)}
                                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                                  <Pencil size={14} />
                                </button>
                                <button onClick={() => { if (window.confirm(`Delete "${prod.name}"?`)) deleteMutation.mutate(prod.id); }}
                                  className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Variants sub-table */}
                          {isExpanded && hasVariants && (
                            <VariantsRow
                              variants={prod.variants}
                              productId={prod.id}
                              colSpan={TABLE_COLS.length}
                              onStockClick={(v) => setStockProduct({ ...prod, _focusVariant: v.id })}
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-xs text-slate-500">
                {filtered.length} product{filtered.length !== 1 ? 's' : ''}
                {search ? ` matching "${search}"` : ' total'}
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'orders' && (
        <>
          {ordersLoading ? (
            <div className="py-20 text-center text-sm text-slate-400">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="card border-slate-200 p-16 flex flex-col items-center text-center">
              <ShoppingCart size={40} className="text-slate-200 mb-4" />
              <div className="text-lg font-semibold text-slate-700">No orders yet</div>
              <div className="mt-2 text-sm text-slate-400 mb-6">Create your first sale order.</div>
              <Button onClick={() => setOrderOpen(true)}><ShoppingCart size={16} /> New Sale</Button>
            </div>
          ) : (
            <div className="card border-slate-200 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      {['Customer', 'Items', 'Date', 'Payment', 'Status', 'Total'].map((h) => (
                        <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900">
                            {order.member?.fullName || order.customerName || 'Walk-in'}
                          </div>
                          {order.member?.phone && <div className="text-[11px] text-slate-400">{order.member.phone}</div>}
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-600 space-y-0.5">
                          {order.items?.map((item, i) => (
                            <div key={i}>
                              {item.product?.name}{item.variant ? ` (${item.variant.name})` : ''} × {item.quantity}
                            </div>
                          ))}
                        </td>
                        <td className="px-5 py-4 text-[12px] text-slate-500">
                          {order.createdAt ? format(new Date(order.createdAt), 'dd MMM yyyy') : '—'}
                        </td>
                        <td className="px-5 py-4 text-[12px] text-slate-500 capitalize">
                          {order.paymentMethod?.replace('_', ' ') || '—'}
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border-emerald-200">
                            {order.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-900">
                          ₹{(order.amountPaid ?? order.totalAmount)?.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-sm text-slate-500">
                <span><strong className="text-slate-800">{orderMeta.total}</strong> orders</span>
                {orderMeta.totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button disabled={orderPage === 1} onClick={() => setOrderPage((p) => p - 1)}
                      className="rounded-xl border border-slate-200 px-3 py-1 text-xs font-semibold disabled:opacity-40 hover:bg-white">Prev</button>
                    <span className="text-xs font-semibold">{orderPage} / {orderMeta.totalPages}</span>
                    <button disabled={orderPage === orderMeta.totalPages} onClick={() => setOrderPage((p) => p + 1)}
                      className="rounded-xl border border-slate-200 px-3 py-1 text-xs font-semibold disabled:opacity-40 hover:bg-white">Next</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;

export const RestaurantSkeleton = () => (
  <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="h-5 w-2/3 rounded bg-slate-200" />
    <div className="mt-3 h-4 w-full rounded bg-slate-100" />
    <div className="mt-2 h-4 w-3/4 rounded bg-slate-100" />
    <div className="mt-4 h-9 w-28 rounded-lg bg-slate-200" />
  </div>
);

export const MenuSkeleton = () => (
  <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="h-5 w-1/2 rounded bg-slate-200" />
    <div className="mt-3 h-4 w-full rounded bg-slate-100" />
    <div className="mt-3 h-8 w-20 rounded bg-slate-200" />
  </div>
);

export const CartSkeleton = () => (
  <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="h-5 w-1/3 rounded bg-slate-200" />
    <div className="mt-3 h-4 w-2/3 rounded bg-slate-100" />
    <div className="mt-3 h-9 w-full rounded bg-slate-200" />
  </div>
);

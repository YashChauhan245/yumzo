import { Link } from 'react-router-dom';

const EmptyState = ({ title, description, ctaLabel, ctaTo }) => {
  return (
    <div className="surface-card rounded-2xl border-dashed border-slate-300 px-6 py-12 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-xl text-orange-600">
        +
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{description}</p>
      {ctaLabel && ctaTo ? (
        <Link
          to={ctaTo}
          className="mt-5 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
};

export default EmptyState;

import { Link } from 'react-router-dom';

const EmptyState = ({ title, description, ctaLabel, ctaTo }) => {
  return (
    <div className="surface-card rounded-2xl border-dashed border-[#2A2A2A] px-6 py-10 text-left">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-[#2A2A2A] bg-[#0B0B0B] text-lg text-[#D4D4D8]">
        •
      </div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-[#A1A1AA]">{description}</p>
      {ctaLabel && ctaTo ? (
        <Link
          to={ctaTo}
          className="mt-5 inline-flex rounded-xl border border-[#2A2A2A] bg-[#0B0B0B] px-4 py-2 text-sm font-medium text-white transition-colors hover:border-[#3A3A3A] hover:text-[#D4D4D8]"
        >
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
};

export default EmptyState;

import { Link } from 'react-router-dom';
import logoIcon from '../assets/images/logo-icon.png';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = '' }: LogoProps) {
  return (
    <Link
      to="/"
      aria-label="Cric World home"
      className={`group inline-flex shrink-0 items-center gap-3 ${className}`}
    >
      <img
        src={logoIcon}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="
          h-14
          w-14
          shrink-0
          object-contain
          scale-125
          drop-shadow-[0_0_14px_rgba(233,196,106,0.4)]
          transition-all
          duration-500
          group-hover:scale-[1.35]
          group-hover:drop-shadow-[0_0_24px_rgba(233,196,106,0.65)]
        "
      />

      <span className="font-display text-xl font-extrabold leading-none tracking-tight">
        <span className="text-white">CRIC</span>
        <span className="ml-1.5 text-gradient-gold">WORLD</span>
      </span>
    </Link>
  );
}
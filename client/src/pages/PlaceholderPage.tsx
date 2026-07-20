import { EmptyState } from '../components/states';

// Generic "coming soon" page for nav sections not built in this foundation
// (Tournaments, Teams, Players, Rankings, News).
export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-black tracking-tight text-white">{title}</h1>
      <p className="mt-2 text-slate-400">This section is part of the CRIC WORLD roadmap.</p>
      <div className="mt-8">
        <EmptyState
          title={`${title} is coming soon`}
          message="The foundation is in place. This page will be built out in a future development phase."
        />
      </div>
    </div>
  );
}

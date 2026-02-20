import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page">
      <header className="page-header">
        <p className="eyebrow">404</p>
        <h1 className="page-title">Page Not Found</h1>
        <p className="page-intro">The requested page does not exist in this archive.</p>
      </header>
      <Link href="/works" className="button-link">
        Back to Projects
      </Link>
    </section>
  );
}

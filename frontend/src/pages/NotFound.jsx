import { Link } from "react-router-dom";
import { Card } from "../components/Card.jsx";

export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <Card className="max-w-md text-center">
        <p className="font-geist text-[11px] uppercase text-primary">404</p>
        <h1 className="mt-xs text-2xl font-bold text-on-surface">Page not found</h1>
        <p className="mt-sm text-sm text-on-surface-variant">The requested intelliSOC route does not exist.</p>
        <Link className="mt-lg inline-block rounded bg-primary px-md py-sm font-geist text-[11px] font-bold uppercase text-on-primary" to="/investigations/new">
          Return Home
        </Link>
      </Card>
    </div>
  );
}

import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full bg-bg border-t border-border mt-20">

  <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">

    {/* Brand */}
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-textDark flex items-center gap-2">
        <span className="text-brand">🧺</span> LocalMart
      </h2>

      <p className="mt-4 text-textMuted leading-relaxed text-sm max-w-xs">
        Buy and sell locally with trust. A premium marketplace experience
        built for simplicity, safety, and speed.
      </p>
    </div>

    {/* Explore */}
    <div>
      <h3 className="font-semibold text-textDark mb-4">Explore</h3>
      <ul className="space-y-3 text-sm">
        {[
          { name: "Home", link: "/" },
          { name: "Categories", link: "/" },
          { name: "Sell Product", link: "/sell" },
          { name: "My Profile", link: "/profile" },
        ].map((item) => (
          <li key={item.name}>
            <Link
              to={item.link}
              className="text-textMuted hover:text-brand transition-colors duration-200"
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>

    {/* Support */}
    <div>
      <h3 className="font-semibold text-textDark mb-4">Support</h3>
      <ul className="space-y-3 text-sm">
        {[
          { name: "Help Center", link: "/help" },
          { name: "Safety Tips", link: "/safety" },
          { name: "Terms & Conditions", link: "/terms" },
          { name: "Privacy Policy", link: "/privacy" },
        ].map((item) => (
          <li key={item.name}>
            <Link
              to={item.link}
              className="text-textMuted hover:text-brand transition-colors duration-200"
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>

    {/* Contact */}
    <div>
      <h3 className="font-semibold text-textDark mb-4">Contact</h3>
      <ul className="space-y-3 text-textMuted text-sm">
        <li className="hover:text-brand transition">support@localmart.com</li>
        <li>India</li>
      </ul>

      {/* CTA */}
      <div className="mt-6">
        <button className="text-sm px-4 py-2 rounded-lg bg-brand text-white hover:opacity-90 transition">
          Contact Support
        </button>
      </div>
    </div>

  </div>

  {/* Bottom bar */}
  <div className="border-t border-border bg-white">
    <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between text-sm text-textMuted">
      <p>© {new Date().getFullYear()} LocalMart. All rights reserved.</p>

      <div className="flex gap-6 mt-4 md:mt-0">
        <Link to="/terms" className="hover:text-brand transition">Terms</Link>
        <Link to="/privacy" className="hover:text-brand transition">Privacy</Link>
      </div>
    </div>
  </div>

</footer>
  );
}
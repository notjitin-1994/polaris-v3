type SiteFooterProps = {
  className?: string;
};

export default function SiteFooter({ className }: SiteFooterProps) {
  return (
    <footer
      className={`w-full border-t border-white/10 bg-gradient-to-b from-transparent to-black/40 backdrop-blur-sm ${
        className || ''
      }`}
      aria-label="Site footer"
    >
      <div className="container mx-auto px-4 py-10 md:py-14">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <img src="/images/logos/logo.png" alt="SmartSlate" className="h-7 w-auto" />
            </div>
            <p className="mt-3 max-w-xs font-['Lato'] text-sm text-white/60">
              Empowering teams to create, collaborate, and launch better.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 md:col-span-3">
            <div>
              <h4 className="font-['Quicksand'] text-sm font-semibold tracking-wide text-white/80">
                Product
              </h4>
              <ul className="mt-4 space-y-2 font-['Lato'] text-sm text-white/60">
                <li>Polaris</li>
                <li>Constellation</li>
                <li>Nova</li>
                <li>Orbit</li>
                <li>Spectrum</li>
              </ul>
            </div>
            <div>
              <h4 className="font-['Quicksand'] text-sm font-semibold tracking-wide text-white/80">
                Company
              </h4>
              <ul className="mt-4 space-y-2 font-['Lato'] text-sm text-white/60">
                <li>Home</li>
                <li>Ignite</li>
                <li>Strategic Skills Architecture</li>
              </ul>
            </div>
            <div>
              <h4 className="font-['Quicksand'] text-sm font-semibold tracking-wide text-white/80">
                Resources
              </h4>
              <ul className="mt-4 space-y-2 font-['Lato'] text-sm text-white/60">
                <li>Get Started</li>
                <li>Documentation</li>
                <li>Tutorials</li>
              </ul>
            </div>
            <div>
              <h4 className="font-['Quicksand'] text-sm font-semibold tracking-wide text-white/80">
                Legal
              </h4>
              <ul className="mt-4 space-y-2 font-['Lato'] text-sm text-white/60">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 md:flex-row">
          <p className="font-['Lato'] text-xs text-white/50">
            © {new Date().getFullYear()} SmartSlate. All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-white/40"></div>
        </div>
      </div>
    </footer>
  );
}

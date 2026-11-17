import Link from "next/link";

import BrandWordmark from "@/components/BrandWordmark";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="store-footer">
      <div className="container mx-auto px-4">
        <div className="store-footer__grid">
          <div>
            <Link
              href="/"
              className="store-footer__brand"
              aria-label="Colored Kitchen, home"
            >
              <BrandWordmark className="brand-wordmark--footer" />
            </Link>
            <p className="store-footer__blurb">
              Premium kitchen utensils for every cooking need. Quality products
              that last a lifetime.
            </p>
          </div>

          <nav aria-label="Footer" className="store-footer__group">
            <h2 className="store-footer__heading">Shop</h2>
            <ul className="store-footer__links">
              <li>
                <Link href="/" className="store-footer__link">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="store-footer__link">
                  All products
                </Link>
              </li>
              <li>
                <Link href="/cart" className="store-footer__link">
                  Cart
                </Link>
              </li>
            </ul>
          </nav>

          <div className="store-footer__group">
            <h2 className="store-footer__heading">Contact</h2>
            <address className="store-footer__contact">
              Eket Close, off Lokoja street
              <br />
              Area 8, Garki, Abuja
              <br />
              <a href="mailto:bilkisayo@gmail.com">bilkisayo@gmail.com</a>
              <br />
              <a href="tel:+2348055737894">+234 805 573 7894</a>
            </address>
          </div>
        </div>

        <div className="store-footer__bottom">
          <p>© {year} Colored Kitchen</p>
          <p>Abuja, Nigeria</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

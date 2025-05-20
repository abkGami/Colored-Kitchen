import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-100 pt-10 pb-6 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Kitchen Utensil Emporium
            </h3>
            <p className="text-gray-600">
              Premium kitchen utensils for every cooking need. Quality products
              that last a lifetime.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-pink-500">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-gray-600 hover:text-pink-500"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-600 hover:text-pink-500">
                  Cart
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <p className="text-gray-600">
              Eket Close, off Lokoja street
              <br />
              Area 8, Garki, Abuja
              <br />
              Email: bilkisayo@gmail.com
              <br />
              Phone: +234 805 573 7894
            </p>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-gray-600 text-sm">
          © {new Date().getFullYear()} abkGami
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React from "react";
import "boxicons/css/boxicons.min.css";

const Footer = () => {
  return (
    <footer
      className="
        bg-black text-white py-8 px-4 
        flex flex-col items-center justify-center gap-6 text-center 
        md:relative md:bottom-auto 
        fixed bottom-0 left-0 w-full z-10 md:w-auto
      "
    >
      {/* Social Icons */}
      <div className="flex justify-center gap-8 text-4xl md:text-5xl">
        <a
          href="https://www.instagram.com/jehnshra/"
          target="_blank"
          rel="noreferrer"
          className="hover:text-pink-500 transition-all duration-300"
        >
          <i className="bx bxl-instagram"></i>
        </a>
        <a
          href="https://mail.google.com/mail/u/0/#search/jejesahira0103%40gmail.com?compose=new"
          className="hover:text-blue-400 transition-all duration-300"
        >
          <i className="bx bx-envelope"></i>
        </a>
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noreferrer"
          className="hover:text-blue-600 transition-all duration-300"
        >
          <i className="bx bxl-facebook-circle"></i>
        </a>
      </div>

      {/* Credit */}
      <div className="text-lg md:text-xl font-light tracking-wide">
        <p>
          Created by{" "}
          <a
            href="https://www.instagram.com/jehnshra/"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-white hover:text-pink-500 transition-all"
          >
            BeautyInsight.
          </a>{" "}
          | © 2025
        </p>
      </div>
    </footer>
  );
};

export default Footer;

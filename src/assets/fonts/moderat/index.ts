import localFont from "next/font/local";

const moderat = localFont({
  src: [
    {
      path: "./Moderat-Medium.otf",
      weight: "400",
      style: "normal"
    }
  ],
  variable: "--font-moderat"
});

export { moderat };

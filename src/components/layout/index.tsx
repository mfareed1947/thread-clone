import React from "react";
import { ThemeProvider } from "../theme-provider";

// import BaseComponent from "@/components/base/BaseComponent";

const LayoutTheme = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </>
  );
};

export default LayoutTheme;

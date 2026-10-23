import React from "react";

type Props = {
  children: React.ReactNode;
};

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-6 lg:px-8">
      <main className="mt-3">
        <div className="shadow-md bg-white">{children}</div>
      </main>
    </div>
  );
};

export default Layout;

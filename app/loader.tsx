import React from "react";
import { RiLoader5Fill } from "react-icons/ri";

const Loader = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <RiLoader5Fill className="w-16 h-16 animate-spin text-primary" />
    </div>
  );
};

export default Loader;

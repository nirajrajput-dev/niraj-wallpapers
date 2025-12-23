import React from "react";

interface ContainerProps {
  children: React.ReactNode;
}

export default function Container({ children }: ContainerProps) {
  return <div className="w-full max-w-[1024px] mx-auto px-8">{children}</div>;
}

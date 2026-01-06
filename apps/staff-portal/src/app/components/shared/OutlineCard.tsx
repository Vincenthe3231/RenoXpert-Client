"use client";
import { CustomizerContext } from "@/app/context/CustomizerContext";

import { Card } from "@/components/ui/card";
import React, { useContext } from "react";


interface MyAppProps {
  children: React.ReactNode;
  className?: string;
}
const OutlineCard: React.FC<MyAppProps> = ({ children, className }) => {
  const { activeMode, isCardShadow } = useContext(CustomizerContext);
  return (
    <Card className={`card no-inset no-ring`}>{children}</Card>
  );

};

export default OutlineCard;
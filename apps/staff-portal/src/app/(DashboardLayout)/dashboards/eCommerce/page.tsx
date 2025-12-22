
import { Expense } from "@/app/components/dashboards/eCommerce/Expense";
import { IncrementedSales } from "@/app/components/dashboards/eCommerce/IncrementedSales";
import { MonthlyEarning } from "@/app/components/dashboards/eCommerce/MonthlyEarning";
import { PaymentGateway } from "@/app/components/dashboards/eCommerce/PaymentGateways";
import { RecentTransaction } from "@/app/components/dashboards/eCommerce/RecentTransaction";
import { Sales } from "@/app/components/dashboards/eCommerce/Sales";
import { SalesGrowth } from "@/app/components/dashboards/eCommerce/SalesGrowth";
import { TopProduct } from "@/app/components/dashboards/eCommerce/TopProduct";
import { QuarterlyStats } from "@/app/components/dashboards/eCommerce/QuarterlyStats";
import { WelcomeCard } from "@/app/components/dashboards/eCommerce/WelcomeCard";
import { YearlySales } from "@/app/components/dashboards/eCommerce/WeeklySales";
import CustomerSegmentation from "@/app/components/dashboards/eCommerce/CustomerSegmentation";
import UserActivity from "@/app/components/dashboards/eCommerce/UseActivity";
import { Metadata } from "next";
import React from "react";
export const metadata: Metadata = {
  title: "eCommerce Admin Dashboard",
  description: "eCommerce template page",
};

const page = () => {
  return (
    <>
      <div className="grid grid-cols-12 gap-6">
        <div className="lg:col-span-8 col-span-12">
          <WelcomeCard />
        </div>
        <div className="lg:col-span-4 col-span-12">
          <div className="grid grid-cols-12 gap-6">
            <div className="sm:col-span-6 col-span-12">
              <Expense />
            </div>
            <div className="sm:col-span-6 col-span-12">
              <Sales />
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 col-span-12">
          <UserActivity />
        </div>
        <div className="lg:col-span-4 col-span-12">
          <CustomerSegmentation />
        </div>
        <div className="lg:col-span-4 col-span-12">
          <div className="grid grid-cols-12 gap-6">
            <div className="sm:col-span-6 col-span-12">
              <IncrementedSales />
            </div>
            <div className="sm:col-span-6 col-span-12">
              <SalesGrowth />
            </div>
          </div>
          <MonthlyEarning />
        </div>
        <div className="lg:col-span-4 col-span-12">
          <QuarterlyStats />
        </div>
        <div className="lg:col-span-4 col-span-12">
          <YearlySales />
        </div>
        <div className="lg:col-span-4 col-span-12">
          <PaymentGateway />
        </div>
        <div className="lg:col-span-4 col-span-12">
          <RecentTransaction />
        </div>
        <div className="lg:col-span-8 col-span-12">
          <TopProduct />
        </div>
      </div>

    </>
  );
};

export default page;

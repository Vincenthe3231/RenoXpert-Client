"use client";
import { CustomizerContext } from "@/app/context/CustomizerContext";
import { Select, SelectItem, SelectContent, SelectValue, SelectTrigger, SelectGroup } from "@/app/components/shadcn-ui/Default-Ui/select";
import { Card } from "flowbite-react";
import React, { useContext } from "react";

interface TitleCardProps {
    selectPlaceholder?: string;
    selectOptions: { value: string, label: string }[];
    selectDefaultValue?: string;
    selectValue?: string;
    onSelectChange?: (value: string) => void;
    children: React.ReactNode;
    className?: string;
}

const TitleSelectionCard: React.FC<TitleCardProps> = ({
    selectPlaceholder,
    selectOptions,
    selectDefaultValue,
    selectValue,
    onSelectChange,
    children,
    className,
}) => {
    const { activeMode, isCardShadow, isBorderRadius } =
        useContext(CustomizerContext);

    return (
        <Card
            className={`card no-inset no-ring ${className} ${isCardShadow
                ? "dark:shadow-dark-md shadow-md p-0"
                : "shadow-none border border-ld p-0"
                }`}
            style={{
                borderRadius: `${isBorderRadius}px`,
            }}
        >
            <div className="flex justify-between items-center border-b border-ld px-6 py-2">
                <h5 className="text-xl font-semibold">
                    <Select
                        value={selectValue}
                        defaultValue={selectDefaultValue}
                        onValueChange={onSelectChange}
                    >
                        <SelectTrigger className="w-[180px] border-0">
                            <SelectValue placeholder={selectPlaceholder} />
                        </SelectTrigger>
                        <SelectContent className="shadow-md">
                            <SelectGroup className="">
                                {selectOptions?.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </h5>

                <div className="flex gap-2">

                </div>
            </div>
            <div className="pt-4 p-6">{children}</div>
        </Card>
    );
};

export default TitleSelectionCard;

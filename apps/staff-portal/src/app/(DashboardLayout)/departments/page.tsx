"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Grid3X3, List, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDepartments, Department } from "@/hooks/useDepartmentData";
import { AddDepartmentDialog } from "./components/AddDepartmentDialog";
import { DepartmentCard } from "./components/DepartmentCard";
import { DepartmentEmptyState } from "./components/DepartmentEmptyState";
import { EditDepartmentDialog } from "./components/EditDepartmentDialog";
import { DeleteDepartmentDialog } from "./components/DeleteDepartmentDialog";

type SortOption = "name" | "createdAt" | "memberCount";
type ViewMode = "grid" | "list";

export default function Departments() {
  const { data: departments = [], isLoading } = useDepartments();
  
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  
  // Dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  // Filter and sort departments
  const filteredDepartments = useMemo(() => {
    let result = [...departments];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          (d.description?.toLowerCase().includes(query) ?? false)
      );
    }
    
    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "createdAt":
          const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bDate - aDate;
        case "memberCount":
          return (b.memberCount || 0) - (a.memberCount || 0);
        default:
          return 0;
      }
    });
    
    return result;
  }, [departments, searchQuery, sortBy]);

  const handleOpenEditDialog = (department: Department) => {
    setSelectedDepartment(department);
    setEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (department: Department) => {
    setSelectedDepartment(department);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Department Management
        </h1>
        <p className="text-muted-foreground">
          Organize and manage your organization's departments
        </p>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search and Sort */}
        <div className="flex flex-1 items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Sort */}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[140px]">
              <div className="flex items-center gap-2">
                <ArrowUp className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Sort by" />
                <ArrowDown className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="createdAt">Date Created</SelectItem>
              <SelectItem value="memberCount">Member Count</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Toggle and Add Button */}
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-border/50 bg-card/50 p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Add Button */}
          <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Department
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-48 rounded-xl bg-muted/50 animate-pulse"
            />
          ))}
        </div>
      ) : filteredDepartments.length === 0 ? (
        searchQuery ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">
              No departments found
            </h3>
            <p className="text-muted-foreground text-sm">
              No departments match "{searchQuery}"
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setSearchQuery("")}
            >
              Clear search
            </Button>
          </div>
        ) : (
          <DepartmentEmptyState onCreateClick={() => setAddDialogOpen(true)} />
        )
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              : "flex flex-col gap-3"
          }
        >
          <AnimatePresence mode="popLayout">
            {filteredDepartments.map((department, index) => (
              <DepartmentCard
                key={department.id}
                department={department}
                index={index}
                viewMode={viewMode}
                onOpenEditDialog={handleOpenEditDialog}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Dialogs */}
      <AddDepartmentDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      
      <EditDepartmentDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        department={selectedDepartment}
        onDelete={handleOpenDeleteDialog}
      />
      
      <DeleteDepartmentDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        department={selectedDepartment}
      />
    </div>
  );
}

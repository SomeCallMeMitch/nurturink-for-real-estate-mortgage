import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Plus, Upload, RefreshCw, X, Star } from "lucide-react";

export default function FindClientsFilters({
  searchQuery,
  onSearchChange,
  showFavoritesOnly,
  onToggleFavoritesOnly,
  availableTags,
  selectedTags,
  onToggleTag,
  uploadedFilter,
  onUploadedFilterChange,
  hasActiveFilters,
  activeFiltersBadges,
  onClearFilters,
  onOpenAddClient,
  onOpenImport,
  onRefresh,
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-lg">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <Input
            value={searchQuery || ""}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search by name, company, email, city, or state..."
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center justify-end">
          <Button variant="outline" size="sm" onClick={onRefresh} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-2 bg-gray-900 hover:bg-gray-800 text-white">
                <Plus className="w-4 h-4" />
                Add / Import
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onOpenAddClient}>
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenImport}>
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={!!showFavoritesOnly} onCheckedChange={() => onToggleFavoritesOnly?.()} />
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              Favorites only
            </span>
          </label>

          <div className="w-full md:w-56">
            <Select value={uploadedFilter || "all"} onValueChange={(v) => onUploadedFilterChange?.(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by added date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="today">Added Today</SelectItem>
                <SelectItem value="7days">Added Last 7 Days</SelectItem>
                <SelectItem value="30days">Added Last 30 Days</SelectItem>
                <SelectItem value="manual">Manual Only</SelectItem>
                <SelectItem value="imported">Imported Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            {(availableTags || []).map((tag) => {
              const active = Array.isArray(selectedTags) && selectedTags.includes(tag);
              return (
                <Button
                  key={tag}
                  variant={active ? "default" : "outline"}
                  size="sm"
                  onClick={() => onToggleTag?.(tag)}
                >
                  {tag}
                </Button>
              );
            })}
          </div>
        </div>

        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters} className="gap-2">
            <X className="w-4 h-4" />
            Clear Filters
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 pt-2 border-t">
          <span className="font-medium">Active filters:</span>
          {activeFiltersBadges?.searchQuery ? (
            <Badge variant="secondary">Search: "{activeFiltersBadges.searchQuery}"</Badge>
          ) : null}
          {activeFiltersBadges?.showFavoritesOnly ? <Badge variant="secondary">Favorites Only</Badge> : null}
          {activeFiltersBadges?.selectedTagsCount ? (
            <Badge variant="secondary">{activeFiltersBadges.selectedTagsCount} Tag(s)</Badge>
          ) : null}
          {activeFiltersBadges?.uploadedFilter && activeFiltersBadges.uploadedFilter !== "all" ? (
            <Badge variant="secondary">{activeFiltersBadges.uploadedFilter}</Badge>
          ) : null}
        </div>
      )}
    </div>
  );
}
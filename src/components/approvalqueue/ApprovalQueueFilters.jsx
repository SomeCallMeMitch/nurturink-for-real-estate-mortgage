import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

/**
 * ApprovalQueueFilters Component
 * 
 * Filter controls for the approval queue.
 * 
 * Props:
 * - campaigns: Array of Campaign objects for dropdown
 * - filters: { search, campaignId, dateFrom, dateTo }
 * - onFiltersChange: (newFilters) => void
 * - onClearFilters: () => void
 */
export default function ApprovalQueueFilters({
  campaigns = [],
  filters = {},
  onFiltersChange,
  onClearFilters
}) {
  const [dateFromOpen, setDateFromOpen] = React.useState(false);
  const [dateToOpen, setDateToOpen] = React.useState(false);

  const hasActiveFilters = filters.search || filters.campaignId || filters.dateFrom || filters.dateTo;

  const handleSearchChange = (e) => {
    onFiltersChange({ ...filters, search: e.target.value });
  };

  const handleCampaignChange = (value) => {
    onFiltersChange({ ...filters, campaignId: value === 'all' ? null : value });
  };

  const handleDateFromChange = (date) => {
    onFiltersChange({ ...filters, dateFrom: date ? format(date, 'yyyy-MM-dd') : null });
    setDateFromOpen(false);
  };

  const handleDateToChange = (date) => {
    onFiltersChange({ ...filters, dateTo: date ? format(date, 'yyyy-MM-dd') : null });
    setDateToOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by client name..."
          value={filters.search || ''}
          onChange={handleSearchChange}
          className="pl-9"
        />
      </div>

      {/* Campaign Filter */}
      <Select
        value={filters.campaignId || 'all'}
        onValueChange={handleCampaignChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Campaigns" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Campaigns</SelectItem>
          {campaigns.map(campaign => (
            <SelectItem key={campaign.id} value={campaign.id}>
              {campaign.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date From */}
      <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
            {filters.dateFrom ? format(new Date(filters.dateFrom), 'MMM d, yyyy') : 'From date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
            onSelect={handleDateFromChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Date To */}
      <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
            {filters.dateTo ? format(new Date(filters.dateTo), 'MMM d, yyyy') : 'To date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.dateTo ? new Date(filters.dateTo) : undefined}
            onSelect={handleDateToChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="text-muted-foreground"
        >
          <X className="w-4 h-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
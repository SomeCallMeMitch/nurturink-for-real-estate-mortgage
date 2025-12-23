import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";

function SortIcon({ isActive, direction }) {
  if (!isActive) return <ChevronsUpDown className="w-4 h-4 opacity-40" />;
  return direction === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
}

export default function ClientsTable({
  clients,
  favoriteClientIds,
  sortColumn,
  sortDirection,
  onSort,
  onToggleFavorite,
  selectedClientIds,
  onToggleClient,
  onToggleAllVisible,
  onRowClick,
}) {
  const rows = Array.isArray(clients) ? clients : [];
  const visibleIds = rows.map((c) => c?.id).filter(Boolean);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedClientIds.includes(id));

  if (rows.length === 0) {
    return (
      <div className="p-8 text-center text-gray-600">
        No clients match your filters.
      </div>
    );
  }

  const headerCell = (key, label, className) => (
    <TableHead onClick={() => onSort?.(key)} className={"cursor-pointer select-none " + (className || "")}>
      <div className="flex items-center gap-2">
        <span>{label}</span>
        <SortIcon isActive={sortColumn === key} direction={sortDirection} />
      </div>
    </TableHead>
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <Checkbox checked={allSelected} onCheckedChange={() => onToggleAllVisible?.()} />
          </TableHead>
          {headerCell("fullName", "Name")}
          {headerCell("company", "Company")}
          {headerCell("city", "City")}
          {headerCell("state", "State")}
          {headerCell("lastNoteSentDate", "Last Note Sent")}
          <TableHead>Tags</TableHead>
          <TableHead onClick={() => onSort?.("favorite")} className="w-14 cursor-pointer select-none">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <SortIcon isActive={sortColumn === "favorite"} direction={sortDirection} />
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {rows.map((client) => {
          const id = client?.id;
          const selected = selectedClientIds.includes(id);
          const isFav = favoriteClientIds?.has?.(id);
          const fullName = `${client?.firstName || ""} ${client?.lastName || ""}`.trim() || "(No name)";
          const lastNote = client?.lastNoteSentDate ? new Date(client.lastNoteSentDate).toLocaleDateString() : "—";

          return (
            <TableRow
              key={id}
              className={selected ? "bg-[hsl(var(--selection-bg))]" : ""}
              onClick={() => onRowClick?.(client)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox checked={selected} onCheckedChange={() => onToggleClient?.(id)} />
              </TableCell>
              <TableCell className={selected ? "text-[hsl(var(--selection-text))] font-semibold" : ""}>
                {fullName}
              </TableCell>
              <TableCell>{client?.company || ""}</TableCell>
              <TableCell>{client?.city || ""}</TableCell>
              <TableCell>{client?.state || ""}</TableCell>
              <TableCell>{lastNote}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(client?.tags) && client.tags.length > 0
                    ? client.tags.slice(0, 3).map((t) => <Badge key={t} variant="secondary">{t}</Badge>)
                    : <span className="text-gray-400">—</span>}
                </div>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" onClick={(e) => onToggleFavorite?.(id, e)}>
                  <Star className={isFav ? "w-4 h-4 fill-yellow-400 text-yellow-500" : "w-4 h-4"} />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
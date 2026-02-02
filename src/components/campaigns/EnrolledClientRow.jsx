import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

// UI Components
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Icons
import { MoreVertical, User, UserX, UserCheck, ExternalLink, Calendar, Send, Clock } from 'lucide-react';

/**
 * EnrolledClientRow Component
 * Displays a single enrolled client row with actions
 * 
 * @param {Object} enrollment - Enrollment data with client info
 * @param {Function} onExclude - Callback to exclude client
 * @param {Function} onReactivate - Callback to reactivate excluded client
 * @param {string} campaignType - Type of campaign for trigger date label
 */
export default function EnrolledClientRow({ 
  enrollment, 
  onExclude, 
  onReactivate,
  campaignType 
}) {
  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  // Get trigger date label based on campaign type
  const getTriggerLabel = () => {
    switch (campaignType) {
      case 'birthday': return 'Birthday';
      case 'welcome': return 'Policy Start';
      case 'renewal': return 'Renewal';
      default: return 'Trigger Date';
    }
  };

  const isExcluded = enrollment.status === 'excluded';

  return (
    <div className={`flex items-center gap-4 p-4 border-b border-border hover:bg-muted/50 transition-colors ${isExcluded ? 'opacity-60' : ''}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
          isExcluded ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
        }`}>
          {getInitials(enrollment.clientName)}
        </div>
      </div>

      {/* Client Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground truncate">
            {enrollment.clientName}
          </span>
          <Badge 
            variant="secondary" 
            className={isExcluded ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}
          >
            {isExcluded ? 'Excluded' : 'Active'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {enrollment.clientEmail || 'No email'}
        </p>
      </div>

      {/* Trigger Date */}
      <div className="hidden sm:flex flex-col items-end text-sm min-w-[100px]">
        <span className="text-muted-foreground">{getTriggerLabel()}</span>
        <span className="font-medium flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDate(enrollment.triggerDate) || 'Not set'}
        </span>
      </div>

      {/* Last Sent */}
      <div className="hidden md:flex flex-col items-end text-sm min-w-[100px]">
        <span className="text-muted-foreground">Last Sent</span>
        <span className="font-medium flex items-center gap-1">
          <Send className="h-3 w-3" />
          {formatDate(enrollment.lastSent) || 'Never'}
        </span>
      </div>

      {/* Next Scheduled */}
      <div className="hidden lg:flex flex-col items-end text-sm min-w-[100px]">
        <span className="text-muted-foreground">Next</span>
        <span className="font-medium flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDate(enrollment.nextScheduled) || '-'}
        </span>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={createPageUrl(`AdminClientEdit?id=${enrollment.clientId}`)}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View Client
              </Link>
            </DropdownMenuItem>
            {isExcluded ? (
              <DropdownMenuItem onClick={() => onReactivate(enrollment.clientId)}>
                <UserCheck className="mr-2 h-4 w-4" />
                Reactivate
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem 
                onClick={() => onExclude(enrollment.clientId)}
                className="text-destructive"
              >
                <UserX className="mr-2 h-4 w-4" />
                Exclude from Campaign
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
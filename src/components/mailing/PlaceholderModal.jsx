import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { X, Search, FileEdit } from 'lucide-react';

/**
 * PlaceholderModal Component
 * Single button that opens a modal with categorized placeholder options
 * 
 * @param {Function} onPlaceholderSelect - Callback when placeholder is selected: (placeholder) => void
 */
export default function PlaceholderModal({ onPlaceholderSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('client');
  const [searchQuery, setSearchQuery] = useState('');

  // Placeholder definitions organized by category
  const placeholderData = {
    client: {
      sections: [
        {
          title: 'NAME',
          placeholders: [
            { code: '{{client.firstName}}', description: 'Client first name', example: 'Sue' },
            { code: '{{client.lastName}}', description: 'Client last name', example: 'Jones' },
            { code: '{{client.fullName}}', description: 'Client full name', example: 'Sue Jones' },
            { code: '{{client.initials}}', description: 'Client initials', example: 'SJ' }
          ]
        },
        {
          title: 'CONTACT',
          placeholders: [
            { code: '{{client.email}}', description: 'Client email address', example: 'sue.jones@email.com' },
            { code: '{{client.phone}}', description: 'Client phone number', example: '(555) 123-4567' }
          ]
        },
        {
          title: 'ADDRESS',
          placeholders: [
            { code: '{{client.street}}', description: 'Client street address', example: '123 Main St' },
            { code: '{{client.city}}', description: 'Client city', example: 'Denver' },
            { code: '{{client.state}}', description: 'Client state', example: 'CO' },
            { code: '{{client.zipCode}}', description: 'Client ZIP code', example: '80202' }
          ]
        },
        {
          title: 'BUSINESS',
          placeholders: [
            { code: '{{client.company}}', description: 'Client company name', example: 'ABC Roofing' }
          ]
        }
      ]
    },
    me: {
      sections: [
        {
          title: 'NAME',
          placeholders: [
            { code: '{{user.firstName}}', description: 'Your first name', example: 'John' },
            { code: '{{user.lastName}}', description: 'Your last name', example: 'Smith' },
            { code: '{{user.fullName}}', description: 'Your full name', example: 'John Smith' }
          ]
        },
        {
          title: 'CONTACT',
          placeholders: [
            { code: '{{user.email}}', description: 'Your email address', example: 'john@example.com' },
            { code: '{{user.phone}}', description: 'Your phone number', example: '(555) 987-6543' }
          ]
        },
        {
          title: 'BUSINESS',
          placeholders: [
            { code: '{{user.title}}', description: 'Your job title', example: 'Senior Advisor' },
            { code: '{{user.companyName}}', description: 'Your company name', example: 'Smith Roofing' }
          ]
        },
        {
          title: 'ADDRESS',
          placeholders: [
            { code: '{{user.street}}', description: 'Your street address', example: '456 Oak Ave' },
            { code: '{{user.city}}', description: 'Your city', example: 'Boulder' },
            { code: '{{user.state}}', description: 'Your state', example: 'CO' },
            { code: '{{user.zipCode}}', description: 'Your ZIP code', example: '80301' }
          ]
        }
      ]
    },
    org: {
      sections: [
        {
          title: 'ORGANIZATION',
          placeholders: [
            { code: '{{org.name}}', description: 'Organization name', example: 'RoofScribe Inc' },
            { code: '{{org.website}}', description: 'Organization website', example: 'https://www.example.com' },
            { code: '{{org.email}}', description: 'Organization email', example: 'info@example.com' },
            { code: '{{org.phone}}', description: 'Organization phone', example: '(555) 111-2222' }
          ]
        }
      ]
    }
  };

  // Get search placeholder text based on active tab
  const getSearchPlaceholder = () => {
    const placeholders = {
      client: 'Search client...',
      me: 'Search your info...',
      org: 'Search organization...'
    };
    return placeholders[activeTab] || 'Search...';
  };

  // Filter placeholders based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) {
      return placeholderData[activeTab].sections;
    }

    const query = searchQuery.toLowerCase();
    return placeholderData[activeTab].sections
      .map(section => ({
        ...section,
        placeholders: section.placeholders.filter(p =>
          p.code.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.example.toLowerCase().includes(query)
        )
      }))
      .filter(section => section.placeholders.length > 0);
  }, [activeTab, searchQuery]);

  const handleSelect = (code) => {
    onPlaceholderSelect(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery('');
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="gap-2 px-6 py-2.5 text-[15px] font-medium border border-[#ccc] rounded-md hover:bg-[#f5f5f5]"
      >
        <FileEdit className="w-4 h-4" />
        Placeholders
      </Button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-[999]"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="fixed z-[1000] w-[610px] max-h-[550px] bg-white border-2 border-[#666] rounded-lg shadow-2xl flex flex-col"
        style={{
          left: 'calc(50% - 305px)',
          top: '120px'
        }}
      >
        {/* Fixed Header */}
        <div className="flex-shrink-0 px-5 py-[15px] border-b border-[#e0e0e0]">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-[15px] right-[15px] text-[#666] hover:text-[#333] text-2xl px-2.5 py-1.5 leading-none"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Search Input */}
          <div className="relative mb-2.5">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#666]" />
            <input
              type="text"
              placeholder={getSearchPlaceholder()}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-[15px] border border-[#ccc] rounded-md focus:outline-none focus:border-[#666]"
            />
          </div>

          {/* Context Note */}
          <p className="text-[14px] text-[#333] mt-2.5">
            These values come from the <strong>client record</strong> you're sending the note to.
          </p>
        </div>

        {/* Fixed Tabs */}
        <div className="flex-shrink-0 bg-[#f9f9f9] px-5 py-3 border-b border-[#e0e0e0] flex gap-2">
          {[
            { id: 'client', label: 'Client' },
            { id: 'me', label: 'Me' },
            { id: 'org', label: 'Organization' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchQuery('');
              }}
              className={`px-[18px] py-[7px] text-[15px] font-medium border rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#333] text-white border-[#333]'
                  : 'bg-white text-[#333] border-[#ccc] hover:bg-[#f5f5f5]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div
          className="flex-1 overflow-y-auto px-5 py-[15px]"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#ccc #f1f1f1'
          }}
        >
          {filteredSections.length === 0 ? (
            <div className="text-center py-12 text-[#999]">
              No placeholders match your search
            </div>
          ) : (
            <div className="space-y-[15px]">
              {filteredSections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  {/* Section Header */}
                  <h3 className="text-[13px] font-semibold text-[#333] uppercase tracking-wide mb-1.5 pb-1 border-b border-[#e0e0e0]">
                    {section.title}
                  </h3>

                  {/* Placeholder Items */}
                  <div className="space-y-1">
                    {section.placeholders.map((placeholder, pIndex) => (
                      <button
                        key={pIndex}
                        onClick={() => handleSelect(placeholder.code)}
                        className="w-full grid grid-cols-[200px_1fr] gap-5 px-3.5 py-2 rounded hover:bg-[#f5f5f5] transition-transform hover:translate-x-0.5"
                      >
                        {/* Code */}
                        <code className="text-left font-['Courier_New'] text-[15px] font-bold text-[#333] bg-[#f0f0f0] border border-[#d0d0d0] px-2.5 py-1.5 rounded">
                          {placeholder.code}
                        </code>

                        {/* Description */}
                        <div className="text-left">
                          <span className="text-[15px] text-[#333]">
                            {placeholder.description}
                          </span>
                          {placeholder.example && (
                            <span className="text-[14px] text-[#666] italic">
                              {' '}(e.g., "{placeholder.example}")
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
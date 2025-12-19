import React from "react";
import { AlertCircle } from "lucide-react";

/**
 * ReturnAddressSelector
 * 
 * Radio-style selector for choosing return address mode (Company, Rep, or None).
 * Handles conditional rendering based on whether addresses exist.
 * 
 * @param {string} currentMode - Currently selected mode: "company" | "rep" | "none"
 * @param {function} onModeSelect - Callback when mode is selected
 * @param {boolean} hasCompanyAddress - Whether company address exists
 * @param {boolean} hasRepAddress - Whether rep address exists
 * @param {string} companyAddressPreview - Formatted company address for display
 * @param {string} repAddressPreview - Formatted rep address for display
 * @param {string} noneAddressPreview - Text to show for "none" option
 * @param {function} onAddCompanyAddress - Callback to add company address
 * @param {function} onAddRepAddress - Callback to add rep address
 * @param {string} userName - User's name for display in rep section
 */
export function ReturnAddressSelector({
  currentMode,
  onModeSelect,
  hasCompanyAddress,
  hasRepAddress,
  companyAddressPreview,
  repAddressPreview,
  noneAddressPreview = "No return address will be printed on the envelope",
  onAddCompanyAddress,
  onAddRepAddress,
  userName = "You"
}) {
  // Base styles for options
  const baseStyles = "w-full text-left p-4 rounded-lg border-2 transition-all";
  const selectedStyles = "border-primary bg-primary/10";
  const unselectedStyles = "border-gray-200 hover:border-gray-300 bg-white";
  const disabledStyles = "border-gray-200 bg-gray-50";

  // Radio indicator component
  const RadioIndicator = ({ selected }) => (
    selected ? (
      <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
        <div className="w-2 h-2 bg-white rounded-full" />
      </div>
    ) : null
  );

  return (
    <div className="space-y-3">
      {/* Company Option */}
      {hasCompanyAddress ? (
        <button
          onClick={() => onModeSelect('company')}
          type="button"
          className={`${baseStyles} ${currentMode === 'company' ? selectedStyles : unselectedStyles}`}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Company</h3>
            <RadioIndicator selected={currentMode === 'company'} />
          </div>
          <p className="text-sm text-gray-600 whitespace-pre-line">
            {companyAddressPreview}
          </p>
        </button>
      ) : (
        <div className={`${baseStyles} ${disabledStyles} ${currentMode === 'company' ? selectedStyles : ''}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-500">Company</h3>
          </div>
          <div className="flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              No company address set.{' '}
              <button
                onClick={onAddCompanyAddress}
                type="button"
                className="underline font-medium hover:text-red-700 cursor-pointer bg-transparent border-none p-0"
              >
                Add in Settings
              </button>
              {' '}or choose Rep/None
            </div>
          </div>
        </div>
      )}

      {/* Rep Option */}
      {hasRepAddress ? (
        <button
          onClick={() => onModeSelect('rep')}
          type="button"
          className={`${baseStyles} ${currentMode === 'rep' ? selectedStyles : unselectedStyles}`}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Rep</h3>
            <RadioIndicator selected={currentMode === 'rep'} />
          </div>
          <p className="text-sm text-gray-600 whitespace-pre-line">
            {repAddressPreview}
          </p>
        </button>
      ) : (
        <div className={`${baseStyles} ${disabledStyles} ${currentMode === 'rep' ? selectedStyles : ''}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-500">Rep</h3>
          </div>
          <div className="flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              {userName} {userName === "You" ? "don't" : "doesn't"} have a return address on file.{' '}
              <button
                onClick={onAddRepAddress}
                type="button"
                className="underline font-medium hover:text-red-700 cursor-pointer bg-transparent border-none p-0"
              >
                Add Address
              </button>
              {' '}or choose Company/None
            </div>
          </div>
        </div>
      )}

      {/* None Option - Always available */}
      <button
        onClick={() => onModeSelect('none')}
        type="button"
        className={`${baseStyles} ${currentMode === 'none' ? selectedStyles : unselectedStyles}`}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">None</h3>
          <RadioIndicator selected={currentMode === 'none'} />
        </div>
        <p className="text-sm text-gray-600">
          {noneAddressPreview}
        </p>
      </button>
    </div>
  );
}

export default ReturnAddressSelector;
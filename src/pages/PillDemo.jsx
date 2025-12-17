export function PillDemo() {
  const Pill = ({ className, children }) => (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md border ${className}`}
    >
      {children}
    </span>
  );

  return (
    <div className="space-y-6">
      {/* Semantic Pills */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          Semantic Pills
        </h3>
        <div className="flex flex-wrap gap-2">
          <Pill className="bg-green-50 text-green-700 border-green-200">
            Active
          </Pill>
          <Pill className="bg-yellow-50 text-yellow-800 border-yellow-200">
            Member
          </Pill>
          <Pill className="bg-red-50 text-red-700 border-red-200">
            Error
          </Pill>
          <Pill className="bg-gray-100 text-gray-700 border-gray-200">
            Muted
          </Pill>
        </div>
      </div>

      {/* Utility Pills */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          Utility Pills (Color 1–3)
        </h3>
        <div className="flex flex-wrap gap-2">
          <Pill className="bg-blue-50 text-blue-700 border-blue-200">
            Color 1
          </Pill>
          <Pill className="bg-purple-50 text-purple-700 border-purple-200">
            Color 2
          </Pill>
          <Pill className="bg-teal-50 text-teal-700 border-teal-200">
            Color 3
          </Pill>
        </div>
      </div>

      {/* Dense / Table Context */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          Dense / Table Context
        </h3>
        <div className="flex flex-wrap gap-2">
          <Pill className="bg-purple-50 text-purple-700 border-purple-200">
            Admin
          </Pill>
          <Pill className="bg-green-50 text-green-700 border-green-200">
            Active
          </Pill>
          <Pill className="bg-orange-50 text-orange-700 border-orange-200">
            Lead Nurture
          </Pill>
          <Pill className="bg-blue-50 text-blue-700 border-blue-200">
            Organization
          </Pill>
        </div>
      </div>
    </div>
  );
}

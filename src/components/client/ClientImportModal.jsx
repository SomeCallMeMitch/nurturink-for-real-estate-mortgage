import React, { useState, useCallback, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  FileSpreadsheet,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Download,
  X,
  Sparkles,
  ArrowRight,
  ChevronLeft,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Step indicator component
const StepIndicator = ({ currentStep }) => {
  const steps = [
    { num: 1, label: "Upload File" },
    { num: 2, label: "Map Fields" },
    { num: 3, label: "Preview" },
    { num: 4, label: "Done" },
  ];

  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {steps.map((step, index) => (
        <React.Fragment key={step.num}>
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                currentStep > step.num
                  ? "bg-green-500 text-white"
                  : currentStep === step.num
                  ? "bg-amber-500 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {currentStep > step.num ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                step.num
              )}
            </div>
            <span
              className={`text-sm ${
                currentStep >= step.num ? "text-gray-900" : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-12 h-0.5 ${
                currentStep > step.num ? "bg-green-500" : "bg-gray-200"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// Field mapping options
const FIELD_OPTIONS = [
  { value: "skip", label: "-- Skip this column --" },
  { value: "firstName", label: "First Name *", required: true },
  { value: "lastName", label: "Last Name *", required: true },
  { value: "company", label: "Company" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "street", label: "Street Address *", required: true },
  { value: "address2", label: "Address Line 2" },
  { value: "city", label: "City *", required: true },
  { value: "state", label: "State *", required: true },
  { value: "zipCode", label: "ZIP Code *", required: true },
  { value: "tags", label: "Tags" },
];

// Auto-map fields based on column names
const autoMapFields = (columns) => {
  const mapping = {};
  const fieldMatchers = {
    firstName: ["first_name", "firstname", "first", "fname"],
    lastName: ["last_name", "lastname", "last", "lname"],
    company: ["company", "company_name", "business", "organization"],
    email: ["email", "email_address", "e-mail"],
    phone: ["phone", "phone_number", "telephone", "mobile", "cell"],
    street: ["street", "address", "street_address", "address1", "address_line_1"],
    address2: ["address2", "address_2", "address_line_2", "apt", "suite", "unit"],
    city: ["city", "town"],
    state: ["state", "province", "region"],
    zipCode: ["zip", "zipcode", "zip_code", "postal", "postal_code"],
    tags: ["tags", "tag", "category", "categories"],
  };

  columns.forEach((col) => {
    const colLower = col.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (const [field, matchers] of Object.entries(fieldMatchers)) {
      if (matchers.some((m) => colLower.includes(m.replace(/[^a-z0-9]/g, "")))) {
        mapping[col] = field;
        break;
      }
    }
  });

  return mapping;
};

// Download template CSV
const downloadTemplate = () => {
  const csvContent = `first_name,last_name,company,email,phone,street,address2,city,state,zip,tags
John,Smith,ABC Roofing,john@abcroofing.com,(555) 123-4567,123 Main Street,,Denver,CO,80202,Quote
Sarah,Johnson,Johnson Construction,sarah@jconstruct.com,(555) 234-5678,456 Oak Avenue,Suite 100,Boulder,CO,80301,Re-Roof
Mike,Williams,Williams Builders,mike@williamsb.com,(555) 345-6789,789 Elm Street,,Aurora,CO,80010,Storm
Emily,Davis,Davis Homes,emily@davishomes.com,(555) 456-7890,321 Pine Road,Apt 2B,Lakewood,CO,80226,Repair
Robert,Anderson,Anderson Roofing,robert@andersonroof.com,(555) 567-8901,555 Cedar Lane,,Westminster,CO,80031,Quote`;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "roofscribe_client_import_template.csv";
  link.click();
};

export default function ClientImportModal({ open, onOpenChange, onImportComplete }) {
  const { toast } = useToast();
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // File state
  const [fileUrl, setFileUrl] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("");
  const [columns, setColumns] = useState([]);
  const [sampleData, setSampleData] = useState([]);
  
  // Mapping state
  const [fieldMapping, setFieldMapping] = useState({});
  const [autoMappedCount, setAutoMappedCount] = useState(0);
  
  // Options state
  const [options, setOptions] = useState({
    autoCapitalize: true,
    trimWhitespace: true,
    skipDuplicates: false,
    skipInvalidRows: true,
    tagsToApply: [],
  });
  const [tagInput, setTagInput] = useState("");
  
  // Validation state
  const [validationResults, setValidationResults] = useState(null);
  const [previewFilter, setPreviewFilter] = useState("all");
  
  // Import results state
  const [importResults, setImportResults] = useState(null);

  // Reset modal state
  const resetModal = useCallback(() => {
    setCurrentStep(1);
    setIsProcessing(false);
    setFileUrl(null);
    setFileName("");
    setFileType("");
    setColumns([]);
    setSampleData([]);
    setFieldMapping({});
    setAutoMappedCount(0);
    setOptions({
      autoCapitalize: true,
      trimWhitespace: true,
      skipDuplicates: false,
      skipInvalidRows: true,
      tagsToApply: [],
    });
    setTagInput("");
    setValidationResults(null);
    setPreviewFilter("all");
    setImportResults(null);
  }, []);

  // Handle modal close
  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      resetModal();
    }
    onOpenChange(isOpen);
  };

  // Handle file upload
  const handleFileUpload = async (file) => {
    const validTypes = ["csv", "xlsx", "xls"];
    const extension = file.name.split(".").pop().toLowerCase();
    
    if (!validTypes.includes(extension)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV or Excel file (.csv, .xlsx, .xls)",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Upload file
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      setFileUrl(uploadResult.file_url);
      setFileName(file.name);
      setFileType(extension);

      // Get initial file info
      const response = await base44.functions.invoke("validateImportFile", {
        fileUrl: uploadResult.file_url,
        fileType: extension,
        fieldMapping: {},
        options: {},
      });

      if (!response.data.success) {
        toast({
          title: "Error reading file",
          description: response.data.error || "Unable to parse file",
          variant: "destructive",
        });
        setFileUrl(null);
        setFileName("");
        return;
      }

      setColumns(response.data.columns);
      setSampleData(response.data.sampleData);

      // Auto-map fields
      const autoMapping = autoMapFields(response.data.columns);
      setFieldMapping(autoMapping);
      setAutoMappedCount(Object.keys(autoMapping).length);

      toast({
        title: "File uploaded",
        description: `${response.data.totalRows} rows detected`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
      setFileUrl(null);
      setFileName("");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle drag and drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  // Handle field mapping change
  const handleMappingChange = (column, value) => {
    setFieldMapping((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  // Handle validation
  const handleValidate = async () => {
    setIsProcessing(true);
    
    try {
      const response = await base44.functions.invoke("validateImportFile", {
        fileUrl,
        fileType,
        fieldMapping,
        options,
      });

      if (!response.data.success) {
        toast({
          title: "Validation failed",
          description: response.data.error,
          variant: "destructive",
        });
        return;
      }

      setValidationResults(response.data);
      setCurrentStep(3);
    } catch (error) {
      toast({
        title: "Validation failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle import
  const handleImport = async () => {
    setIsProcessing(true);
    
    try {
      const response = await base44.functions.invoke("uploadClients", {
        fileUrl,
        fileType,
        fieldMapping,
        options,
      });

      if (!response.data.success) {
        toast({
          title: "Import failed",
          description: response.data.error,
          variant: "destructive",
        });
        return;
      }

      setImportResults(response.data);
      setCurrentStep(4);
      
      // Notify parent
      onImportComplete?.(response.data);
    } catch (error) {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Add tag
  const handleAddTag = () => {
    if (tagInput.trim() && !options.tagsToApply.includes(tagInput.trim())) {
      setOptions((prev) => ({
        ...prev,
        tagsToApply: [...prev.tagsToApply, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  // Remove tag
  const handleRemoveTag = (tag) => {
    setOptions((prev) => ({
      ...prev,
      tagsToApply: prev.tagsToApply.filter((t) => t !== tag),
    }));
  };

  // Download error report
  const downloadErrorReport = () => {
    if (!importResults?.errors?.length) return;

    const headers = [
      "Row",
      "Error Reason",
      "First Name",
      "Last Name",
      "Company",
      "Email",
      "Street",
      "City",
      "State",
      "ZIP",
    ];
    const rows = importResults.errors.map((e) => [
      e.row,
      e.reason,
      e.data.firstName || "",
      e.data.lastName || "",
      e.data.company || "",
      e.data.email || "",
      e.data.street || "",
      e.data.city || "",
      e.data.state || "",
      e.data.zipCode || "",
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `import_errors_${importResults.importBatchId}.csv`;
    link.click();
  };

  // Filter preview rows
  const filteredPreviewRows = useMemo(() => {
    if (!validationResults?.previewRows) return [];
    
    if (previewFilter === "all") return validationResults.previewRows;
    if (previewFilter === "warnings") {
      return validationResults.previewRows.filter((r) => r.status === "warning");
    }
    if (previewFilter === "errors") {
      return validationResults.previewRows.filter((r) => r.status === "error");
    }
    return validationResults.previewRows;
  }, [validationResults, previewFilter]);

  // Check if required fields are mapped
  const requiredFieldsMapped = useMemo(() => {
    const requiredFields = ["firstName", "lastName", "street", "city", "state", "zipCode"];
    const mappedFields = Object.values(fieldMapping);
    return requiredFields.every((f) => mappedFields.includes(f));
  }, [fieldMapping]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Clients
          </DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file to bulk import clients
          </DialogDescription>
        </DialogHeader>

        <StepIndicator currentStep={currentStep} />

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto min-h-0 px-1">
          {/* Step 1: Upload File */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Template Download */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Need a template?</p>
                      <p className="text-sm text-blue-700">
                        Download our sample CSV file with correct column headers.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={downloadTemplate}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Template
                  </Button>
                </div>
              </div>

              {/* Drop Zone or File Selected */}
              {!fileUrl ? (
                <div
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
                    isProcessing
                      ? "border-gray-300 bg-gray-50"
                      : "border-gray-300 hover:border-amber-500 hover:bg-amber-50"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => document.getElementById("file-input").click()}
                >
                  {isProcessing ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
                      <p className="text-gray-600">Processing file...</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">
                        Drop your file here or click to browse
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Supports CSV and Excel files (.csv, .xlsx, .xls)
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Maximum 10,000 rows per import
                      </p>
                    </>
                  )}
                  <input
                    id="file-input"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileCheck className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">{fileName}</p>
                        <p className="text-sm text-green-700">
                          {sampleData.length > 0 &&
                            `${columns.length} columns detected`}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setFileUrl(null);
                        setFileName("");
                        setColumns([]);
                        setSampleData([]);
                        setFieldMapping({});
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Required Fields Reference */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Required Fields
                </p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {["First Name", "Last Name", "Street Address", "City", "State", "ZIP Code"].map(
                    (field) => (
                      <div key={field} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-gray-600">{field}</span>
                      </div>
                    )
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Optional: Company, Email, Phone, Tags
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Map Fields */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Auto-mapping Notice */}
              {autoMappedCount > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-green-600" />
                    <p className="text-green-800">
                      <span className="font-medium">
                        {autoMappedCount} of {columns.length} fields auto-mapped!
                      </span>{" "}
                      Review and adjust if needed.
                    </p>
                  </div>
                </div>
              )}

              {/* Field Mapping Table */}
              <div className="border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-1/4">Your Column</TableHead>
                      <TableHead className="w-8"></TableHead>
                      <TableHead className="w-1/4">RoofScribe Field</TableHead>
                      <TableHead>Sample Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {columns.map((column) => {
                      const mappedField = fieldMapping[column];
                      const isMapped = mappedField && mappedField !== "skip";
                      const sampleValues = sampleData
                        .map((row) => row[column])
                        .filter(Boolean)
                        .slice(0, 3)
                        .join(", ");

                      return (
                        <TableRow key={column}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {isMapped ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                              )}
                              {column}
                            </div>
                          </TableCell>
                          <TableCell>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={mappedField || "skip"}
                              onValueChange={(value) =>
                                handleMappingChange(column, value)
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {FIELD_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-gray-500 text-sm truncate max-w-xs">
                            {sampleValues || "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Import Options */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Import Options
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="autoCapitalize"
                      checked={options.autoCapitalize}
                      onCheckedChange={(checked) =>
                        setOptions((prev) => ({ ...prev, autoCapitalize: checked }))
                      }
                    />
                    <Label htmlFor="autoCapitalize" className="text-sm">
                      Auto-fix capitalization (john smith → John Smith)
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="trimWhitespace"
                      checked={options.trimWhitespace}
                      onCheckedChange={(checked) =>
                        setOptions((prev) => ({ ...prev, trimWhitespace: checked }))
                      }
                    />
                    <Label htmlFor="trimWhitespace" className="text-sm">
                      Trim whitespace from all fields
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="skipDuplicates"
                      checked={options.skipDuplicates}
                      onCheckedChange={(checked) =>
                        setOptions((prev) => ({ ...prev, skipDuplicates: checked }))
                      }
                    />
                    <Label htmlFor="skipDuplicates" className="text-sm">
                      Skip duplicate entries (match by email or address)
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="skipInvalidRows"
                      checked={options.skipInvalidRows}
                      onCheckedChange={(checked) =>
                        setOptions((prev) => ({ ...prev, skipInvalidRows: checked }))
                      }
                    />
                    <Label htmlFor="skipInvalidRows" className="text-sm">
                      Skip rows with missing required fields
                    </Label>
                  </div>
                </div>
              </div>

              {/* Required Fields Warning */}
              {!requiredFieldsMapped && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <p className="text-amber-800 text-sm">
                      Please map all required fields (First Name, Last Name, Street,
                      City, State, ZIP) before continuing.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Preview & Validate */}
          {currentStep === 3 && validationResults && (
            <div className="space-y-6">
              {/* Validation Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-green-700">
                    {validationResults.validation.valid}
                  </p>
                  <p className="text-sm text-green-600">Ready to Import</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-amber-700">
                    {validationResults.validation.warnings}
                  </p>
                  <p className="text-sm text-amber-600">Warnings</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-red-700">
                    {validationResults.validation.errors}
                  </p>
                  <p className="text-sm text-red-600">Errors (will skip)</p>
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2">
                <Button
                  variant={previewFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewFilter("all")}
                >
                  Show All
                </Button>
                <Button
                  variant={previewFilter === "warnings" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewFilter("warnings")}
                  className={
                    previewFilter === "warnings"
                      ? "bg-amber-500 hover:bg-amber-600"
                      : ""
                  }
                >
                  Warnings Only
                </Button>
                <Button
                  variant={previewFilter === "errors" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewFilter("errors")}
                  className={
                    previewFilter === "errors"
                      ? "bg-red-500 hover:bg-red-600"
                      : ""
                  }
                >
                  Errors Only
                </Button>
              </div>

              {/* Preview Table */}
              <div className="border rounded-xl overflow-hidden">
                <div className="max-h-64 overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-gray-50">
                      <TableRow>
                        <TableHead className="w-20">Status</TableHead>
                        <TableHead className="w-16">Row</TableHead>
                        <TableHead>First Name</TableHead>
                        <TableHead>Last Name</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>State</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPreviewRows.map((row, index) => (
                        <TableRow
                          key={index}
                          className={
                            row.status === "error"
                              ? "bg-red-50"
                              : row.status === "warning"
                              ? "bg-amber-50"
                              : "bg-green-50"
                          }
                        >
                          <TableCell>
                            {row.status === "valid" && (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            )}
                            {row.status === "warning" && (
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                            )}
                            {row.status === "error" && (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                          </TableCell>
                          <TableCell>{row.row}</TableCell>
                          <TableCell>{row.data.firstName || "-"}</TableCell>
                          <TableCell>{row.data.lastName || "-"}</TableCell>
                          <TableCell>{row.data.company || "-"}</TableCell>
                          <TableCell>{row.data.city || "-"}</TableCell>
                          <TableCell>{row.data.state || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 border-t">
                  Showing {filteredPreviewRows.length} of {validationResults.totalRows} rows
                </div>
              </div>

              {/* Tag Assignment */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Apply Tags to Imported Clients (Optional)
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {options.tagsToApply.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-amber-100 text-amber-700"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-amber-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a tag name and press Enter..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={handleAddTag}>
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {currentStep === 4 && importResults && (
            <div className="space-y-6 text-center py-8">
              {/* Success Icon */}
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Import Complete!
                </h3>
                <p className="text-gray-600 mt-1">
                  Your clients have been successfully imported into RoofScribe.
                </p>
              </div>

              {/* Results Summary */}
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {importResults.summary.totalRows}
                  </p>
                  <p className="text-sm text-gray-600">Total Processed</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-green-700">
                    {importResults.summary.imported}
                  </p>
                  <p className="text-sm text-green-600">Successfully Imported</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-red-700">
                    {importResults.summary.skippedErrors}
                  </p>
                  <p className="text-sm text-red-600">Skipped (Errors)</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-amber-700">
                    {importResults.summary.skippedDuplicates}
                  </p>
                  <p className="text-sm text-amber-600">Skipped (Duplicates)</p>
                </div>
              </div>

              {/* Error Report Download */}
              {importResults.errors?.length > 0 && (
                <Button
                  variant="outline"
                  onClick={downloadErrorReport}
                  className="mx-auto"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Error Report ({importResults.errors.length} rows)
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Footer with Navigation */}
        <div className="flex justify-between items-center pt-4 border-t mt-4">
          <div>
            {currentStep > 1 && currentStep < 4 && (
              <Button
                variant="ghost"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                disabled={isProcessing}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {currentStep < 4 && (
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
            )}
            {currentStep === 1 && (
              <Button
                onClick={() => setCurrentStep(2)}
                disabled={!fileUrl || isProcessing}
                className="bg-amber-500 hover:bg-amber-600"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            {currentStep === 2 && (
              <Button
                onClick={handleValidate}
                disabled={!requiredFieldsMapped || isProcessing}
                className="bg-amber-500 hover:bg-amber-600"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    Preview & Validate
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
            {currentStep === 3 && (
              <Button
                onClick={handleImport}
                disabled={isProcessing || validationResults?.validation?.valid === 0}
                className="bg-amber-500 hover:bg-amber-600"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    Import {validationResults?.validation?.valid || 0} Clients
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
            {currentStep === 4 && (
              <Button
                onClick={() => handleOpenChange(false)}
                className="bg-amber-500 hover:bg-amber-600"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
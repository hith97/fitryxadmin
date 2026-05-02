import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import {
  FileText, Upload, Eye, CheckCircle, AlertTriangle,
  Info, ChevronDown, Download, ArrowRight, ArrowLeft,
  Check, AlertCircle, X, RotateCcw,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { memberApi } from '../../services/planApi';

// ── Column definitions ────────────────────────────────────────────
const MEMBER_COLUMNS = [
  { key: 'member_id',       label: 'Member ID',       required: false, example: 'RZ1001',           notes: 'Leave blank to auto-generate' },
  { key: 'member_name',     label: 'Member Name',     required: true,  example: 'Rahul Sharma',      notes: '' },
  { key: 'gender',          label: 'Gender',          required: false, example: 'male',              notes: 'male / female / nonbinary / nottosay' },
  { key: 'dob',             label: 'Date of Birth',   required: false, example: '15/06/1995',        notes: 'DD/MM/YYYY' },
  { key: 'member_phone',    label: 'Phone',           required: true,  example: '9876543210',        notes: '10-digit mobile number' },
  { key: 'member_email',    label: 'Email',           required: false, example: 'rahul@example.com', notes: '' },
  { key: 'address',         label: 'Address',         required: false, example: '123 MG Road',       notes: '' },
  { key: 'city',            label: 'City',            required: false, example: 'Mumbai',            notes: '' },
  { key: 'state',           label: 'State',           required: false, example: 'Maharashtra',       notes: '' },
  { key: 'pincode',         label: 'Pincode',         required: false, example: '400001',            notes: '' },
  { key: 'weight',          label: 'Weight (kg)',     required: false, example: '75',                notes: 'Numeric' },
  { key: 'height',          label: 'Height (cm)',     required: false, example: '175',               notes: 'Numeric' },
  { key: 'joining_date',    label: 'Joining Date',    required: false, example: '01/01/2024',        notes: 'DD/MM/YYYY' },
  { key: 'plan_name',       label: 'Plan Name',       required: false, example: 'Monthly Basic',     notes: 'Must match an active plan exactly' },
  { key: 'amount_paid',     label: 'Amount Paid',     required: false, example: '2000',              notes: 'Numeric, in INR' },
  { key: 'discount_amount', label: 'Discount',        required: false, example: '200',               notes: 'Numeric, in INR' },
  { key: 'payment_method',  label: 'Payment Method',  required: false, example: 'cash',              notes: 'cash / upi / card / neft / other' },
  { key: 'payment_status',  label: 'Payment Status',  required: false, example: 'PAID',              notes: 'PAID / PARTIAL / PENDING' },
  { key: 'start_date',      label: 'Start Date',      required: false, example: '01/01/2024',        notes: 'DD/MM/YYYY, required when plan_name is set' },
];

// ── Template download ─────────────────────────────────────────────
const downloadTemplate = () => {
  const wb = XLSX.utils.book_new();

  const headers = MEMBER_COLUMNS.map((c) => c.key);
  const demo = [
    ['', 'Rahul Sharma',  'male',   '15/06/1995', '9876543210', 'rahul@example.com',  '123 MG Road', 'Mumbai', 'Maharashtra', '400001', '75', '175', '01/01/2024', 'Monthly Basic',  '2000', '0',   'cash', 'PAID',    '01/01/2024'],
    ['', 'Priya Patel',   'female', '22/03/1990', '9876543211', 'priya@example.com',  '456 Park St', 'Pune',   'Maharashtra', '411001', '60', '162', '01/01/2024', 'Quarterly Pro',  '5000', '500', 'upi',  'PARTIAL', '01/01/2024'],
    ['', 'Amit Kumar',    'male',   '',           '9876543212', '',                   '',            'Delhi',  'Delhi',       '110001', '',   '',    '15/01/2024', '',               '',     '',    '',     '',        ''],
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...demo]);
  ws['!cols'] = MEMBER_COLUMNS.map(() => ({ wch: 18 }));
  XLSX.utils.book_append_sheet(wb, ws, 'Members');

  // Instructions sheet
  const instrRows = [
    ['Column', 'Required', 'Example', 'Notes'],
    ...MEMBER_COLUMNS.map((c) => [c.key, c.required ? 'YES' : 'no', c.example, c.notes]),
    [],
    ['Valid Gender values',        '', 'male, female, nonbinary, nottosay'],
    ['Valid Payment Status values', '', 'PAID, PARTIAL, PENDING'],
    ['Valid Payment Method values', '', 'cash, upi, card, neft, other'],
    ['Date format',                '', 'DD/MM/YYYY  e.g. 25/12/2024'],
  ];
  const instrWs = XLSX.utils.aoa_to_sheet(instrRows);
  instrWs['!cols'] = [{ wch: 28 }, { wch: 10 }, { wch: 22 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, instrWs, 'Instructions');

  XLSX.writeFile(wb, 'fitryx_members_import_template.xlsx');
};

// ── File parser ───────────────────────────────────────────────────
const parseFile = (file) =>
  new Promise((resolve, reject) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (r) => resolve(r.data),
        error: (e) => reject(new Error(e.message)),
      });
    } else if (['xlsx', 'xls'].includes(ext)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target.result, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
          resolve(rows);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error('Unsupported format — use .xlsx, .xls or .csv'));
    }
  });

// ── Step indicator ────────────────────────────────────────────────
const StepIndicator = ({ step }) => {
  const steps = ['Prepare', 'Upload', 'Preview', 'Results'];
  return (
    <div className="flex items-center justify-center mb-10">
      {steps.map((label, i) => {
        const id = i + 1;
        return (
          <React.Fragment key={id}>
            <div className="flex flex-col items-center relative">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                step > id ? 'bg-primary text-white' : step === id ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > id ? <Check size={14} /> : id}
              </div>
              <span className={`absolute -bottom-6 text-[11px] font-medium whitespace-nowrap ${
                step >= id ? 'text-primary' : 'text-gray-400'
              }`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-20 h-0.5 mx-2 transition-colors ${step > id ? 'bg-primary' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────
const ImportData = () => {
  const [step, setStep] = useState(1);
  const [colExpanded, setColExpanded] = useState(true);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [parseError, setParseError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewTab, setPreviewTab] = useState('all');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState(null);
  const fileRef = useRef();

  const reset = () => {
    setStep(1);
    setUploadedFile(null);
    setParsedRows([]);
    setParseError(null);
    setPreviewData(null);
    setImportResult(null);
    setImportError(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleFile = async (file) => {
    if (!file) return;
    setUploadedFile(file);
    setParseError(null);
    try {
      const rows = await parseFile(file);
      setParsedRows(rows);
    } catch (err) {
      setParseError(err.message);
      setUploadedFile(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handlePreview = async () => {
    setPreviewLoading(true);
    setParseError(null);
    try {
      const result = await memberApi.importPreview(parsedRows);
      setPreviewData(result);
      setStep(3);
    } catch (err) {
      setParseError(err.message || 'Preview failed');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    setImportError(null);
    try {
      const result = await memberApi.importConfirm(parsedRows);
      setImportResult(result);
      setStep(4);
    } catch (err) {
      setImportError(err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  // rows to show in preview table
  const previewRows =
    previewTab === 'errors'
      ? previewData?.errors ?? []
      : [...(previewData?.valid ?? []), ...(previewData?.errors ?? [])].sort(
          (a, b) => a.row - b.row,
        );

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="mb-8">
        <h1 className="text-[22px] font-bold text-gray-900">Import Data</h1>
        <p className="text-[13px] text-gray-500 mt-1">
          Bulk-import members from an Excel or CSV file.
        </p>
      </div>

      <StepIndicator step={step} />

      {/* ── Step 1: Prepare ─────────────────────────────────── */}
      {step === 1 && (
        <div className="animate-in fade-in duration-200">
          <div className="card p-6 mb-6">
            <h2 className="text-base font-bold text-gray-800 mb-1">Prepare Your File</h2>
            <p className="text-[13px] text-gray-500 mb-6">
              Download the template, fill in your data, and come back to upload.
            </p>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6 flex items-start gap-3">
              <AlertTriangle className="text-amber-500 mt-0.5 shrink-0" size={18} />
              <p className="text-[13px] text-amber-800">
                Membership plans must already exist in the Plans page before importing.
                Leave <span className="font-mono bg-amber-100 px-1 rounded">plan_name</span> blank
                to import members without a subscription.
              </p>
            </div>

            {/* Required columns */}
            <div className="mb-6">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Required Columns
              </p>
              <div className="flex flex-wrap gap-2">
                {MEMBER_COLUMNS.filter((c) => c.required).map((c) => (
                  <span
                    key={c.key}
                    className="bg-red-50 text-red-600 border border-red-100 px-3 py-1 rounded-full text-[12px] font-mono font-medium"
                  >
                    {c.key}
                  </span>
                ))}
              </div>
            </div>

            {/* Column details accordion */}
            <div className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setColExpanded((v) => !v)}
                className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between"
              >
                <span className="text-[13px] font-semibold text-gray-700">
                  All columns ({MEMBER_COLUMNS.length})
                </span>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform ${colExpanded ? 'rotate-180' : ''}`}
                />
              </button>
              {colExpanded && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[13px]">
                    <thead className="bg-white border-b border-border">
                      <tr className="text-[11px] font-semibold text-gray-400 uppercase">
                        <th className="px-4 py-2">Column</th>
                        <th className="px-4 py-2">Required</th>
                        <th className="px-4 py-2">Example</th>
                        <th className="px-4 py-2">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {MEMBER_COLUMNS.map((c) => (
                        <tr key={c.key} className="hover:bg-gray-50">
                          <td className="px-4 py-2.5 font-mono text-[12px] text-gray-800">{c.key}</td>
                          <td className="px-4 py-2.5">
                            {c.required ? (
                              <span className="text-red-500 font-semibold text-[12px]">Yes</span>
                            ) : (
                              <span className="text-gray-400 text-[12px]">No</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-gray-600 text-[12px]">{c.example}</td>
                          <td className="px-4 py-2.5 text-gray-400 text-[12px]">{c.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button
              variant="secondary"
              onClick={downloadTemplate}
              className="flex items-center gap-2"
            >
              <Download size={16} />
              Download Template (.xlsx)
            </Button>
            <Button onClick={() => setStep(2)} className="flex items-center gap-2">
              I have my file ready
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 2: Upload ───────────────────────────────────── */}
      {step === 2 && (
        <div className="animate-in fade-in duration-200">
          <div className="card p-6 mb-6">
            <h2 className="text-base font-bold text-gray-800 mb-1">Upload Your File</h2>
            <p className="text-[13px] text-gray-500 mb-6">
              Supports <span className="font-medium">.xlsx</span>,{' '}
              <span className="font-medium">.xls</span>, and{' '}
              <span className="font-medium">.csv</span> files.
            </p>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-colors ${
                isDragging
                  ? 'border-primary bg-blue-50'
                  : uploadedFile
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-200 hover:border-primary hover:bg-gray-50'
              }`}
            >
              {uploadedFile ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle size={24} className="text-green-500" />
                  </div>
                  <p className="text-[14px] font-semibold text-gray-800">{uploadedFile.name}</p>
                  <p className="text-[13px] text-gray-500">
                    {parsedRows.length} row{parsedRows.length !== 1 ? 's' : ''} detected
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); reset(); setStep(2); }}
                    className="text-[12px] text-gray-400 hover:text-red-500 flex items-center gap-1 mt-1"
                  >
                    <X size={12} /> Remove
                  </button>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Upload size={24} className="text-gray-400" />
                  </div>
                  <p className="text-[14px] font-semibold text-gray-700">
                    Drag & drop or click to upload
                  </p>
                  <p className="text-[12px] text-gray-400">.xlsx, .xls, .csv</p>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />

            {parseError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-[13px] text-red-700">{parseError}</p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <Button variant="secondary" onClick={() => setStep(1)} className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Back
            </Button>
            <Button
              onClick={handlePreview}
              disabled={!uploadedFile || parsedRows.length === 0 || previewLoading}
              className="flex items-center gap-2"
            >
              {previewLoading ? 'Validating…' : 'Validate & Preview'}
              {!previewLoading && <ArrowRight size={16} />}
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 3: Preview ──────────────────────────────────── */}
      {step === 3 && previewData && (
        <div className="animate-in fade-in duration-200">
          <div className="mb-6">
            <h2 className="text-base font-bold text-gray-800">Validate & Preview</h2>
            <p className="text-[13px] text-gray-500 mt-1">
              Review before importing. Rows with errors will be skipped.
            </p>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-sm">
                {previewData.summary.total}
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-500 uppercase">Total</p>
                <p className="text-[12px] text-gray-400">Rows in file</p>
              </div>
            </div>
            <div className="card p-4 flex items-center gap-3 border-green-200 bg-green-50">
              <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">
                {previewData.summary.valid}
              </div>
              <div>
                <p className="text-[11px] font-bold text-green-600 uppercase">Valid</p>
                <p className="text-[12px] text-green-500">Ready to import</p>
              </div>
            </div>
            <div className={`card p-4 flex items-center gap-3 ${previewData.summary.errors > 0 ? 'border-red-200 bg-red-50' : 'border-gray-100'}`}>
              <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm ${previewData.summary.errors > 0 ? 'bg-red-500' : 'bg-gray-300'}`}>
                {previewData.summary.errors}
              </div>
              <div>
                <p className={`text-[11px] font-bold uppercase ${previewData.summary.errors > 0 ? 'text-red-600' : 'text-gray-400'}`}>Errors</p>
                <p className={`text-[12px] ${previewData.summary.errors > 0 ? 'text-red-400' : 'text-gray-400'}`}>Fix required</p>
              </div>
            </div>
          </div>

          {previewData.summary.errors > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4 flex items-start gap-2">
              <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-[13px] text-amber-800">
                {previewData.summary.errors} row{previewData.summary.errors !== 1 ? 's have' : ' has'} errors
                and will not be imported. Fix the file and re-upload to include them.
              </p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-border mb-4">
            {[
              { id: 'all', label: `All (${previewData.summary.total})` },
              { id: 'errors', label: `Errors (${previewData.summary.errors})` },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setPreviewTab(t.id)}
                className={`pb-3 text-[13px] font-semibold border-b-2 transition-colors ${
                  previewTab === t.id ? 'border-primary text-primary' : 'border-transparent text-gray-400'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Preview table */}
          <div className="card overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-gray-50 border-b border-border text-[11px] font-semibold text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 w-14 text-center">#</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Issues</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {previewRows.map((item) => {
                    const isError = !!item.errors;
                    return (
                      <tr key={item.row} className={isError ? 'bg-red-50' : ''}>
                        <td className="px-4 py-3 text-center text-gray-400 text-[12px]">
                          {item.row}
                        </td>
                        <td className="px-4 py-3">
                          {isError ? (
                            <span className="inline-flex items-center gap-1 text-red-600 text-[12px] font-medium">
                              <AlertCircle size={13} /> Error
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-green-600 text-[12px] font-medium">
                              <CheckCircle size={13} /> OK
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {item.data.member_name || <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{item.data.member_phone}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {item.resolvedPlanName || item.data.plan_name || (
                            <span className="text-gray-400">No plan</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isError ? (
                            <ul className="list-disc list-inside space-y-0.5">
                              {item.errors.map((e, i) => (
                                <li key={i} className="text-red-600 text-[12px]">{e}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {importError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-[13px] text-red-700">{importError}</p>
            </div>
          )}

          <div className="flex justify-between items-center">
            <Button variant="secondary" onClick={() => { reset(); setStep(2); }} className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Re-upload
            </Button>
            <Button
              onClick={handleImport}
              disabled={previewData.summary.valid === 0 || importing}
              className="flex items-center gap-2"
            >
              {importing ? 'Importing…' : `Import ${previewData.summary.valid} Row${previewData.summary.valid !== 1 ? 's' : ''}`}
              {!importing && <ArrowRight size={16} />}
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 4: Results ──────────────────────────────────── */}
      {step === 4 && importResult && (
        <div className="animate-in fade-in duration-200">
          <div className="card p-10 flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Import Complete</h2>
            <p className="text-[14px] text-gray-500">
              <span className="font-semibold text-gray-800">{importResult.imported}</span> member
              {importResult.imported !== 1 ? 's were' : ' was'} successfully imported.
            </p>
            {previewData?.summary?.errors > 0 && (
              <p className="text-[13px] text-amber-600 mt-2">
                {previewData.summary.errors} row{previewData.summary.errors !== 1 ? 's were' : ' was'} skipped due to errors.
              </p>
            )}
          </div>

          <div className="flex justify-center gap-4">
            <Button variant="secondary" onClick={reset} className="flex items-center gap-2">
              <RotateCcw size={16} />
              Import More
            </Button>
            <Button onClick={() => window.location.href = '/members'} className="flex items-center gap-2">
              View Members
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportData;

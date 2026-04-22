import React, { useState } from 'react';
import { 
  FileText, Upload, Eye, CheckCircle, AlertTriangle, 
  Info, ChevronDown, Download, ArrowRight, ArrowLeft,
  Check, AlertCircle
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const StepIndicator = ({ currentStep }) => {
  const steps = [
    { id: 1, label: 'Prepare' },
    { id: 2, label: 'Upload' },
    { id: 3, label: 'Preview' },
    { id: 4, label: 'Results' },
  ];

  return (
    <div className="flex items-center justify-center mb-10">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center relative">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
              currentStep >= step.id ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {currentStep > step.id ? <Check size={16} /> : step.id}
            </div>
            <span className={`absolute -bottom-6 text-[11px] font-medium whitespace-nowrap ${
              currentStep >= step.id ? 'text-primary' : 'text-gray-400'
            }`}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-20 h-0.5 mx-2 ${
              currentStep > step.id ? 'bg-primary' : 'bg-gray-200'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const ImportData = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState('Members');
  const [isColumnDetailsExpanded, setIsColumnDetailsExpanded] = useState(true);

  const columnDetails = [
    { column: 'member_phone', required: 'Yes', example: '9876543210', notes: 'Must match an existing member' },
    { column: 'plan_name', required: 'Yes', example: 'Monthly Basic', notes: 'Must match an active plan name' },
    { column: 'start_date', required: 'Yes', example: '01/01/2024', notes: 'DD/MM/YYYY' },
    { column: 'end_date', required: 'Yes', example: '31/01/2024', notes: 'DD/MM/YYYY, must be after start date' },
    { column: 'status', required: 'No', example: 'active', notes: 'active, expired, cancelled, paused' },
    { column: 'amount_paid', required: 'No', example: '2000', notes: 'Paid amount in INR' },
    { column: 'discount_amount', required: 'No', example: '300', notes: 'Discount in INR' },
  ];

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="mb-8">
        <h1 className="text-22px font-bold text-gray-900">Import Data</h1>
        <p className="text-[13px] text-gray-500 mt-1">Import your existing members, subscriptions, and leads via CSV.</p>
      </div>

      <div className="card p-4 mb-8 bg-blue-50 border-blue-100 flex items-start gap-3">
        <Info className="text-blue-500 mt-0.5" size={18} />
        <p className="text-[13px] text-blue-800">
          <span className="font-semibold">Import in order:</span> Members first → then Subscriptions. Leads can be imported anytime.
        </p>
      </div>

      <div className="flex items-center gap-8 border-b border-border mb-8">
        {['Members', 'Subscriptions', 'Leads'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-[13px] font-medium transition-colors relative ${
              activeTab === tab ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"></div>
            )}
          </button>
        ))}
      </div>

      <StepIndicator currentStep={currentStep} />

      {currentStep === 1 && (
        <div className="animate-in fade-in duration-300">
          <div className="card p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Prepare Your Data</h2>
            <p className="text-[13px] text-gray-500 mb-6 font-medium">Import member subscriptions to provide access to your gym.</p>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-8 flex items-start gap-3">
              <AlertTriangle className="text-yellow-600 mt-0.5" size={20} />
              <p className="text-[13px] text-yellow-800 font-medium">
                Members must be imported/added first. Membership plans must be created in Settings or Plans page.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Required Columns</h3>
              <div className="flex flex-wrap gap-2">
                {['member_phone', 'plan_name', 'start_date', 'end_date'].map(col => (
                  <span key={col} className="bg-red-50 text-red-600 border border-red-100 px-3 py-1 rounded-full text-[12px] font-medium">
                    {col}
                  </span>
                ))}
              </div>
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
              <button 
                onClick={() => setIsColumnDetailsExpanded(!isColumnDetailsExpanded)}
                className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between group"
              >
                <span className="text-sm font-semibold text-gray-700">View all column details (7 columns)</span>
                <ChevronDown size={18} className={`text-gray-400 transition-transform ${isColumnDetailsExpanded ? 'rotate-180' : ''}`} />
              </button>
              
              {isColumnDetailsExpanded && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[13px]">
                    <thead className="bg-white border-b border-border text-[11px] font-semibold text-gray-400 uppercase">
                      <tr>
                        <th className="px-4 py-3">Column</th>
                        <th className="px-4 py-3">Required</th>
                        <th className="px-4 py-3">Example</th>
                        <th className="px-4 py-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {columnDetails.map(row => (
                        <tr key={row.column}>
                          <td className="px-4 py-3 font-semibold text-gray-700">{row.column}</td>
                          <td className="px-4 py-3">
                            <span className={row.required === 'Yes' ? 'text-red-600 font-medium' : 'text-gray-400'}>{row.required}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{row.example}</td>
                          <td className="px-4 py-3 text-gray-400">{row.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button variant="secondary" className="flex items-center gap-2">
              <Download size={18} />
              Download Template
            </Button>
            <Button onClick={() => setCurrentStep(3)} className="flex items-center gap-2">
              I have my file ready
              <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="animate-in fade-in duration-300">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Validate & Preview</h2>
              <p className="text-[13px] text-gray-500 mt-1">Review your data before importing. Fix errors and re-upload if needed.</p>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg mb-6 flex items-center gap-2">
            <Info size={16} className="text-blue-500" />
            <span className="text-[13px] text-blue-700">Instruction row detected and excluded.</span>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="card p-4 border-status-active-border bg-status-active-bg flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-status-active-text text-white flex items-center justify-center font-bold">2</div>
              <div className="flex flex-col">
                <span className="text-[11px] text-status-active-text font-bold uppercase">Valid</span>
                <span className="text-[12px] text-status-active-text opacity-70">Ready to import</span>
              </div>
            </div>
            <div className="card p-4 border-red-200 bg-red-50 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center font-bold">0</div>
              <div className="flex flex-col">
                <span className="text-[11px] text-red-600 font-bold uppercase">Errors</span>
                <span className="text-[12px] text-red-400">Fix required</span>
              </div>
            </div>
            <div className="card p-4 border-yellow-200 bg-yellow-50 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold">0</div>
              <div className="flex flex-col">
                <span className="text-[11px] text-yellow-600 font-bold uppercase">Warnings</span>
                <span className="text-[12px] text-yellow-500">Review suggested</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 border-b border-border mb-6">
            {['All (2)', 'Errors (0)', 'Warnings (0)'].map(t => (
              <button key={t} className={`pb-3 text-[13px] font-semibold border-b-2 transition-colors ${
                t.startsWith('All') ? 'border-primary text-primary' : 'border-transparent text-gray-400'
              }`}>{t}</button>
            ))}
          </div>

          <div className="card overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-gray-50 border-b border-border text-[11px] font-semibold text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 w-16 text-center">Row</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Gender</th>
                    <th className="px-4 py-3">DOB</th>
                    <th className="px-4 py-3">Issues</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-4 text-center text-gray-400">2</td>
                    <td className="px-4 py-4"><Badge status="Active">OK</Badge></td>
                    <td className="px-4 py-4 font-medium text-gray-900">Test Upload 5</td>
                    <td className="px-4 py-4 text-gray-600">8334045666</td>
                    <td className="px-4 py-4 text-gray-600">upload5@gmail.com</td>
                    <td className="px-4 py-4 text-gray-600">male</td>
                    <td className="px-4 py-4 text-gray-600">15/06/1993</td>
                    <td className="px-4 py-4 text-gray-400">—</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4 text-center text-gray-400">3</td>
                    <td className="px-4 py-4"><Badge status="Active">OK</Badge></td>
                    <td className="px-4 py-4 font-medium text-gray-900">Test Upload 6</td>
                    <td className="px-4 py-4 text-gray-600">8334645777</td>
                    <td className="px-4 py-4 text-gray-600">upload6@gmail.com</td>
                    <td className="px-4 py-4 text-gray-600">female</td>
                    <td className="px-4 py-4 text-gray-600">22/03/1990</td>
                    <td className="px-4 py-4 text-gray-400">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button variant="secondary" onClick={() => setCurrentStep(1)} className="flex items-center gap-2">
              <ArrowLeft size={18} />
              Re-upload
            </Button>
            <Button className="flex items-center gap-2" onClick={() => alert('Data imported successfully!')}>
              Import 2 Rows
              <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportData;


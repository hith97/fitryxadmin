import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Dumbbell,
  Guitar,
  ImagePlus,
  Activity,
  MailCheck,
  MapPin,
  Music,
  PhoneCall,
  Sparkles,
  Trophy,
  Waves,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import { AUTH_TOKEN_STORAGE_KEY } from '../../config/auth';
import { useAuth } from '../../context/AuthContext';
import { partnerApi } from '../../services/partnerApi';
import AuthLayout from './AuthLayout';
import {
  businessCategoryGroups,
  defaultBusinessHours,
  onboardingSteps,
} from './authData';

const createInitialForm = () => ({
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  agreedToTerms: false,
  businessName: '',
  businessDescription: '',
  city: '',
  state: '',
  pincode: '',
  address: '',
  category: '',
  subcategoryIds: [],
  sportsTypes: [],
  photos: [],
  hours: defaultBusinessHours.map((item) => ({ ...item })),
  emailOtp: '',
  phoneOtp: '',
});

const InputField = ({ label, error, className = '', trailing, inputClassName = '', ...props }) => (
  <div className={className}>
    <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
    <div className="relative">
      <input
        {...props}
        className={`w-full rounded-2xl border px-4 py-3.5 text-sm text-slate-700 outline-none transition-all focus:bg-white focus:ring-4 ${
          trailing ? 'pr-12' : ''
        } ${
          error
            ? 'border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-rose-100'
            : 'border-slate-200 bg-slate-50 focus:border-primary focus:ring-primary/10'
        } ${inputClassName}`}
      />
      {trailing ? <div className="absolute inset-y-0 right-3 flex items-center">{trailing}</div> : null}
    </div>
    {error ? <div className="mt-2 text-sm text-rose-600">{error}</div> : null}
  </div>
);

const PasswordToggle = ({ visible, onClick, label }) => {
  const Icon = visible ? EyeOff : Eye;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/30"
      aria-label={label}
    >
      <Icon size={18} />
    </button>
  );
};

const TextAreaField = ({ label, error, rows = 4, ...props }) => (
  <div>
    <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
    <textarea
      {...props}
      rows={rows}
      className={`w-full rounded-2xl border px-4 py-3.5 text-sm text-slate-700 outline-none transition-all focus:bg-white focus:ring-4 ${
        error
          ? 'border-rose-300 bg-rose-50 focus:border-rose-400 focus:ring-rose-100'
          : 'border-slate-200 bg-slate-50 focus:border-primary focus:ring-primary/10'
      }`}
    />
    {error ? <div className="mt-2 text-sm text-rose-600">{error}</div> : null}
  </div>
);

const categoryIcons = {
  'Fitness & Wellness': Dumbbell,
  Dance: Music,
  'Water Activities': Waves,
  Sports: Trophy,
  'Music & Instrumental Training': Guitar,
  Activities: Activity,
};

const getPhotoKey = (file) => `${file.name}-${file.size}-${file.lastModified}`;

const buildTimingsPayload = (hours) =>
  hours.reduce((timings, item) => {
    timings[item.day.toLowerCase()] = item.enabled
      ? {
          open: item.open,
          close: item.close,
        }
      : null;

    return timings;
  }, {});

const createResumeForm = (resumeState) => {
  const nextForm = createInitialForm();
  const user = resumeState?.user || {};
  // partnerStatus.partner is preferred — it contains categoryId from GET /partner/status
  const partner = resumeState?.partnerStatus?.partner || resumeState?.partner || {};
  const matchedCategory = businessCategoryGroups.find(
    (category) => category.id === partner.categoryId || category.label === partner.categoryName
  );

  return {
    ...nextForm,
    fullName: user.name || user.fullName || nextForm.fullName,
    email: user.email || nextForm.email,
    phone: user.phone || nextForm.phone,
    businessName: partner.businessName || partner.name || nextForm.businessName,
    category: matchedCategory?.label || nextForm.category,
  };
};

const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const resumeState = location.state?.resumeOnboarding ? location.state : null;
  const shouldShowApproval = !resumeState && currentUser?.role === 'PARTNER' && currentUser?.partner?.status !== 'VERIFIED';
  const [step, setStep] = useState(() => resumeState?.resumeStep || (shouldShowApproval ? 5 : 1));
  const [form, setForm] = useState(() => (resumeState ? createResumeForm(resumeState) : createInitialForm()));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [partnerToken, setPartnerToken] = useState(() => resumeState?.token || localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || '');
  const [partnerStatus, setPartnerStatus] = useState(
    resumeState?.partnerStatus ||
      (shouldShowApproval
        ? {
            partner: currentUser.partner,
            verification: {
              phoneVerified: true,
              emailVerified: true,
            },
            hasCompletedOnboarding: true,
          }
        : null)
  );
  const [resendingChannel, setResendingChannel] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const setHourField = (index, field, value) => {
    setForm((current) => ({
      ...current,
      hours: current.hours.map((item, hourIndex) =>
        hourIndex === index ? { ...item, [field]: value } : item
      ),
    }));
    setErrors((current) => ({ ...current, hours: undefined }));
  };

  const selectCategory = (category) => {
    setForm((current) => ({
      ...current,
      category,
      sportsTypes: current.category === category ? current.sportsTypes : [],
      subcategoryIds: current.category === category ? current.subcategoryIds : [],
    }));
    setErrors((current) => ({ ...current, category: undefined, sportsTypes: undefined }));
  };

  const toggleSubCategory = (subCategory) => {
    const isSelected = form.subcategoryIds.includes(subCategory.id);

    setForm((current) => ({
      ...current,
      subcategoryIds: isSelected
        ? current.subcategoryIds.filter((item) => item !== subCategory.id)
        : [...current.subcategoryIds, subCategory.id],
      sportsTypes: isSelected
        ? current.sportsTypes.filter((item) => item !== subCategory.label)
        : [...current.sportsTypes, subCategory.label],
    }));
    setErrors((current) => ({ ...current, sportsTypes: undefined }));
  };

  const addPhotos = (event) => {
    const nextPhotos = Array.from(event.target.files || []);
    setForm((current) => ({
      ...current,
      photos: [...current.photos, ...nextPhotos].filter(
        (file, index, files) => files.findIndex((item) => getPhotoKey(item) === getPhotoKey(file)) === index
      ),
    }));
    setErrors((current) => ({ ...current, photos: undefined }));
    event.target.value = '';
  };

  const removePhoto = (photo) => {
    setForm((current) => ({
      ...current,
      photos: current.photos.filter((item) => getPhotoKey(item) !== getPhotoKey(photo)),
    }));
  };

  const validateStep = (currentStep) => {
    const nextErrors = {};

    if (currentStep === 1) {
      if (!form.businessName.trim()) {
        nextErrors.businessName = 'Business name is required.';
      }
      if (!form.category) {
        nextErrors.category = 'Select one category.';
      }
      if (!form.fullName.trim()) {
        nextErrors.fullName = 'Full name is required.';
      }
      if (!form.email.trim()) {
        nextErrors.email = 'Email is required.';
      }
      if (!form.phone.trim()) {
        nextErrors.phone = 'Phone number is required.';
      }
      if (!form.password) {
        nextErrors.password = 'Password is required.';
      }
      if (form.password.length > 0 && form.password.length < 6) {
        nextErrors.password = 'Password must be at least 6 characters.';
      }
      if (form.confirmPassword !== form.password) {
        nextErrors.confirmPassword = 'Passwords do not match.';
      }
      if (!form.agreedToTerms) {
        nextErrors.agreedToTerms = 'You must accept the terms to continue.';
      }
    }

    if (currentStep === 2) {
      if (!/^\d{6}$/.test(form.emailOtp)) {
        nextErrors.emailOtp = 'Enter a valid 6 digit email OTP.';
      }
      if (!/^\d{6}$/.test(form.phoneOtp)) {
        nextErrors.phoneOtp = 'Enter a valid 6 digit phone OTP.';
      }
    }

    if (currentStep === 3) {
      if (!form.businessDescription.trim()) {
        nextErrors.businessDescription = 'Business description is required.';
      }
      if (!form.city.trim()) {
        nextErrors.city = 'City is required.';
      }
      if (!form.state.trim()) {
        nextErrors.state = 'State is required.';
      }
      if (!/^\d{6}$/.test(form.pincode.trim())) {
        nextErrors.pincode = 'Enter a valid 6 digit pincode.';
      }
      if (!form.address.trim()) {
        nextErrors.address = 'Full address is required.';
      }
    }

    if (currentStep === 4) {
      if (!form.category) {
        nextErrors.category = 'Select one category first.';
      }
      if (!form.subcategoryIds.length) {
        nextErrors.sportsTypes = 'Choose at least one sub category.';
      }
      const hasOpenDay = form.hours.some((item) => item.enabled);
      const hasInvalidHours = form.hours.some(
        (item) => item.enabled && (!item.open || !item.close || item.open >= item.close)
      );

      if (!hasOpenDay || hasInvalidHours) {
        nextErrors.hours = 'Add at least one valid opening hour range.';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitStepOne = async () => {
    const selectedCategory = businessCategoryGroups.find((category) => category.label === form.category);
    setPartnerToken('');
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);

    const response = await partnerApi.register({
      ownerName: form.fullName.trim(),
      businessName: form.businessName.trim(),
      categoryId: selectedCategory.id,
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
    });
    const token = response.access_token || response.accessToken || response.token;

    if (!token) {
      throw new Error('Registration succeeded, but no access token was returned.');
    }

    setPartnerToken(token);
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    toast.success(response.message || 'OTP sent to phone and email.');
  };

  const verifyOtps = async () => {
    if (!partnerToken) {
      throw new Error('Missing partner token. Please register again.');
    }

    await Promise.all([
      partnerApi.verifyPhone(partnerToken, form.phone.trim(), form.phoneOtp),
      partnerApi.verifyEmail(partnerToken, form.email.trim(), form.emailOtp),
    ]);
    toast.success('Phone and email verified.');
  };

  const submitOnboarding = async () => {
    if (!partnerToken) {
      throw new Error('Missing partner token. Please register again.');
    }

    const response = await partnerApi.submitOnboarding(partnerToken, {
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
      lat: '',
      lng: '',
      description: form.businessDescription.trim(),
      timings: JSON.stringify(buildTimingsPayload(form.hours)),
      subcategoryIds: JSON.stringify(form.subcategoryIds),
      pricingModel: 'SUBSCRIPTION',
    }, form.photos);

    setPartnerStatus(response);
    toast.success(response.message || 'Business submitted for approval.');
  };

  const handleNext = async () => {
    if (!validateStep(step)) {
      toast.error('Please complete the required fields before continuing.');
      return;
    }

    setSubmitting(true);

    try {
      if (step === 1) {
        await submitStepOne();
        setStep(2);
        return;
      }

      if (step === 2) {
        await verifyOtps();
        setStep(3);
        return;
      }

      if (step === 4) {
        await submitOnboarding();
        setStep(5);
        return;
      }

      setStep((current) => current + 1);
    } catch (error) {
      toast.error(error.message);
      if (step === 1) {
        setErrors((current) => ({ ...current, email: error.message }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    setStep((current) => Math.max(1, current - 1));
  };

  const resendOtp = async (channel) => {
    if (!partnerToken) {
      toast.error('Missing partner token. Please register again.');
      return;
    }

    setResendingChannel(channel);

    try {
      if (channel === 'Email') {
        await partnerApi.resendEmailOtp(partnerToken);
      } else {
        await partnerApi.resendPhoneOtp(partnerToken);
      }

      toast.success(`${channel} OTP sent again.`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setResendingChannel('');
    }
  };

  const refreshPartnerStatus = async () => {
    const activeToken = partnerToken || localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || '';

    if (!activeToken) {
      toast.error('Please sign in again to refresh approval status.');
      return;
    }

    if (!partnerToken) {
      setPartnerToken(activeToken);
    }

    setStatusLoading(true);

    try {
      const response = await partnerApi.getStatus(activeToken);
      setPartnerStatus(response);
      toast.success('Status refreshed.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setStatusLoading(false);
    }
  };

  const isLastConfirmationStep = step === 5;
  const selectedCategory = businessCategoryGroups.find((category) => category.label === form.category);
  const subCategorySections = selectedCategory ? [selectedCategory] : [];

  return (
    <AuthLayout
      eyebrow="Onboarding"
      title="Create your business account"
      description="Set up your gym, studio, or sports venue, verify the business, and we will notify you once it is approved."
    >
      <div className="rounded-[32px] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <div className="border-b border-slate-200 px-5 py-5 sm:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-primary text-white">
              <Sparkles size={22} />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">Fitryx Onboarding</div>
              <div className="text-sm text-slate-500">New gym and academy registration flow</div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {onboardingSteps.map((item) => {
              const isActive = item.number === step;
              const isComplete = item.number < step;

              return (
                <div key={item.number} className="flex min-w-[120px] items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                      isComplete
                        ? 'bg-emerald-500 text-white'
                        : isActive
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {item.number}
                  </div>
                  <div className="text-sm font-semibold text-slate-600">{item.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-5 py-6 sm:px-8 sm:py-8">
          {step === 1 ? (
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Create your account</h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Start with the business name and owner account details.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <InputField
                  label="Business Name"
                  value={form.businessName}
                  onChange={(event) => setField('businessName', event.target.value)}
                  placeholder="Fitryx Club"
                  error={errors.businessName}
                />
                <InputField
                  label="Full Name"
                  value={form.fullName}
                  onChange={(event) => setField('fullName', event.target.value)}
                  placeholder="John Doe"
                  error={errors.fullName}
                />
                <InputField
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(event) => setField('email', event.target.value)}
                  placeholder="you@example.com"
                  error={errors.email}
                />
                <InputField
                  label="Phone"
                  value={form.phone}
                  onChange={(event) => setField('phone', event.target.value)}
                  placeholder="+91 9876543210"
                  error={errors.phone}
                />
                <InputField
                  label="Password"
                  type={passwordVisible ? 'text' : 'password'}
                  value={form.password}
                  onChange={(event) => setField('password', event.target.value)}
                  placeholder="Create a strong password"
                  error={errors.password}
                  trailing={
                    <PasswordToggle
                      visible={passwordVisible}
                      onClick={() => setPasswordVisible((current) => !current)}
                      label={passwordVisible ? 'Hide password' : 'Show password'}
                    />
                  }
                />
                <InputField
                  label="Confirm Password"
                  type={confirmPasswordVisible ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(event) => setField('confirmPassword', event.target.value)}
                  placeholder="Confirm your password"
                  error={errors.confirmPassword}
                  trailing={
                    <PasswordToggle
                      visible={confirmPasswordVisible}
                      onClick={() => setConfirmPasswordVisible((current) => !current)}
                      label={confirmPasswordVisible ? 'Hide confirm password' : 'Show confirm password'}
                    />
                  }
                />
              </div>

              <div>
                <div className="mb-3 text-sm font-semibold text-slate-700">Select category</div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {businessCategoryGroups.map((category) => {
                    const Icon = categoryIcons[category.label] || Sparkles;
                    const isSelected = form.category === category.label;

                    return (
                      <button
                        key={category.label}
                        type="button"
                        onClick={() => selectCategory(category.label)}
                        className={`flex min-h-[76px] items-center gap-3 rounded-[22px] border px-5 py-4 text-left transition-all ${
                          isSelected
                            ? 'border-primary bg-primary-light text-primary shadow-sm'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-primary/30 hover:bg-white'
                        }`}
                      >
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                            isSelected ? 'bg-white text-primary' : 'bg-white text-slate-500'
                          }`}
                        >
                          <Icon size={20} />
                        </span>
                        <span className="text-sm font-semibold">{category.label}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.category ? <div className="mt-2 text-sm text-rose-600">{errors.category}</div> : null}
              </div>

              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <input
                  type="checkbox"
                  checked={form.agreedToTerms}
                  onChange={(event) => setField('agreedToTerms', event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <div>
                  <div className="text-sm text-slate-600">
                    I agree to the Terms of Service and Privacy Policy.
                  </div>
                  {errors.agreedToTerms ? <div className="mt-1 text-sm text-rose-600">{errors.agreedToTerms}</div> : null}
                </div>
              </label>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Verify your business</h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Enter both OTPs to verify the owner phone number and email address before continuing.
                </p>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-light text-primary">
                      <MailCheck size={20} />
                    </div>
                    <div>
                      <div className="text-base font-semibold text-slate-900">Email verification</div>
                      <div className="mt-1 text-sm text-slate-500">OTP sent to {form.email || 'your email'}.</div>
                    </div>
                  </div>
                  <InputField
                    className="mt-5"
                    label="Email OTP"
                    value={form.emailOtp}
                    onChange={(event) => setField('emailOtp', event.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6 digit OTP"
                    error={errors.emailOtp}
                  />
                  <button
                    type="button"
                    onClick={() => resendOtp('Email')}
                    className="mt-2 text-sm font-semibold text-primary hover:text-[#5b54d6]"
                  >
                    {resendingChannel === 'Email' ? 'Sending...' : 'Resend email OTP'}
                  </button>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                      <PhoneCall size={20} />
                    </div>
                    <div>
                      <div className="text-base font-semibold text-slate-900">Phone verification</div>
                      <div className="mt-1 text-sm text-slate-500">OTP sent to {form.phone || 'your phone'}.</div>
                    </div>
                  </div>
                  <InputField
                    className="mt-5"
                    label="Phone OTP"
                    value={form.phoneOtp}
                    onChange={(event) => setField('phoneOtp', event.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6 digit OTP"
                    error={errors.phoneOtp}
                  />
                  <button
                    type="button"
                    onClick={() => resendOtp('Phone')}
                    className="mt-2 text-sm font-semibold text-primary hover:text-[#5b54d6]"
                  >
                    {resendingChannel === 'Phone' ? 'Sending...' : 'Resend phone OTP'}
                  </button>
                </div>
              </div>

              <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-700">
                Verification unlocks the remaining business setup steps for {form.businessName || 'your business'}.
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Tell us about your business</h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Add the core details we need before you configure categories and hours.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <InputField
                  label="City"
                  value={form.city}
                  onChange={(event) => setField('city', event.target.value)}
                  placeholder="Ahmedabad"
                  error={errors.city}
                />
                <InputField
                  label="State"
                  value={form.state}
                  onChange={(event) => setField('state', event.target.value)}
                  placeholder="Gujarat"
                  error={errors.state}
                />
                <InputField
                  label="Pincode"
                  value={form.pincode}
                  onChange={(event) => setField('pincode', event.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="380015"
                  error={errors.pincode}
                />
              </div>

              <TextAreaField
                label="Business Description"
                value={form.businessDescription}
                onChange={(event) => setField('businessDescription', event.target.value)}
                placeholder="Describe your gym, classes, or sports facility..."
                error={errors.businessDescription}
              />

              <TextAreaField
                label="Full Address"
                rows={3}
                value={form.address}
                onChange={(event) => setField('address', event.target.value)}
                placeholder="Street, locality, landmark, building, and floor"
                error={errors.address}
              />
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Business details</h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Choose sub categories, upload photos, and define working hours.
                </p>
              </div>

              {subCategorySections.length ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-700">Choose sub categories</div>
                    <div className="mt-1 text-sm text-slate-500">
                      {selectedCategory?.label || 'Select from the available categories.'}
                    </div>
                  </div>
                  {subCategorySections.map((category) => (
                    <div key={category.label} className="space-y-4">
                      {!selectedCategory ? (
                        <div className="text-sm font-semibold text-slate-900">{category.label}</div>
                      ) : null}
                      {category.groups.map((group) => (
                        <div key={`${category.label}-${group.label || 'default'}`}>
                          {group.label ? (
                        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                          {group.label}
                        </div>
                      ) : null}
                          <div className="flex flex-wrap gap-3">
                            {group.items.map((subCategory) => (
                              <button
                                key={subCategory.id}
                                type="button"
                                onClick={() => toggleSubCategory(subCategory)}
                                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                                  form.subcategoryIds.includes(subCategory.id)
                                    ? 'bg-primary text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {subCategory.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                  {errors.sportsTypes ? <div className="mt-2 text-sm text-rose-600">{errors.sportsTypes}</div> : null}
                </div>
              ) : (
                <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-700">
                  Please select a parent category on the Account step before choosing sub categories.
                  {errors.category ? <div className="mt-2 font-semibold">{errors.category}</div> : null}
                </div>
              )}

              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-light text-primary">
                      <ImagePlus size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Business photos</div>
                      <div className="text-sm text-slate-500">Optional jpg, png, webp images, up to 10 files.</div>
                    </div>
                  </div>

                  <label className="mt-5 flex cursor-pointer items-center justify-center rounded-[22px] border border-dashed border-slate-300 bg-white px-4 py-6 text-sm font-semibold text-slate-500 transition-colors hover:border-primary/40 hover:text-primary">
                    Upload Photos
                    <input type="file" multiple accept="image/*" className="hidden" onChange={addPhotos} />
                  </label>

                  {errors.photos ? <div className="mt-2 text-sm text-rose-600">{errors.photos}</div> : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {form.photos.map((photo) => (
                      <button
                        key={getPhotoKey(photo)}
                        type="button"
                        onClick={() => removePhoto(photo)}
                        className="rounded-full bg-white px-3 py-2 text-sm text-slate-600 shadow-sm"
                      >
                        {photo.name} x
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                      <Clock3 size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Business hours</div>
                      <div className="text-sm text-slate-500">Keep at least one open day.</div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {form.hours.map((item, index) => (
                      <div key={item.day} className="rounded-[20px] bg-slate-50 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <label className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={item.enabled}
                              onChange={(event) => setHourField(index, 'enabled', event.target.checked)}
                              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm font-semibold text-slate-700">{item.day}</span>
                          </label>
                          <MapPin size={15} className="text-slate-300" />
                        </div>

                        {item.enabled ? (
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <input
                              type="time"
                              value={item.open}
                              onChange={(event) => setHourField(index, 'open', event.target.value)}
                              className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-primary"
                            />
                            <input
                              type="time"
                              value={item.close}
                              onChange={(event) => setHourField(index, 'close', event.target.value)}
                              className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-primary"
                            />
                          </div>
                        ) : (
                          <div className="mt-3 text-sm text-slate-400">Closed</div>
                        )}
                      </div>
                    ))}
                  </div>
                  {errors.hours ? <div className="mt-2 text-sm text-rose-600">{errors.hours}</div> : null}
                </div>
              </div>
            </div>
          ) : null}

          {step === 5 ? (
            <div className="mx-auto max-w-[640px] text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">Waiting for approval</h2>
              <p className="mt-4 text-sm leading-7 text-slate-500">
                Your business has been verified and submitted successfully. Our team will review it and notify you through email or message once it is approved.
              </p>

              <div className="mt-6 grid gap-4 rounded-[26px] border border-slate-200 bg-slate-50 p-5 text-left sm:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Business</div>
                  <div className="mt-2 text-base font-semibold text-slate-900">{form.businessName}</div>
                  <div className="mt-1 text-sm text-slate-500">{form.category || 'Category pending'}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Status</div>
                  <div className="mt-2 text-base font-semibold text-slate-900">
                    {partnerStatus?.partner?.status || partnerStatus?.status || 'Pending'}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    {partnerStatus?.hasCompletedOnboarding === false
                      ? 'Onboarding not completed'
                      : 'Approval review in progress'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Phone</div>
                  <div className="mt-2 text-base font-semibold text-slate-900">
                    {partnerStatus?.verification?.phoneVerified ? 'Verified' : 'Waiting'}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">{form.phone}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Email</div>
                  <div className="mt-2 text-base font-semibold text-slate-900">
                    {partnerStatus?.verification?.emailVerified ? 'Verified' : 'Waiting'}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">{form.email}</div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button
                  type="button"
                  className="h-12 rounded-2xl px-6 text-sm font-semibold"
                  onClick={refreshPartnerStatus}
                  disabled={statusLoading}
                >
                  {statusLoading ? 'Refreshing...' : 'Refresh Status'}
                  <ArrowRight size={16} />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-12 rounded-2xl px-6 text-sm font-semibold"
                  onClick={() => {
                    setForm(createInitialForm());
                    setErrors({});
                    setPartnerToken('');
                    setPartnerStatus(null);
                    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
                    setStep(1);
                  }}
                >
                  Register Another Business
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-12 rounded-2xl px-6 text-sm font-semibold"
                  onClick={() => {
                    logout();
                    navigate('/login', { state: { prefillEmail: form.email } });
                  }}
                >
                  Sign In
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        {!isLastConfirmationStep ? (
          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="text-sm text-slate-500">
              Already have an account?
              {' '}
              <Link className="font-semibold text-primary hover:text-[#5b54d6]" to="/login">
                Sign in
              </Link>
            </div>

            <div className="flex gap-3 sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                className="h-12 rounded-2xl px-5"
                onClick={handleBack}
                disabled={step === 1 || submitting}
              >
                <ArrowLeft size={16} />
                Back
              </Button>
              <Button
                type="button"
                className="h-12 rounded-2xl px-5"
                onClick={handleNext}
                disabled={submitting}
              >
                {submitting
                  ? step === 1
                    ? 'Registering...'
                    : step === 2
                      ? 'Verifying...'
                      : step === 4
                        ? 'Submitting...'
                        : 'Please wait...'
                  : step === 4
                    ? 'Submit for Approval'
                    : 'Continue'}
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </AuthLayout>
  );
};

export default Register;

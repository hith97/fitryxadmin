import React, { createContext, useContext, useEffect, useState } from 'react';
import { leads as seedLeads, plans as seedPlans, staff as seedStaff } from '../mock/data';
import { members as seedMembers } from '../mock/members';

const STORAGE_KEY = 'fitryx-business-data-v1';

const BusinessDataContext = createContext(null);

const formatDateInput = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

const addDays = (dateString, days) => {
  const base = new Date(dateString);
  base.setDate(base.getDate() + days);
  return formatDateInput(base);
};

const getPlanPeriodDays = (plan) => {
  if (plan.periodUnit === 'Weeks') {
    return Number(plan.periodValue) * 7;
  }

  if (plan.periodUnit === 'Months') {
    return Number(plan.periodValue) * 30;
  }

  if (plan.periodUnit === 'Years') {
    return Number(plan.periodValue) * 365;
  }

  return Number(plan.periodValue);
};

const buildPlanDescription = (plan) => {
  if (plan.isPT) {
    return 'Personal training package with guided sessions and flexible scheduling.';
  }

  return `${plan.name} membership plan for ${plan.label?.replace('/', '') || 'your facility'} access.`;
};

const normalizePlans = () => {
  return seedPlans.map((plan) => {
    const periodValue = Number((plan.duration.match(/\d+/) || ['30'])[0]);
    const periodUnit = plan.duration.toLowerCase().includes('session')
      ? 'Sessions'
      : 'Days';

    return {
      ...plan,
      amount: plan.price,
      category: plan.isPT ? 'Personal Training' : plan.type || 'Regular',
      periodValue,
      periodUnit,
      limit: plan.isPT ? `${periodValue} Sessions` : 'Unlimited',
      className: plan.isPT ? 'PT Session' : 'General Fitness',
      signupFee: 0,
      description: buildPlanDescription(plan),
      installments: [],
      frequency: 'Class every week',
    };
  });
};

const normalizeLeads = () => {
  const interests = ['Weight Loss', 'General Fitness', 'Strength', 'Yoga', 'Swimming'];

  return seedLeads.map((lead, index) => ({
    ...lead,
    email:
      lead.email ||
      `${lead.name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '') || `lead${index + 1}`}@example.com`,
    interestedArea: interests[index % interests.length],
    assignedStaffId: seedStaff[index % seedStaff.length]?.id || '',
    referredById: '',
    inquiryDate: lead.followup,
    trialEndDate: '',
    convertedMemberId: null,
  }));
};

const normalizeMembers = (plans) => {
  return seedMembers.map((member, index) => {
    const nameParts = member.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
    const middleName = nameParts.slice(1, -1).join(' ');
    const plan = plans.find((item) => item.name === member.plan);
    const validFrom = member.joinedDate;
    const validTo = plan ? addDays(validFrom, getPlanPeriodDays(plan)) : '';

    return {
      ...member,
      name: member.name,
      fullName: member.name,
      memberId: `M${51726 + index}`,
      firstName,
      middleName,
      lastName,
      group: 'General',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      mobileNumber: member.phone.replace('+91 ', ''),
      phoneAlt: '',
      weight: '',
      height: '',
      chest: '',
      waist: '',
      thigh: '',
      arms: '',
      fat: '',
      assignedStaffId: seedStaff[0]?.id || '',
      interestedArea: 'General Fitness',
      source: 'Walk-in',
      referredById: '',
      inquiryDate: member.joinedDate,
      trialEndDate: '',
      memberType: 'Member',
      membershipPlanId: plan?.id || '',
      className: 'General Fitness',
      validFrom,
      validTo,
      firstPaymentDate: member.joinedDate,
      leadId: null,
    };
  });
};

const createDefaultState = () => {
  const plans = normalizePlans();

  return {
    plans,
    leads: normalizeLeads(),
    members: normalizeMembers(plans),
    staffMembers: seedStaff.map((item) => ({ ...item })),
    planCategories: [
      'Regular',
      'Limited',
      'Exercise',
      'Strength',
      'Weight Loss',
      'Personal Training',
    ],
    classOptions: ['General Fitness', 'Yoga', 'Zumba', 'CrossFit', 'Swimming'],
    memberGroups: ['General', 'Premium', 'Corporate', 'Students', 'Senior Citizens'],
    interests: ['General Fitness', 'Weight Loss', 'Strength', 'Yoga', 'Swimming'],
    leadSources: ['Walk-in', 'Facebook', 'Instagram', 'Website', 'Referral'],
    installmentTypes: ['Monthly EMI', 'Quarterly Split', 'Bi-Weekly'],
  };
};

export const BusinessDataProvider = ({ children }) => {
  const [data, setData] = useState(createDefaultState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      const initial = createDefaultState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      setData(initial);
      setReady(true);
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setData(parsed);
    } catch {
      const initial = createDefaultState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      setData(initial);
    }

    setReady(true);
  }, []);

  const updateData = (updater) => {
    setData((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const addOption = (key, value) => {
    if (!value) {
      return value;
    }

    let createdValue = value;

    updateData((current) => {
      if (key === 'staffMembers') {
        const normalizedName = value.name?.trim();
        if (!normalizedName) {
          return current;
        }

        if (current.staffMembers.some((item) => item.name.toLowerCase() === normalizedName.toLowerCase())) {
          return current;
        }

        createdValue = {
          id: `staff-${Date.now()}`,
          name: normalizedName,
          role: value.role || 'Trainer',
          phone: value.phone || '',
          status: 'Active',
        };

        return {
          ...current,
          staffMembers: [
            ...current.staffMembers,
            createdValue,
          ],
        };
      }

      const normalizedValue = value.trim();
      if (!normalizedValue) {
        return current;
      }

      if (current[key].some((item) => item.toLowerCase() === normalizedValue.toLowerCase())) {
        return current;
      }

      createdValue = normalizedValue;

      return {
        ...current,
        [key]: [...current[key], normalizedValue],
      };
    });

    return createdValue;
  };

  const addPlan = (plan) => {
    const nextPlan = {
      ...plan,
      id: `plan-${Date.now()}`,
      price: Number(plan.amount),
      activeMembers: 0,
      status: 'Active',
      createdAt: new Date().toISOString(),
    };

    updateData((current) => ({
      ...current,
      plans: [nextPlan, ...current.plans],
    }));

    return nextPlan;
  };

  const addLead = (lead) => {
    const nextLead = {
      ...lead,
      id: `lead-${Date.now()}`,
      status: lead.status || 'New',
      followup: lead.followup || formatDateInput(new Date()),
      inquiryDate: lead.inquiryDate || formatDateInput(new Date()),
      convertedMemberId: null,
    };

    updateData((current) => ({
      ...current,
      leads: [nextLead, ...current.leads],
    }));

    return nextLead;
  };

  const addMember = (member) => {
    const selectedPlan = data.plans.find((plan) => plan.id === member.membershipPlanId);
    const fullName = `${member.firstName} ${member.middleName} ${member.lastName}`.replace(/\s+/g, ' ').trim();
    const validFrom = member.validFrom || formatDateInput(new Date());
    const validTo =
      member.validTo ||
      (selectedPlan ? addDays(validFrom, getPlanPeriodDays(selectedPlan)) : '');
    const nextMember = {
      ...member,
      id: `member-${Date.now()}`,
      fullName,
      name: fullName,
      memberId: member.memberId || `M${Math.floor(10000 + Math.random() * 89999)}`,
      phone: member.mobileNumber ? `+91 ${member.mobileNumber}` : member.phone || '',
      plan: selectedPlan?.name || 'No Plan',
      status: member.memberType === 'Prospect' ? 'Inactive' : 'Active',
      joinedDate: validFrom,
      validFrom,
      validTo,
      membershipPlanId: member.membershipPlanId || '',
      className: member.className || 'General Fitness',
      firstPaymentDate: member.firstPaymentDate || validFrom,
    };

    updateData((current) => ({
      ...current,
      members: [nextMember, ...current.members],
      plans: current.plans.map((plan) =>
        plan.id === nextMember.membershipPlanId
          ? { ...plan, activeMembers: (plan.activeMembers || 0) + 1 }
          : plan
      ),
      leads: current.leads.map((lead) =>
        lead.id === nextMember.leadId
          ? {
              ...lead,
              status: 'Converted',
              convertedMemberId: nextMember.id,
              followup: formatDateInput(new Date()),
            }
          : lead
      ),
    }));

    return nextMember;
  };

  const getMemberById = (id) => data.members.find((member) => member.id === id);

  return (
    <BusinessDataContext.Provider
      value={{
        ...data,
        ready,
        addOption,
        addPlan,
        addLead,
        addMember,
        getMemberById,
      }}
    >
      {children}
    </BusinessDataContext.Provider>
  );
};

export const useBusinessData = () => {
  const context = useContext(BusinessDataContext);

  if (!context) {
    throw new Error('useBusinessData must be used within a BusinessDataProvider');
  }

  return context;
};

export const plans = [
  { 
    id: '1', 
    name: 'Couple Monthly', 
    duration: '30 days', 
    price: 2500, 
    activeMembers: 3, 
    status: 'Active', 
    isPT: false,
    label: '/month',
    type: 'Couple'
  },
  { 
    id: '2', 
    name: 'Yearly', 
    duration: '365 days', 
    price: 16000, 
    activeMembers: 0, 
    status: 'Active', 
    isPT: false,
    label: '/year'
  },
  { 
    id: '3', 
    name: 'Monthly', 
    duration: '30 days', 
    price: 1500, 
    activeMembers: 16, 
    status: 'Active', 
    isPT: false,
    label: '/month'
  },
  { 
    id: '4', 
    name: 'Half Yearly', 
    duration: '180 days', 
    price: 4000, 
    activeMembers: 0, 
    status: 'Active', 
    isPT: false,
    label: '/6 months'
  },
  { 
    id: '5', 
    name: 'Quarterly', 
    duration: '90 days', 
    price: 2500, 
    activeMembers: 10, 
    status: 'Active', 
    isPT: false,
    label: '/quarter'
  },
  { 
    id: 'pt-1', 
    name: 'Couple 12 Sessions', 
    duration: '12 Sessions - 30 days validity', 
    price: 9000, 
    rate: '₹750/session',
    activeMembers: 0, 
    status: 'Active', 
    isPT: true,
    type: 'Couple'
  },
  { 
    id: 'pt-2', 
    name: '20 Session Monthly', 
    duration: '20 Sessions - 60 days validity', 
    price: 10000, 
    rate: '₹500/session',
    activeMembers: 0, 
    status: 'Active', 
    isPT: true 
  },
];

export const leads = [
  { id: '1', name: 'Amit Kumar', phone: '+91 9876543210', source: 'Facebook', status: 'New', followup: '2026-02-12' },
  { id: '2', name: 'Sneha Rao', phone: '+91 8765432109', source: 'Walk-in', status: 'Contacted', followup: '2026-02-13' },
  { id: '3', name: 'Vikram Singh', phone: '+91 7654321098', source: 'Website', status: 'Converted', followup: '2026-02-10' },
  { id: '4', name: 'Priya Verma', phone: '+91 6543210987', source: 'Instagram', status: 'Lost', followup: '2026-02-05' },
  { id: '5', name: 'Rahul Dev', phone: '+91 5432109876', source: 'Referral', status: 'New', followup: '2026-02-15' },
];

export const staff = [
  { id: '1', name: 'John Doe', phone: '+91 9876543211', role: 'Trainer', status: 'Active' },
  { id: '2', name: 'Jane Smith', phone: '+91 8765432112', role: 'Manager', status: 'Active' },
  { id: '3', name: 'Mike Ross', phone: '+91 7654321113', role: 'Trainer', status: 'Inactive' },
];

export const dashboardStats = {
  todaySnapshot: [
    { label: 'Check-ins', value: 0, color: 'emerald' },
    { label: 'Check-outs', value: 0, color: 'gray' },
    { label: 'Currently In', value: 0, color: 'blue' },
    { label: 'Classes', value: '0/4', color: 'purple' },
    { label: 'PT Sessions', value: 0, color: 'orange' },
    { label: 'Payments', value: '₹0', color: 'emerald' },
  ],
  metricCards: [
    { label: 'Daily Revenue', value: '$4,235', trend: '+12.5%', color: 'blue', iconType: 'dollar' },
    { label: 'Active Members', value: '358', trend: '+8.2%', color: 'green', iconType: 'people' },
    { label: 'New Signups', value: '12', trend: '+23.1%', color: 'purple', iconType: 'userPlus' },
    { label: 'Class Bookings', value: '47', trend: '-5.4%', color: 'orange', iconType: 'calendar' }
  ],
  metrics: [
    { label: 'Total Revenue', value: '₹49,900', trend: '+100%', detail: 'From 35 transactions', color: 'green' },
    { label: 'Active Members', value: '24', trend: '+19', detail: 'of 26 total members', color: 'blue', progress: 92 },
    { label: 'New Members', value: '19', trend: '+16', detail: 'Joined this period', color: 'purple' },
    { label: 'Renewals', value: '16', trend: '₹50,000', detail: 'revenue', color: 'teal' }
  ],
  secondaryMetrics: [
    { label: 'Expiring Soon', value: '2', detail: 'Expiring in next 7 days', color: 'warning' },
    { label: 'Pending Leads', value: '5', detail: '5 due, Awaiting follow-up', color: 'danger' },
    { label: 'Period Attendance', value: '20', detail: '1 avg daily', color: 'success' },
    { label: 'PT Sessions', value: '18', detail: '₹10,000 revenue', color: 'primary' }
  ],
  revenueWeekly: [
    { day: 'Mon', amount: 2500 },
    { day: 'Tue', amount: 3200 },
    { day: 'Wed', amount: 2800 },
    { day: 'Thu', amount: 3900 },
    { day: 'Fri', amount: 4200 },
    { day: 'Sat', amount: 5200 },
    { day: 'Sun', amount: 3800 },
  ],
  memberGrowth: [
    { month: 'Jan', value: 240 },
    { month: 'Feb', value: 265 },
    { month: 'Mar', value: 290 },
    { month: 'Apr', value: 315 },
    { month: 'May', value: 340 },
    { month: 'Jun', value: 360 },
  ],
  membershipDistribution: [
    { name: 'Basic', value: 412, color: '#94A3B8' },
    { name: 'Premium', value: 624, color: '#3B82F6' },
    { name: 'Elite', value: 212, color: '#8B5CF6' },
  ],
  peakHours: [
    { time: '6AM', value: 180 },
    { time: '9AM', value: 120 },
    { time: '12PM', value: 160 },
    { time: '3PM', value: 90 },
    { time: '6PM', value: 280 },
    { time: '9PM', value: 110 },
  ],
  popularClasses: [
    { name: 'HIIT Cardio', current: 25, max: 25, color: '#EF4444' },
    { name: 'Yoga Flow', current: 22, max: 25, color: '#F59E0B' },
    { name: 'Spin Class', current: 19, max: 20, color: '#F59E0B' },
    { name: 'Strength Training', current: 14, max: 15, color: '#F59E0B' },
    { name: 'Pilates', current: 12, max: 20, color: '#10B981' },
  ],
  recentActivity: [
    { id: 1, type: 'registration', title: 'New Member Registration', user: 'Jessica Williams joined Premium plan', time: '5 min ago', status: 'success' },
    { id: 2, type: 'payment', title: 'Payment Received', user: 'Michael Brown - $79.00', time: '12 min ago', status: 'success' },
    { id: 3, type: 'cancellation', title: 'Class Cancelled', user: 'Evening Yoga - Low enrollment', time: '1 hour ago', status: 'warning' },
    { id: 4, type: 'issue', title: 'Equipment Issue', user: 'Treadmill #5 - Maintenance required', time: '2 hours ago', status: 'danger' },
    { id: 5, type: 'renewal', title: 'Membership Renewal', user: 'Sarah Davis renewed for 6 months', time: '3 hours ago', status: 'success' },
  ],
  bottomSummary: [
    { title: 'Membership Renewals Due', value: '87 members', subtext: 'Next 7 days', color: 'blue' },
    { title: 'Classes Scheduled Today', value: '24 classes', subtext: '8 trainers active', color: 'purple' },
    { title: 'Today\'s Revenue', value: '$4,280', subtext: '+15% vs yesterday', color: 'green' },
  ]
};

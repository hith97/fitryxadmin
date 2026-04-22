export const onboardingSteps = [
  { number: 1, label: 'Account' },
  { number: 2, label: 'Verify Business' },
  { number: 3, label: 'Your Business' },
  { number: 4, label: 'Business Details' },
  { number: 5, label: 'Approval' },
];

export const businessCategoryGroups = [
  {
    id: 1,
    label: 'Fitness & Wellness',
    groups: [
      {
        items: [
          { id: 1, label: 'Gym' },
          { id: 2, label: 'Yoga' },
          { id: 3, label: 'CrossFit' },
          { id: 4, label: 'Zumba / Aerobics' },
          { id: 5, label: 'Personal Training' },
        ],
      },
    ],
  },
  {
    id: 2,
    label: 'Dance',
    groups: [
      {
        items: [
          { id: 6, label: 'Hip-Hop' },
          { id: 7, label: 'Zumba' },
          { id: 8, label: 'Classical' },
          { id: 9, label: 'Contemporary' },
          { id: 10, label: 'Salsa / Bachata' },
          { id: 11, label: 'Garba' },
        ],
      },
    ],
  },
  {
    id: 3,
    label: 'Water Activities',
    groups: [
      {
        items: [
          { id: 12, label: 'Swimming' },
          { id: 13, label: 'Aqua Fitness' },
          { id: 14, label: 'Water Polo' },
        ],
      },
    ],
  },
  {
    id: 4,
    label: 'Sports',
    groups: [
      {
        label: 'Indoor',
        items: [
          { id: 15, label: 'Badminton' },
          { id: 16, label: 'Box Cricket' },
          { id: 17, label: 'Table Tennis' },
          { id: 18, label: 'Squash' },
          { id: 19, label: 'Futsal (Indoor Football)' },
          { id: 20, label: 'Basketball (Indoor Court)' },
          { id: 21, label: 'Volleyball (Indoor)' },
          { id: 22, label: 'Bowling' },
          { id: 23, label: 'Billiards / Pool' },
          { id: 24, label: 'Snooker' },
          { id: 25, label: 'Chess' },
          { id: 26, label: 'Carrom' },
          { id: 27, label: 'Skating (Indoor Rink)' },
          { id: 28, label: 'Gymnastics' },
          { id: 29, label: 'Pickleball (Indoor)' },
        ],
      },
      {
        label: 'Outdoor',
        items: [
          { id: 30, label: 'Cricket Ground' },
          { id: 31, label: 'Football Turf' },
          { id: 32, label: 'Tennis Court' },
          { id: 33, label: 'Basketball Court' },
          { id: 34, label: 'Volleyball Court' },
          { id: 35, label: 'Hockey Ground' },
          { id: 36, label: 'Badminton (Outdoor)' },
          { id: 37, label: 'Kabaddi Ground' },
          { id: 38, label: 'Kho-Kho Ground' },
          { id: 39, label: 'Athletics Track' },
          { id: 40, label: 'Baseball / Softball' },
          { id: 41, label: 'Golf Course' },
          { id: 42, label: 'Archery' },
          { id: 43, label: 'Skating (Outdoor)' },
          { id: 44, label: 'Cycling Track' },
          { id: 45, label: 'Pickleball (Outdoor)' },
        ],
      },
    ],
  },
  {
    id: 5,
    label: 'Music & Instrumental Training',
    groups: [
      {
        items: [
          { id: 46, label: 'Vocal Training' },
          { id: 47, label: 'Guitar' },
          { id: 48, label: 'Piano / Keyboard' },
          { id: 49, label: 'Drums' },
          { id: 50, label: 'Violin' },
          { id: 51, label: 'Flute' },
          { id: 52, label: 'Tabla' },
          { id: 53, label: 'Harmonium' },
          { id: 54, label: 'DJ Training' },
          { id: 55, label: 'Music Production' },
          { id: 56, label: 'Sound Engineering' },
        ],
      },
    ],
  },
  {
    id: 6,
    label: 'Activities',
    groups: [
      {
        items: [
          { id: 57, label: 'Martial Arts' },
          { id: 58, label: 'Skating' },
          { id: 59, label: 'Kids Activities' },
          { id: 60, label: 'Adventure Activities' },
          { id: 61, label: 'Yoga Retreats' },
        ],
      },
    ],
  },
];

export const businessCategories = businessCategoryGroups.map((category) => category.label);

export const defaultBusinessHours = [
  { day: 'Monday', enabled: true, open: '06:00', close: '22:00' },
  { day: 'Tuesday', enabled: true, open: '06:00', close: '22:00' },
  { day: 'Wednesday', enabled: true, open: '06:00', close: '22:00' },
  { day: 'Thursday', enabled: true, open: '06:00', close: '22:00' },
  { day: 'Friday', enabled: true, open: '06:00', close: '22:00' },
  { day: 'Saturday', enabled: true, open: '07:00', close: '20:00' },
  { day: 'Sunday', enabled: false, open: '07:00', close: '14:00' },
];

export const authHighlights = [
  'Onboard new gyms, studios, courts, and academies from one place.',
  'Business verification with phone OTP and email OTP before approval.',
  'Approval updates are shared through email and message notifications.',
];

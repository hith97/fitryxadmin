// Amenities config keyed by category name (lowercase match)
// Each entry: { section, items: [{ key, label }] }

const COMMON = [
  {
    section: 'Basic Facilities',
    items: [
      { key: 'parking',       label: 'Parking' },
      { key: 'waiting_area',  label: 'Waiting Area' },
      { key: 'washroom',      label: 'Washroom' },
      { key: 'drinking_water',label: 'Drinking Water' },
    ],
  },
  {
    section: 'Comfort',
    items: [
      { key: 'ac',            label: 'Air Conditioning' },
      { key: 'seating',       label: 'Seating Area' },
      { key: 'clean_space',   label: 'Clean & Hygienic Space' },
    ],
  },
  {
    section: 'Safety',
    items: [
      { key: 'cctv',          label: 'CCTV Surveillance' },
      { key: 'first_aid',     label: 'First Aid' },
      { key: 'emergency',     label: 'Emergency Support' },
    ],
  },
  {
    section: 'Digital & Access',
    items: [
      { key: 'online_booking',label: 'Online Booking' },
      { key: 'mobile_app',    label: 'Mobile App' },
      { key: 'qr_entry',      label: 'QR / Smart Entry' },
    ],
  },
  {
    section: 'Services',
    items: [
      { key: 'trial_session', label: 'Trial Session' },
      { key: 'membership',    label: 'Membership Plans' },
      { key: 'support',       label: 'Customer Support' },
    ],
  },
];

const GYM = [
  {
    section: 'Core Training',
    items: [
      { key: 'cardio',         label: 'Cardio Machines' },
      { key: 'strength',       label: 'Strength Equipment' },
      { key: 'free_weights',   label: 'Free Weights' },
      { key: 'functional',     label: 'Functional Training Area' },
      { key: 'personal_train', label: 'Personal Training' },
    ],
  },
  {
    section: 'Facilities',
    items: [
      { key: 'locker',         label: 'Locker Room' },
      { key: 'shower',         label: 'Shower' },
      { key: 'changing',       label: 'Changing Room' },
      { key: 'ac_gym',         label: 'Air Conditioning' },
    ],
  },
  {
    section: 'Wellness',
    items: [
      { key: 'yoga_area',      label: 'Yoga Area' },
      { key: 'steam_sauna',    label: 'Steam / Sauna' },
      { key: 'massage',        label: 'Massage / Therapy' },
    ],
  },
  {
    section: 'Convenience',
    items: [
      { key: 'wifi',           label: 'Wi-Fi' },
      { key: 'music',          label: 'Music System' },
      { key: 'mobile_book',    label: 'Mobile Booking' },
    ],
  },
];

const DANCE = [
  {
    section: 'Dance Types',
    items: [
      { key: 'bollywood',      label: 'Bollywood' },
      { key: 'hiphop',         label: 'Hip-Hop' },
      { key: 'contemporary',   label: 'Contemporary' },
      { key: 'classical',      label: 'Classical' },
      { key: 'zumba',          label: 'Zumba' },
    ],
  },
  {
    section: 'Training Features',
    items: [
      { key: 'beginner',       label: 'Beginner Classes' },
      { key: 'advanced',       label: 'Advanced Batches' },
      { key: 'choreography',   label: 'Choreography Sessions' },
      { key: 'competition',    label: 'Competition Training' },
    ],
  },
  {
    section: 'Facilities',
    items: [
      { key: 'dance_studio',   label: 'Dance Studio' },
      { key: 'mirrors',        label: 'Mirrors' },
      { key: 'sound_system',   label: 'Sound System' },
      { key: 'changing_dance', label: 'Changing Room' },
    ],
  },
  {
    section: 'Services',
    items: [
      { key: 'trial_class',    label: 'Trial Class' },
      { key: 'certification',  label: 'Certification' },
      { key: 'workshop',       label: 'Workshop Events' },
    ],
  },
];

const WATER = [
  {
    section: 'Activity Types',
    items: [
      { key: 'swimming',       label: 'Swimming' },
      { key: 'aqua_aerobics',  label: 'Aqua Aerobics' },
      { key: 'water_polo',     label: 'Water Polo' },
      { key: 'diving',         label: 'Diving' },
    ],
  },
  {
    section: 'Pool Features',
    items: [
      { key: 'indoor_pool',    label: 'Indoor Pool' },
      { key: 'outdoor_pool',   label: 'Outdoor Pool' },
      { key: 'temp_control',   label: 'Temperature Controlled' },
    ],
  },
  {
    section: 'Safety',
    items: [
      { key: 'lifeguard',      label: 'Lifeguard Available' },
      { key: 'safety_equip',   label: 'Safety Equipment' },
      { key: 'first_aid_w',    label: 'First Aid' },
    ],
  },
  {
    section: 'Facilities',
    items: [
      { key: 'changing_w',     label: 'Changing Room' },
      { key: 'shower_w',       label: 'Shower' },
      { key: 'locker_w',       label: 'Locker' },
    ],
  },
];

const SPORTS = [
  {
    section: 'Sports Types',
    items: [
      { key: 'cricket',        label: 'Cricket' },
      { key: 'football',       label: 'Football' },
      { key: 'badminton',      label: 'Badminton' },
      { key: 'tennis',         label: 'Tennis' },
      { key: 'basketball',     label: 'Basketball' },
    ],
  },
  {
    section: 'Training',
    items: [
      { key: 'coaching',       label: 'Coaching Available' },
      { key: 'academy',        label: 'Academy Programs' },
      { key: 'personal_coach', label: 'Personal Coaching' },
    ],
  },
  {
    section: 'Facilities',
    items: [
      { key: 'indoor_courts',  label: 'Indoor Courts' },
      { key: 'outdoor_ground', label: 'Outdoor Grounds' },
      { key: 'equipment_rent', label: 'Equipment Rental' },
    ],
  },
  {
    section: 'Events',
    items: [
      { key: 'tournaments',    label: 'Tournaments' },
      { key: 'practice_match', label: 'Practice Matches' },
    ],
  },
];

const MUSIC = [
  {
    section: 'Instruments',
    items: [
      { key: 'guitar',         label: 'Guitar' },
      { key: 'piano',          label: 'Piano / Keyboard' },
      { key: 'drums',          label: 'Drums' },
      { key: 'violin',         label: 'Violin' },
      { key: 'flute',          label: 'Flute' },
    ],
  },
  {
    section: 'Training',
    items: [
      { key: 'beginner_m',     label: 'Beginner Lessons' },
      { key: 'advanced_m',     label: 'Advanced Training' },
      { key: 'vocal',          label: 'Vocal Training' },
      { key: 'theory',         label: 'Music Theory' },
    ],
  },
  {
    section: 'Facilities',
    items: [
      { key: 'practice_rooms', label: 'Practice Rooms' },
      { key: 'recording',      label: 'Recording Studio' },
      { key: 'sound_equip',    label: 'Sound Equipment' },
    ],
  },
  {
    section: 'Services',
    items: [
      { key: 'cert_music',     label: 'Certification' },
      { key: 'live_perf',      label: 'Live Performances' },
      { key: 'workshop_m',     label: 'Workshops' },
    ],
  },
];

// Match category name (lowercase) → category-specific blocks
const CATEGORY_MAP = {
  gym:           GYM,
  fitness:       GYM,
  dance:         DANCE,
  swimming:      WATER,
  'water sports':WATER,
  sports:        SPORTS,
  cricket:       SPORTS,
  football:      SPORTS,
  badminton:     SPORTS,
  music:         MUSIC,
  martial:       GYM,
  yoga:          GYM,
  crossfit:      GYM,
  zumba:         DANCE,
};

export const getAmenityConfig = (categoryName = '') => {
  const key = Object.keys(CATEGORY_MAP).find((k) =>
    categoryName.toLowerCase().includes(k)
  );
  const specific = key ? CATEGORY_MAP[key] : [];
  return [...specific, ...COMMON];
};

export default CATEGORY_MAP;

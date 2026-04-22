export const partnerStatuses = ['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'];

export const normalizePartnerList = (payload) => {
  if (Array.isArray(payload)) {
    return { partners: payload, total: payload.length };
  }

  const partners = payload?.partners || payload?.data || payload?.items || payload?.results || [];
  const total = payload?.total || payload?.count || payload?.meta?.total || partners.length;

  return { partners, total };
};

export const normalizePartnerDetail = (payload) => payload?.partner || payload?.data || payload || {};

export const getPartnerId = (partner) => partner?.id || partner?.partnerId || partner?._id;

export const getBusinessName = (partner) =>
  partner?.businessName || partner?.name || partner?.business?.name || partner?.onboarding?.businessName || 'Unnamed business';

export const getOwnerName = (partner) =>
  partner?.ownerName || partner?.user?.name || partner?.user?.fullName || partner?.owner?.name || 'Not available';

export const getEmail = (partner) => partner?.email || partner?.user?.email || partner?.owner?.email || 'Not available';

export const getPhone = (partner) => partner?.phone || partner?.user?.phone || partner?.owner?.phone || 'Not available';

export const getStatus = (partner) => partner?.status || partner?.partner?.status || 'PENDING';

export const getCategory = (partner) =>
  partner?.categoryName || partner?.category?.name || partner?.business?.category || partner?.category || 'Not available';

export const getAddress = (partner) => {
  const onboarding = partner?.onboarding || partner?.business || partner;
  return [onboarding?.address, onboarding?.city, onboarding?.state, onboarding?.pincode].filter(Boolean).join(', ');
};

export const getImageUrls = (partner) => {
  const images = partner?.images || partner?.businessImages || partner?.business?.images || partner?.onboarding?.images || [];
  return images
    .map((item) => (typeof item === 'string' ? item : item?.url || item?.path))
    .filter(Boolean);
};


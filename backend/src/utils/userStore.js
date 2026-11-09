export const IN_MEMORY_USERS = new Map();

export function sanitizeUser(user) {
  if (!user) return null;
  const raw = user.toObject ? user.toObject() : { ...user };
  delete raw.password;
  if (!raw.dob) raw.dob = '';
  if (!raw.age && raw.dob) {
    const birth = new Date(raw.dob);
    if (!isNaN(birth.getTime())) {
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      raw.age = Math.max(0, age);
    }
  }
  if (!raw.gender) raw.gender = 'Prefer not to say';
  if (!raw.phone) raw.phone = '';
  return raw;
}


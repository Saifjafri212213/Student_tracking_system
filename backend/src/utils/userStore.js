import bcrypt from 'bcryptjs';

export const IN_MEMORY_USERS = new Map();
export const DEMO_PASSWORD_HASH = bcrypt.hashSync('Password@123', 10);

IN_MEMORY_USERS.set('aarav@college.edu', {
  uid: 'user_2100000000101',
  fullName: 'Aarav Sharma',
  rollNumber: '2100000000101',
  email: 'aarav@college.edu',
  branch: 'CSE',
  academicYear: 4,
  admissionYear: 2021,
  dob: '2003-05-14',
  age: 23,
  gender: 'Male',
  phone: '+91 98765 43210',
  password: DEMO_PASSWORD_HASH,
  handles: {
    leetcode: 'aarav_cp',
    codeforces: 'aarav_grandmaster',
    codechef: 'aarav_chef'
  }
});

export function sanitizeUser(user) {
  if (!user) return null;
  const raw = user.toObject ? user.toObject() : { ...user };
  delete raw.password;
  if (!raw.dob) raw.dob = '2003-05-14';
  if (!raw.age) {
    const birth = new Date(raw.dob);
    if (!isNaN(birth.getTime())) {
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      raw.age = Math.max(0, age);
    } else {
      raw.age = 21;
    }
  }
  if (!raw.gender) raw.gender = 'Male';
  if (!raw.phone) raw.phone = '+91 98765 43210';
  return raw;
}


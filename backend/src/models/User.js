import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true, index: true },
  fullName: { type: String, required: true },
  rollNumber: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/^\d{13}$/, 'Roll Number must be exactly 13 numeric digits'] 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'] 
  },
  password: { type: String },
  branch: { type: String, default: 'CSE' },
  academicYear: { type: Number, required: true, min: 1, max: 4, index: true },
  admissionYear: { type: Number, required: true },
  dob: { type: String, default: '2003-05-14' },
  age: { type: Number, default: 21 },
  gender: { type: String, default: 'Prefer not to say' },
  phone: { type: String, default: '' },
  handles: {
    leetcode: { type: String, default: '' },
    codeforces: { type: String, default: '' },
    codechef: { type: String, default: '' }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;

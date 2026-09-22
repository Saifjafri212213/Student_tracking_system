import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  author_id: { type: String, default: 'anonymous' },
  author_name: { type: String, default: 'Student' },
  author_avatar: { type: String, default: 'https://api.dicebear.com/7.x/bottts/svg?seed=Student' },
  content: { type: String, required: true },
  code_lang: { type: String, default: 'cpp' },
  code: { type: String, default: '' },
  upvotes_count: { type: Number, default: 0 },
  is_accepted: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

const doubtSchema = new mongoose.Schema({
  author_id: { type: String, required: true, index: true },
  author_name: { type: String, default: 'Student' },
  author_avatar: { type: String, default: 'https://api.dicebear.com/7.x/bottts/svg?seed=Coder' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  markdownBody: { type: String },
  tags: [{ type: String, index: true }],
  code_lang: { type: String, default: 'cpp' },
  code: { type: String, default: '' },
  upvotes_count: { type: Number, default: 0 },
  is_resolved: { type: Boolean, default: false, index: true },
  answers: [answerSchema],
  createdAt: { type: Date, default: Date.now, index: -1 }
});

export const Doubt = mongoose.models.Doubt || mongoose.model('Doubt', doubtSchema);
export default Doubt;

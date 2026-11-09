import { isDbConnected } from '../config/db.js';
import { Doubt } from '../models/Doubt.js';
import { INITIAL_DOUBTS_SEED } from '../seed.js';

export async function getDoubts(req, res) {
  try {
    let doubts = [];

    if (isDbConnected()) {
      doubts = await Doubt.find()
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
    }

    if (!doubts || doubts.length === 0) {
      doubts = INITIAL_DOUBTS_SEED;
    }

    // Normalize property names for seamless frontend compatibility
    const normalized = doubts.map(d => ({
      ...d,
      id: d._id?.toString() || d.id,
      authorName: d.author_name || d.authorName || 'Student',
      upvotes: d.upvotes_count ?? d.upvotes ?? 0,
      isResolved: d.is_resolved ?? d.isResolved ?? false,
      markdownBody: d.markdownBody || d.description || '',
      createdAt: d.createdAt || d.created_at || new Date()
    }));

    res.json({ doubts: normalized });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createDoubt(req, res) {
  const { title, markdownBody, tags } = req.body;
  const authorUid = req.user?.uid || req.body.authorUid || 'student_guest';
  const authorName = req.user?.fullName || req.body.authorName || 'Student';

  if (!title || !markdownBody) {
    return res.status(400).json({ error: 'Title and markdownBody are required.' });
  }

  try {
    const doubtDoc = {
      author_id: authorUid,
      author_name: authorName,
      title: title.trim(),
      description: markdownBody.trim(),
      markdownBody: markdownBody.trim(),
      tags: Array.isArray(tags) ? tags : [],
      upvotes_count: 0,
      is_resolved: false,
      answers: [],
      createdAt: new Date()
    };

    let savedDoubt = { id: 'doubt_' + Date.now(), ...doubtDoc };
    if (isDbConnected()) {
      const created = await Doubt.create(doubtDoc);
      savedDoubt = created.toObject();
    } else {
      INITIAL_DOUBTS_SEED.unshift(savedDoubt);
    }

    res.status(201).json({ 
      message: 'Doubt successfully published.',
      doubt: savedDoubt
    });
  } catch (err) {
    console.error('[DoubtPost] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
}

export async function postAnswer(req, res) {
  const { id } = req.params;
  const { content } = req.body;
  const authorId = req.user?.uid || req.body.authorId || 'student_peer';
  const authorName = req.user?.fullName || req.body.authorName || 'Peer';

  if (!content) {
    return res.status(400).json({ error: 'Answer content is required.' });
  }

  try {
    const answer = {
      author_id: authorId,
      author_name: authorName,
      content: content.trim(),
      upvotes_count: 0,
      is_accepted: false,
      created_at: new Date()
    };

    if (isDbConnected()) {
      try {
        await Doubt.findByIdAndUpdate(id, { $push: { answers: answer } });
      } catch (e) {
        await Doubt.findOneAndUpdate({ $or: [{ _id: id }, { id }] }, { $push: { answers: answer } });
      }
    } else {
      const doubt = INITIAL_DOUBTS_SEED.find(d => d._id === id || d.id === id);
      if (doubt) {
        if (!doubt.answers) doubt.answers = [];
        doubt.answers.push(answer);
      }
    }

    res.status(201).json({ message: 'Answer posted successfully', answer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function upvoteDoubt(req, res) {
  const { id } = req.params;
  try {
    let upvotes = 1;
    if (isDbConnected()) {
      let updated = null;
      try {
        updated = await Doubt.findByIdAndUpdate(
          id,
          { $inc: { upvotes_count: 1 } },
          { new: true }
        );
      } catch (e) {
        updated = await Doubt.findOneAndUpdate(
          { $or: [{ _id: id }, { id }] },
          { $inc: { upvotes_count: 1 } },
          { new: true }
        );
      }
      if (updated) {
        upvotes = updated.upvotes_count;
      }
    } else {
      const doubt = INITIAL_DOUBTS_SEED.find(d => d._id === id || d.id === id);
      if (doubt) {
        doubt.upvotes_count = (doubt.upvotes_count || 0) + 1;
        upvotes = doubt.upvotes_count;
      }
    }
    res.json({ message: 'Upvote registered', upvotes_count: upvotes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function toggleResolve(req, res) {
  const { id } = req.params;
  try {
    let is_resolved = true;
    if (isDbConnected()) {
      let doubt = await Doubt.findById(id).catch(() => null);
      if (!doubt) doubt = await Doubt.findOne({ id }).catch(() => null);
      if (doubt) {
        doubt.is_resolved = !doubt.is_resolved;
        await doubt.save();
        is_resolved = doubt.is_resolved;
      }
    } else {
      const doubt = INITIAL_DOUBTS_SEED.find(d => d._id === id || d.id === id);
      if (doubt) {
        doubt.is_resolved = !doubt.is_resolved;
        is_resolved = doubt.is_resolved;
      }
    }
    res.json({ message: 'Doubt status updated', is_resolved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


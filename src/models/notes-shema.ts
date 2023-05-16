const mongoose = require('mongoose');
const note = new mongoose.Schema(
  {
    parentId: {
      type: String || null,
      require: true,
    },
    childrenId: {
      type: [String],
      default: [],
    },
    text: {
      type: String,
      default: '',
    },
    userId: {
      type: String,
      require: true,
    },
  },
  { versionKey: false },
);

const Note = mongoose.model('note', note);

module.exports = Note;

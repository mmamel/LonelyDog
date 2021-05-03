const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    member_id: [String]
}, {timestamps: true});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
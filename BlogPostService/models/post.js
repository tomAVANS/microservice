var mongoose = require('mongoose');

var postSchema = mongoose.Schema({
    _id: {type: String, required: true, unique: true},
    title: {type: String, required: true},
    content: {type: String, required: true},
    comments: {type: Array}
});

mongoose.model('Post', postSchema);
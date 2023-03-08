var mongoose = require('mongoose');

var commentSchema = mongoose.Schema({
    
    title: {type: String, required: true},
    content: {type: String, required: true},
});

mongoose.model('Comment', commentSchema);
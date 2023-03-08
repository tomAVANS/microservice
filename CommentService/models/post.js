var mongoose = require('mongoose');
let Comment = mongoose.model('Comment');

var postSchema = mongoose.Schema({
    _id: {type: String, required: true, unique: true},
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}]
});

// postSchema.pre('findOneAndDelete', function(next) {
//     console.log("deleting start");
//     let model = this.populate('comments');
//     this.comments.forEach(comment => {
//         console.log(comment._id);
//         Comment.findByIdAndDelete(comment._id);
//     });
//     next()
// });

mongoose.model('Post', postSchema);
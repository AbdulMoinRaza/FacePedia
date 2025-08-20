import mongoose from "mongoose";

const postSchema = mongoose.Schema(
    {
        // userId: {
        //     type: Schema.Types.ObjectId,
        //     ref : "User"
        // }
        userId: {
            type: String,
            required: true
        },
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        location: String,
        description: String,
        picturePath: String,
        userPicturePath: String,
        faces: {
            type: Array,
            default: []
        },
        likes: {
            type: Map,
            of: Boolean,
        },
        comments: {
            type: Array,
            default: []
        },
        tags: {
            type: [
                {
                    userId: String, // ID of the tagged user
                    name: String    // Name of the tagged user
                }
            ],
            default: []
        },
        seenBy: {
            type: [
                {
                    userId: String, // ID of the user who viewed the post
                    seenAt: {
                        type: Date,
                        default: Date.now
                    }
                }
            ],
            default: []
        }
    },
    { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;

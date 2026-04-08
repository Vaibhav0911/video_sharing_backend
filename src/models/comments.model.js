import mongoose, {Schema} from "mongoose";

const commentSchema = new Schema(
    {
       video: {
        type: Schema.Types.ObjectId,
        ref: "Videos",
        index: true
       },
       content: {
        type: String,
        default: ""
       },
       owner: {
        type: Schema.Types.ObjectId,
        ref: "Users",
       }
    }, {timestamps: true}
);

export const Comments = mongoose.model("Comments", commentSchema);
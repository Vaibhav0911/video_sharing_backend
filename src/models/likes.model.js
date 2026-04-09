import mongoose, {Schema} from "mongoose";

const likeSchema = new Schema({

    likeBy: {
        type: Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },
    targetType: {
        type: String,
        enum: ["Videos", "Comments"],
        required: true
    },
    targetId: {
        type: Schema.Types.ObjectId,
        refPath: targetType,
        required: true
    } 

}, {timestamps: true})

likeSchema.index(
    {likeBy: 1, targetType: 1, targetId: 1},
    {unique: true}
);

export const Likes = mongoose.model("Likes", likeSchema);
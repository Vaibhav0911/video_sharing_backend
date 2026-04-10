import mongoose, { Schema } from "mongoose";
import { nanoid } from "nanoid";
import slugify from "slugify";

const videoSchema = new Schema(
  {
    videofile: {
      type: String,
      required: true,
    },
    videofileId: {
      type: String,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    thumbnailId: {
      type: String,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    duration: {
      type: String,
      required: true,
    },
    slug: {
      // SEO slug
      type: String,
      unique: true,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublised: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
  },
  {
    timestamps: true,
  }
);

async function slugMiddleware() {
  if (this.isModified && this.isModified("title")) {
    const baseSlug = slugify(this.title, {
      lower: true,
      strict: true,
    });

    const existing = await this.constructor.findOne({
      slug: baseSlug,
      _id: { $ne: this._id },
    });

    this.slug = existing ? `${baseSlug}-${nanoid(4)}` : baseSlug;
  } else if (this.getUpdate) {
    const update = this.getUpdate();

    const title = update.title || update.$set?.title;

    if (title) {
      const baseSlug = slugify(title, {
        lower: true,
        strict: true,
      });

      const existing = await this.model.findOne({
        slug: baseSlug,
        _id: { $ne: this.getQuery()._id },
      });

      const slug = existing ? `${baseSlug}-${nanoid(4)}` : baseSlug;

      if (update.$set) {
        update.$set.slug = slug;
      } else {
        update.slug = slug;
      }

      console.log(slug);
    }
  }
}

videoSchema.pre("save", slugMiddleware);
videoSchema.pre("findOneAndUpdate", slugMiddleware);

export const Videos = mongoose.model("Videos", videoSchema);

import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile: {
            type: String, //cloudinary url
            required: true
        },
        videoPublicId: {
            type: String, //cloudinary public_id
            required: true
        },
        thumbnail: {
            type: String, //cloudinary url
            required: true
        },
        thumbnailPublicId: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        duration: {
            type: Number,
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        
        // ========== PITCHVAULT FIELDS ==========
        companyName: {
            type: String,
            trim: true
        },
        founderEmail: {
            type: String,
            trim: true,
            lowercase: true
        },
        sector: {
            type: String,
            enum: [
                'AI / Machine Learning',
                'FinTech',
                'HealthTech',
                'EdTech',
                'E-Commerce',
                'SaaS',
                'CleanTech',
                'Consumer',
                'Enterprise',
                'Marketplace',
                'Other'
            ]
        },
        stage: {
            type: String,
            enum: ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Growth']
        },
        raisingAmount: {
            type: String,  // e.g., "$500K - $1M"
            trim: true
        },
        tagline: {
            type: String,
            maxlength: 150,
            trim: true
        },
        location: {
            type: String,
            trim: true
        },
        website: {
            type: String,
            trim: true
        },
        linkedIn: {
            type: String,
            trim: true
        },
        isFeatured: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)
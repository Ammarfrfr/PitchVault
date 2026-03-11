import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary, deleteFromCloudinary} from "../utils/cloudinary.js"
import { upload } from "../middlewares/multer.middleware.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId, sector, stage } = req.query

    const pageNumber = Number(page) 
    const limitNumber = Number(limit) 

    // filter to show only public videos
    const filter = {
      isPublished: true
    }

    // Filter by owner
    if (userId && isValidObjectId(userId)) {
      filter.owner = userId
    }

    // Filter by sector (PitchVault)
    if (sector && sector !== 'All') {
      filter.sector = sector
    }

    // Filter by stage (PitchVault)
    if (stage && stage !== 'All Stages') {
      filter.stage = stage
    }

    // Search by title, description, or company name
    if(query){
      filter.$or = [
        {title: { $regex: query, $options: 'i'}},
        {description: {$regex: query, $options: 'i'}},
        {companyName: {$regex: query, $options: 'i'}},
        {tagline: {$regex: query, $options: 'i'}}
      ]
    }

    let sortOptions = {}
    sortOptions[sortBy] = sortType === "asc"? 1 : -1;

    const totalVideos = await Video.countDocuments(filter)

    const videos = await Video.find(filter)
      .sort(sortOptions)
      .skip( (pageNumber - 1) * limitNumber )
      .limit(limitNumber)
      .populate("owner", "username fullName avatar userType companyName")

    return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          videos, pagination: {
            totalVideos,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalVideos / limitNumber),
            limit: limitNumber
          }
        },
        "Pitches fetched successfully",
      )
    )
    
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { 
      title, 
      description,
      // PitchVault fields
      companyName,
      founderEmail,
      sector,
      stage,
      raisingAmount,
      tagline,
      location,
      website,
      linkedIn
    } = req.body

    if(!title || !description){
      throw new ApiError(400, "Title and description are mandatory")
    }
    
    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if(!videoLocalPath){
      throw new ApiError(400, "Video File is missing")
    }

    if(!thumbnailLocalPath){
      throw new ApiError(400, "Thumbnail File is missing")
    }

    const video = await uploadOnCloudinary(videoLocalPath)
    console.log("Cloudinary response:", video);

    if(!video){
      throw new ApiError(400, "The Video failed to get uploaded")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if(!thumbnail){
      throw new ApiError(400, "The thumbnail wasnt able to get uploaded")
    }

    const publishedVideo = await Video.create({
      title,
      description,
      videoFile: video.url,
      thumbnail: thumbnail.url,
      thumbnailPublicId: thumbnail.public_id,
      videoPublicId: video.public_id,
      duration: video.duration,
      owner: req.user._id,
      // PitchVault fields
      companyName: companyName || undefined,
      founderEmail: founderEmail || req.user.email,
      sector: sector || undefined,
      stage: stage || undefined,
      raisingAmount: raisingAmount || undefined,
      tagline: tagline || undefined,
      location: location || undefined,
      website: website || undefined,
      linkedIn: linkedIn || undefined
    })

    return res
    .status(201)
    .json(
      new ApiResponse(201, publishedVideo, "Pitch published successfully")
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId)
      .populate("owner", "username fullName avatar email userType companyName")

    if(!video){
      throw new ApiError(404, "Pitch not found")
    }

    // Increment view count
    video.views = (video.views || 0) + 1
    await video.save({ validateBeforeSave: false })

    return res
    .status(200)
    .json(
      new ApiResponse(200, video, "Pitch fetched successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if(!videoId || !isValidObjectId(videoId)){
      throw new ApiError(400, "Valid Video ID is required")
    }

    let thumbnailUrl;
    let thumbnailPublicId;

    const {
      title, 
      description,
      companyName,
      founderEmail,
      sector,
      stage,
      raisingAmount,
      tagline,
      location,
      website,
      linkedIn
    } = req.body

    const thumbnailLocalPath = req.file?.path;
    if(thumbnailLocalPath){
      const uploadThumbnail = await uploadOnCloudinary(thumbnailLocalPath)
      if(!uploadThumbnail){
        throw new ApiError(500, "Thumbnail upload failed")
      }
      thumbnailUrl = uploadThumbnail.url
      thumbnailPublicId = uploadThumbnail.public_id
    }

    // Build update object dynamically
    const updateFields = {}
    if (title) updateFields.title = title
    if (description) updateFields.description = description
    if (thumbnailUrl) {
      updateFields.thumbnail = thumbnailUrl
      updateFields.thumbnailPublicId = thumbnailPublicId
    }
    // PitchVault fields
    if (companyName !== undefined) updateFields.companyName = companyName
    if (founderEmail !== undefined) updateFields.founderEmail = founderEmail
    if (sector !== undefined) updateFields.sector = sector
    if (stage !== undefined) updateFields.stage = stage
    if (raisingAmount !== undefined) updateFields.raisingAmount = raisingAmount
    if (tagline !== undefined) updateFields.tagline = tagline
    if (location !== undefined) updateFields.location = location
    if (website !== undefined) updateFields.website = website
    if (linkedIn !== undefined) updateFields.linkedIn = linkedIn

    if (Object.keys(updateFields).length === 0) {
      throw new ApiError(400, "At least one field is required to update")
    }

    const updateDetails = await Video.findByIdAndUpdate(
      videoId,
      { $set: updateFields },
      { new: true }
    ).populate("owner", "username fullName avatar")

    if(!updateDetails){
      throw new ApiError(404, "Pitch not found")
    }

    return res
    .status(200)
    .json(
      new ApiResponse(200, updateDetails, "Pitch updated successfully")
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!videoId){
      throw new ApiError(400, "Video id is not valid")
    }
    
    const video = await Video.findById(videoId)
    if(!video){
      throw new ApiError(400, "Video wasn't found")
    }
    

    // to delete from cloudinary
    if (video.videoPublicId) { // assuming you stored public_id when uploading
      await deleteFromCloudinary(video.videoPublicId, "video")
    }

    if(video.thumbnailPublicId){
      await deleteFromCloudinary(video.thumbnailPublicId, "image")
    }

    // deletes video from file
    const deletevideo = await Video.findByIdAndDelete(videoId)


    return res
    .status(200)
    .json(
      new ApiResponse(200, deletevideo, "Video deleted successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    // what is toggle publish status for in a video? 1. Published, but published what? Ans: Published means visible to everyone, Unpublished means only visible to owner
    // So how can i do this ? Ans: by a boolean field isPublished in video model which is true when published and false when unpublished
    // so first get the video by id, then toggle the isPublished field and save the video

    if(!videoId){
      throw new ApiError(400, "Video ID is required")
    }

    const video = await Video.findById(videoId)
    if(!video){
      throw new ApiError(404, "Video not found")
    }

    video.isPublished = !video.isPublished
    // what this does is if isPublished is true, it becomes false and if false, it becomes true
    await video.save()
    // why we will use select here 

    return res
    .status(200)
    .json(
      new ApiResponse(200, video, `Video is now ${video.isPublished ? "Published" : "Unpublished"}`)
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
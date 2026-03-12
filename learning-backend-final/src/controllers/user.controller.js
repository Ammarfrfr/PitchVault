import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import mongoose, { mongo } from "mongoose";

const generateRefreshAndAccessToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        if (!user) {
            throw new ApiError(404, "User not found while generating tokens")
        }
        // these are methods so () is needed
        const refreshToken = user.generateRefreshToken()
        const accessToken = user.generateAccessToken()

        // storing the token in db
        user.refreshToken = refreshToken
        // saving in db
        await user.save({ validateBeforeSave: false })

        // we need this so we return
        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar (optional now for PitchVault)
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    // receive user details from req.body
    const {
        fullName, 
        email, 
        username, 
        password,
        userType,        // 'founder' or 'investor'
        firmName,        // for investors
        investmentFocus, // for investors
        checkSize        // for investors
    } = req.body
    //console.log("email: ", email);

    // ========== SPECIFIC FIELD VALIDATION ==========
    if (!fullName || fullName.trim() === "") {
        throw new ApiError(400, "Full name is required")
    }
    if (!email || email.trim() === "") {
        throw new ApiError(400, "Email is required")
    }
    if (!username || username.trim() === "") {
        throw new ApiError(400, "Username is required")
    }
    if (!password) {
        throw new ApiError(400, "Password is required")
    }
    if (password.length < 8) {
        throw new ApiError(400, "Password must be at least 8 characters long")
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
        throw new ApiError(400, "Please enter a valid email address")
    }
    
    // Username validation (alphanumeric, no spaces)
    const usernameRegex = /^[a-zA-Z0-9_]+$/
    if (!usernameRegex.test(username.trim())) {
        throw new ApiError(400, "Username can only contain letters, numbers, and underscores")
    }
    if (username.trim().length < 3) {
        throw new ApiError(400, "Username must be at least 3 characters long")
    }

    // .findOne helps in finding using this syntax 
    // $or: this is used to check if either is true or some shit
    const existedUser = await User.findOne({
        $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }]
    })

    if (existedUser) {
        // Provide specific error for which field is taken
        if (existedUser.email.toLowerCase() === email.trim().toLowerCase()) {
            throw new ApiError(409, "An account with this email already exists")
        }
        if (existedUser.username.toLowerCase() === username.trim().toLowerCase()) {
            throw new ApiError(409, "This username is already taken")
        }
    }
    //console.log(req.files);

    // Avatar is now optional for PitchVault
    const avatarLocalPath = req.files?.avatar?.[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    // Upload to Cloudinary if files exist
    let avatar = null;
    let coverImage = null;
    
    if (avatarLocalPath) {
        avatar = await uploadOnCloudinary(avatarLocalPath)
    }
    if (coverImageLocalPath) {
        coverImage = await uploadOnCloudinary(coverImageLocalPath)
    }

    // Build user object
    const userData = {
        fullName,
        avatar: avatar?.url || "",
        coverImage: coverImage?.url || "",
        email: email.toLowerCase(), 
        password,
        username: username.toLowerCase(),
        userType: userType || 'founder'
    }

    // Add investor-specific fields if user is an investor
    if (userType === 'investor') {
        if (firmName) userData.firmName = firmName
        if (investmentFocus) userData.investmentFocus = investmentFocus
        if (checkSize) userData.checkSize = checkSize
    }

    const user = await User.create(userData)

    const createdUser = await User.findById(user._id).select(
        // .select("-password") this will like empty whatever to select here while initialising with -
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})

const loginUser = asyncHandler( async (req, res) => {
    // take your input from req body
    // trim the spaces if the user has typed it by mistake 
    // find the user if it exists or not
    // check username and password is correct
    // validate and generate access token
    // then generate refresh token so that your shit is saved
    // send these tokens using cookies

    const {email, username, password} = req.body
    console.log(email); 

    // ========== SPECIFIC VALIDATION ==========
    // require username OR email
    if (!username && !email) {
        throw new ApiError(400, "Please enter your email or username")
    }
    
    // require password
    if (!password) {
        throw new ApiError(400, "Please enter your password")
    }

    const user = await User.findOne({
        $or: [{username: username?.toLowerCase()}, {email: email?.toLowerCase()}]
    })

    if(!user){
        // User not found - but don't reveal if email/username exists for security
        throw new ApiError(401, "No account found with these credentials. Please check your email/username or create an account.")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Incorrect password. Please try again.")
    }

    const {accessToken, refreshToken} = await generateRefreshAndAccessToken(user._id)

    const loggedIn = await User.findById(user._id).select("-password -refreshToken")

    // this locks the cookie so it can only be changed on the server
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedIn, accessToken, refreshToken },
                "User logged in successfully"
            )
        )

})

const logOutUser = asyncHandler(async (req, res) => {
    // delete cookies
    // delete refreshToken

    /*
        had to do multiple shit to get the user Refrence, so we prepare middleware 
    */

    // 
    User.findByIdAndUpdate(
        await req.user._id,
        {   // sets refreshToken undefined so the user can logout 
            $unset: {refreshToken: undefined}
            // there is another way to unset {
            //  use unset to unset whatever you want to unset for example here refreshtoken need s to be unsetted to refreshToken: 1
            //}
        },
        {   // new values storing will be true
            new: true
        }
    )

    // no options
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
})

const refreshAccessToken = asyncHandler(async(req, res)=>{
    // get incoming refresh token
    // verify if it has by showing error

    // add below shit in tryAndCatch
    // verify the refreshToken with jwt and match it with the incoming refreshToken
    // after getting refreshToken and verifying it, get the user details using _id
    // couldnt find user, throw error
    // if refreshToken dosent match with the user, throw error
    // generate new accessToken and refreshToken with options
    // call generateAccessToken to get new tokens
    // return res with cookies and json response    

    // accessing incoming refreshToken from cookies and body by user to check with the generateAccessAndRefreshToken
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    // throw error
    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized Access")
    }

    // do this shit in try catch to not get the error without knowing
    try { 
        // verify token using its secret and jwt
        const deodedToken = jwt.verify(
            incomingRefreshToken,               // incoming token
            process.env.REFRESH_TOKEN_SECRET,   // secret token to verify
        )

        // find user from decoded token
        const user = await User.findById(decodedToken?._id)

        if(!user){
            throw new ApiError(401, "Invalid Refresh Token")
        }

        if(incomingRefreshToken != user?.refreshToken){
            throw new ApiError(401, "Refresh Token is expired")
        }   

        // options is for
        const options = {
            httpOnly: true,
            secure: true
        }

        // call this shit from generateRefreshAndAccessToken
        const {accessToken, newRefreshToken} = await generateRefreshAndAccessToken(user._id)

        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new ApiResponse(200, {newRefreshToken, accessToken}, "Access token refreshed successfully"))
    } catch (error) {
        throw new ApiError(401, error?.message || "Access Token Error")
    }
})

const changeCurrentPassword = 
asyncHandler( async (req, res) => {
    const {oldPassword, newPassword } = req.body
    
    // ========== SPECIFIC VALIDATION ==========
    if (!oldPassword) {
        throw new ApiError(400, "Please enter your current password")
    }
    if (!newPassword) {
        throw new ApiError(400, "Please enter a new password")
    }
    if (newPassword.length < 8) {
        throw new ApiError(400, "New password must be at least 8 characters long")
    }
    if (oldPassword === newPassword) {
        throw new ApiError(400, "New password must be different from your current password")
    }
    
    const user = await User.findById(req.user?._id)
    
    if (!user) {
        throw new ApiError(401, "User not found. Please log in again.")
    }
    
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(401, "Current password is incorrect. Please try again.")
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false})


    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password is Changed Successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body

    if(!fullName || !email){
        throw new ApiError(401, "Change atleast Full Name or Email to Apply changes")
    }
    
    const user = User.findByIdAndUpdate(
        req.user?._id, 
        {
            $set:{
                // two ways to write this shit
                fullName,
                email: email
            }
        }, 
        {new: true})
        .select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account Details Updated Successfully"))
})

const updateUserAvatar = asyncHandler(async (req, res) => { 

    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(401, "Wasnt able to able to find the local path of Avatar")
    }
    
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!(avatar.url)){
        throw new ApiError(401, "Error while uploading Avatar File")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    )
    .select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar is updated Successfully"))
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = await req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(401, "Cover Image is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage){
        throw new ApiError(401, "Cover Image wasn't updated")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image was updated Successfully"))
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const {username} = req.params
    // req.params is used to get dynamic routes like /:username or /:id (here dynamic means variable part of the route)

    if(!username?.trim()){
        throw new ApiError(400, "Username is required")
    }

    const channel = await User.aggregate([
        {
            // match is used to filter documents
            $match: {   
                username: username?.toLowerCase()
            }
        },
        {
            // lookup is used to join two collections
            $lookup: {
                from: "subscriptions",   // the database changes the first alphabet and makes it plural
                localField: "_id",          // field from User collection
                foreignField: "channel",    // field from Subscription collection
                as: "subscribers"           // name of the array field to be added to the User documents
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {   
            // addFields is used to add new fields to the document
            $addFields:{
                // name of the new field
                subscriberCount: {
                    // size is used to get the size of an array
                    $size: "$subscribers"       // size of the subscribers array
                },
                channelSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    // $cond is used to add conditional statements
                    $cond: {
                        // check if req.user._id is in the subscribers array
                        // here req.user?._id means that we are requesting user id from the request object if it exists 
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {   
            // project is used to select specific fields from the document and exclude others
            $project: {
                fullName: 1,
                email: 1,
                subscriberCount: 1,
                username: 1,
                isSubscribed: 1,
                channelSubscribedToCount: 1,
                avatar: 1,
                coverImage: 1
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(404, "Channel does not exists")
    }

    return res
    .status(200)
    .json(
        // here is channel[0] means the first element of the array which is user object
        new ApiResponse(200, channel[0], "Channel Fetched Successfully")
    )
})

const getUserWatchHistory = asyncHandler (async (req, res) => {
    const user = await User.aggregate([
        {
            $match:{
                // Find user by their ID
                _id: new mongoose.Types.ObjectId(req.user._id)
            },
        },
        {
            $lookup:{
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                // pipeline to lookup owner details that means we gitta do chain lookup
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [{
                                // In projects we can get fields which is in the users model
                                $project:{
                                    fullName: 1,
                                    avatar: 1,
                                    username: 1
                                }
                            }]
                        }
                    },
                    {
                        $addFields: {
                            // we add owner as single object instead of array
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200, user[0].watchHistory, "User watch history fetched successfully")
    )
})

export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getUserWatchHistory
}
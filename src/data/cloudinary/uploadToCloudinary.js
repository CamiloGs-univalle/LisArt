import axios from "axios"

export const uploadToCloudinary = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", uploadPreset)

    const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        formData
    )

    return response.data.secure_url
}
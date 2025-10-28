import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI as string

if (!MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local')
}

let isConnected = false

export const dbConnect = async () => {
  if (isConnected) return

  try {
    await mongoose.connect(MONGODB_URI)
    isConnected = true
    console.log('MongoDB Connected')
  } catch (error) {
    console.log('MongoDB connection error')
    throw error
  }
}

import mongoose from "mongoose"

const InvitationSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
  casa: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Casa",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 7 * 24 * 60 * 60, // La invitación expira en 7 días
  },
  used: {
    type: Boolean,
    default: false,
  },
})

export default mongoose.models.Invitation || mongoose.model("Invitation", InvitationSchema)


import mongoose from "mongoose";

const ConversationSchema = mongoose.Schema(
  {
    members: {
      type: Array,
    },
    more: {
      type: Object,
    },
    lastRead: {
      type: Map, 
      of: Date,
    },
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", ConversationSchema);

export default Conversation;

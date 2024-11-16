const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { createChat, accessChat, groupChat, fetchChats, addToGroup, removeFromGroup, deleteGroupChat } = require("../controllers/chatController");

router.post("/", protect, createChat);
router.route("/").get(protect, fetchChats);
router.route("/:chatId").get(protect, accessChat);
router.post("/group", protect, groupChat);
router.put("/groupadd", protect, addToGroup);
router.put("/groupremove", protect, removeFromGroup);
router.delete("/deletegroup", protect, deleteGroupChat);

module.exports = router;
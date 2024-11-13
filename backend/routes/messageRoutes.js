const express = require('express');
const router = express.Router();

const {sendMessage,deleteMessage, searchMessage, allMessages, viewLinks, approveLinks, discardLinks} = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/').post(protect, sendMessage);
router.route('/delete').delete(protect, deleteMessage);
router.route('/search/:chatId/:keyword').get(searchMessage);
router.route('/fetch/:chatId').get(protect, allMessages);
router.route('/viewLinks/:chatId').get(protect, viewLinks);
router.route('/approveLinks/:chatId/:messageId').get(protect, approveLinks);
router.route('/discardLinks/:chatId/:messageId').get(protect, discardLinks);
module.exports = router;
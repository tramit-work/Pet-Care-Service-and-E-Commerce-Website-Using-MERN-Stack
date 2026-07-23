const express = require('express');
const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const { HTTP_STATUS } = require('../constants');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const mongoStateMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'PetCare System API đang hoạt động',
      timestamp: new Date().toISOString(),
      mongo: mongoStateMap[mongoose.connection.readyState] || 'unknown',
    });
  })
);

module.exports = router;

const NOTIFICATION_TYPE = {
  ORDER_CREATED: 'order_created',
  ORDER_STATUS: 'order_status',
  BOOKING_CREATED: 'booking_created',
  BOOKING_STATUS: 'booking_status',
};

const NOTIFICATION_TYPE_VALUES = Object.values(NOTIFICATION_TYPE);

module.exports = { NOTIFICATION_TYPE, NOTIFICATION_TYPE_VALUES };

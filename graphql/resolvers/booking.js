const { dateToString } = require('../../helpers/date');
const Event = require('../../models/event');
const Booking = require('../../models/booking');
const { transformBooking, transformEvent } = require('./utils/merge');

module.exports = {
  // Bookings
  bookings: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const bookings = await Booking.find({ user: req.userId });
      return bookings.map((booking) => {
        return transformBooking(booking);
      });
    } catch (err) {
      console.error(err);
    }
  },

  bookEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const fetchedEvent = await Event.findOne({ _id: args.eventId });
      const booking = new Booking({
        user: '61482a8828fee753e10e3ae0',
        event: fetchedEvent,
      });

      // console.log(booking);

      const result = await booking.save();

      return transformBooking(result);
    } catch (error) {
      console.log(error);
    }
  },
  cancelBooking: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    try {
      const booking = await Booking.findById(args.bookingId).populate('event');
      const event = transformEvent(booking.event);
      await Booking.deleteOne({ _id: args.bookingId });
      return event;
    } catch (error) {}
  },
};

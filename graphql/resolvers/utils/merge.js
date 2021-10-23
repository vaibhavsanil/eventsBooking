const DataLoader = require('dataloader');

const Event = require('../../../models/event');
const User = require('../../../models/user');

const { dateToString } = require('../../../helpers/date');
const { events } = require('../../../models/event');

const eventLoader = new DataLoader((eventIds) => {
  return eventsFunc(eventIds);
});

const userLoader = new DataLoader((userIds) => {
  return User.find({ _id: { $in: userIds } });
});

const user = async (userId) => {
  //   console.log('The id is ', userId);
  // return User.findById(userId)

  try {
    const user = await userLoader.load(userId.toString());
    return {
      ...user._doc,
      _id: user.id,
      createdEvents: eventLoader.load.bind(this, user._doc.createdEvents),
    };
  } catch (error) {
    throw new Error(error);
  }
};

const eventsFunc = (eventIds) => {
  //   console.log(`The value of events in eventsFunc \n ${eventIds}`);
  return Event.find({ _id: { $in: eventIds } })
    .then((events) => {
      return events.map((event) => {
        return {
          ...event._doc,
          _id: event.id,
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, event.creator),
        };
      });
    })
    .catch((err) => console.log(err));
};

const singleEvent = async (eventId) => {
  try {
    const event = await eventLoader.load(eventId);
    return transformEvent(event);
  } catch (error) {}
};

const transformEvent = (event) => {
  console.log('From transform event merge js', event);
  return {
    ...event._doc,
    _id: event.id,
    date: dateToString(event._doc.date),
    creator: user.bind(this, event.creator),
  };
};

const transformBooking = (booking) => {
  return {
    ...booking._doc,
    _id: booking.id,
    user: userLoader.load.bind(this, booking._doc.user),
    event: singleEvent.bind(this, booking._doc.event),
    createdAt: new Date(booking._doc.createdAt).toISOString(),
    updatedAt: new Date(booking._doc.updatedAt).toISOString(),
  };
};

exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;

// exports.user = user;
// exports.eventsFunc = eventsFunc;
// exports.singleEvent = singleEvent;
// exports.transformEvent = transformEvent;

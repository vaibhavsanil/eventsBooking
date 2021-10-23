import React from 'react';

import EventItem from './EventsList/EventItem';

import './EventList.css';

function EventList(props) {
  const events = props.events.map((event) => {
    // console.log(
    //   `From Events page \n ${JSON.stringify(event)} \n ${JSON.stringify(
    //     props
    //   )}}`
    // );
    return (
      <EventItem
        userId={props.authuserId}
        price={event.price}
        key={event._id}
        eventId={event._id}
        date={event.date}
        title={event.title}
        creatorId={event.creator._id}
        onDetail={props.onViewDetails}
      />
    );
  });

  return <ul className="event__list">{events}</ul>;
}

export default EventList;

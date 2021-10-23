import React, { Component } from 'react';
import Modal from '../components/Modals/Modal';
import Backdrop from '../components/backdrop/Backdrop';
import AuthContext from '../context/auth-context';
import EventsInfo from '../components/Events/EventList';
import './Events.css';

class EventsPage extends Component {
  state = {
    creating: false,
    events: [],
    isLoading: false,
    selectedEvent: null,
  };

  isActive = true;

  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.titleElRef = React.createRef();
    this.priceElRef = React.createRef();
    this.dateElRef = React.createRef();
    this.descriptionElRef = React.createRef();
  }

  createEventHandler = () => {
    this.setState({ creating: true });
  };

  modalConfirmHandler = () => {
    this.setState({ creating: false });
    const title = this.titleElRef.current.value;
    const price = parseFloat(this.priceElRef.current.value);
    const date = this.dateElRef.current.value;
    const description = this.descriptionElRef.current.value;

    if (
      title.trim().length === 0 ||
      price <= 0 ||
      date.trim().length === 0 ||
      description.trim() === 0
    ) {
      return;
    }

    const event = { title, price, date, description };

    console.log(event);

    const reqeustBody = {
      query: `

        mutation {
        createEvent(eventInput: {title:"${title}",description:"${description}",price:${price},date:"${date}"}){
          _id
          title
          description
          date
          price
         
        }
      }

      `,
    };
    const token = this.context.token;

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(reqeustBody),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed!');
        }
        return res.json();
      })
      .then((resData) => {
        // if (resData.data.login.token) {
        //   this.context.login(
        //     resData.data.login.token,
        //     resData.data.login.userId,
        //     resData.data.login.tokenExpiration
        //   );
        // }
        this.setState((prevState) => {
          const updatedEvents = [...prevState.events];
          updatedEvents.push({
            _id: this.context.userId,
            title: resData.data.createEvent.title,
            description: resData.data.createEvent.description,
            date: resData.data.createEvent.date,
            price: resData.data.createEvent.price,
            creator: {
              _id: this.context.userId,
            },
          });

          return { events: updatedEvents };
        });
      })
      .catch((err) => {
        console.log(err);
      });

    // console.log(email, password);
  };

  modalCancelHandler = () => {
    this.setState({ creating: false, selectedEvent: null });
  };

  fetchEvents = () => {
    this.setState({ isLoading: true });
    const reqeustBody = {
      query: `
        query {
        events{
          _id
          title
          description
          date
          price
          creator {
            _id
            email
          }
        }
      }

      `,
    };

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(reqeustBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed!');
        }
        return res.json();
      })
      .then((resData) => {
        const events = resData.data.events;

        // if (this.isActive) {
        //   this.setState({ events: events, isLoading: false });
        // }
        this.setState({ events: events, isLoading: false });
      })
      .catch((err) => {
        console.log(err);
        // if (this.isActive) {
        //   this.setState({ isLoading: false });
        // }
        this.setState({ isLoading: false });
      });
  };

  componentDidMount() {
    this.fetchEvents();
  }

  showDetailHandler = (eventId) => {
    this.setState((prevState) => {
      const selectedEvent = prevState.events.find((e) => e._id === eventId);
      return { selectedEvent: selectedEvent };
    });
  };

  bookEventHandler = () => {
    if (!this.context.token) {
      this.setState({ selectedEvent: null });
      return;
    }
    const reqeustBody = {
      query: `
        mutation {
        bookEvent(eventId:"${this.state.selectedEvent._id}"){
         _id
         createdAt
         updatedAt
        }
      }

      `,
    };

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(reqeustBody),
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.context.token,
      },
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed!');
        }
        return res.json();
      })
      .then((resData) => {
        console.log(resData);
        this.setState({ selectedEvent: null });
      })
      .catch((err) => {
        console.log(err);
        this.setState({ isLoading: false });
      });
  };

  componentWillMount() {
    this.isActive = false;
  }

  render() {
    // const eventsList = this.state.events.map((event) => {
    //   return (

    //   );
    // });

    // console.log(
    //   `From Events Page the context value is \n ${JSON.stringify(this.context)}`
    // );
    return (
      <>
        {(this.state.creating || this.state.selectedEvent) && <Backdrop />}
        {this.state.creating && (
          <Modal
            title="Add Event"
            canCancel
            canConfirm
            onCancel={this.modalCancelHandler}
            onConfirm={this.modalConfirmHandler}
            confirmText="Confirm"
          >
            <form>
              <div className="form-control">
                <label htmlFor="title">Title</label>
                <input type="text" id="title" ref={this.titleElRef} />
              </div>
              <div className="form-control">
                <label htmlFor="price">Price</label>
                <input type="number" id="price" ref={this.priceElRef} />
              </div>
              <div className="form-control">
                <label htmlFor="date">Date</label>
                <input type="datetime-local" id="date" ref={this.dateElRef} />
              </div>
              <div className="form-control">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  rows="4"
                  ref={this.descriptionElRef}
                />
              </div>
            </form>
          </Modal>
        )}

        {this.state.selectedEvent && (
          <Modal
            title={this.state.selectedEvent.title}
            canCancel
            canConfirm
            onCancel={this.modalCancelHandler}
            onConfirm={this.bookEventHandler}
            confirmText={this.context.token ? 'Book' : 'Confirm'}
          >
            <h1>{this.state.selectedEvent.title}</h1>
            <h2>
              ${this.state.selectedEvent.price} -{' '}
              {new Date(this.state.selectedEvent.date).toLocaleDateString()}
            </h2>
            <p>{this.state.selectedEvent.description}</p>
          </Modal>
        )}

        {this.context.token && (
          <div className="events-control">
            <p>Share Your Own Events!</p>
            <button className="btn" onClick={this.createEventHandler}>
              Create Event
            </button>
          </div>
        )}
        {this.state.isLoading ? (
          <p>Loading...</p>
        ) : (
          <EventsInfo
            events={this.state.events}
            authUserId={this.context.userId}
            onViewDetails={this.showDetailHandler}
          />
        )}
      </>
    );
  }
}

export default EventsPage;

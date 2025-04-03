import { LightningElement, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getCities from '@salesforce/apex/BookingController.getCities';
import getMoviesByCity from '@salesforce/apex/BookingController.getMoviesByCity';
import getTheatresByMovie from '@salesforce/apex/BookingController.getTheatresByMovie';
import getShowtimesByTheatreAndMovie from '@salesforce/apex/BookingController.getShowtimesByTheatreAndMovie';
import createBooking from '@salesforce/apex/BookingController.createBooking';
import getBookingDate from '@salesforce/apex/BookingController.getBookingDate';
import searchMovies from '@salesforce/apex/MovieSearchController.searchMovies';

import styles from './movieBooking.css';

export default class MovieBooking extends LightningElement {
    @track isBookingSuccessful = false;
    @track cityOptions = [];
    @track movieOptions = [];
    @track theatreOptions = [];
    @track showtimeOptions = [];
    @track customerName = '';
    selectedCity = '';
    selectedMovie = '';
    selectedTheatre = '';
    selectedMovieName = '';
    selectedCityName = '';

    //for fetching booking details
    movieData = null;
    bookingDate_b;
    customerName_b;
    movieName_b;
    numberOfSeats_b;
    showTime_b;
    theaterName_b;
    totalPrice_b;

    @wire(getCities)
    wiredCities({ error, data }) {
        if (data) {
            this.cityOptions = data.map(city => ({ label: city.Name, value: city.Id }));
        } else if (error) {
            this.showToast('Error', 'Failed to retrieve cities: ' + error.body.message, 'error');
        }
    }

    handleCustomerNameChange(event) {
        this.customerName = event.target.value;
    }

    handleCityChange(event) {
        this.selectedCity = event.detail.value;
        this.selectedCityName = this.cityOptions.find(city => city.value === this.selectedCity)?.label;
        getMoviesByCity({ cityId: this.selectedCity })
            .then(result => {
                this.movieOptions = result.map(movie => ({ label: movie.Name, value: movie.Id }));
                this.selectedMovie = null;
                this.selectedMovieName = '';
                this.theatreOptions = [];
                this.showtimeOptions = [];
            })
            .catch(error => {
                this.showToast('Error', 'Failed to retrieve movies: ' + error.body.message, 'error');
            });
    }

    handleMovieChange(event) {
        this.selectedMovie = event.detail.value;
        this.selectedMovieName = this.movieOptions.find(movie => movie.value === this.selectedMovie)?.label;
        getTheatresByMovie({ movieId: this.selectedMovie, cityId: this.selectedCity })
            .then(result => {
                this.theatreOptions = result.map(theatre => ({ label: theatre.Name, value: theatre.Id }));
                this.selectedTheatre = null;
                this.showtimeOptions = [];
            })
            .catch(error => {
                this.showToast('Error', 'Failed to retrieve theatres: ' + error.body.message, 'error');
            });
    }

    handleTheatreChange(event) {
        this.selectedTheatre = event.detail.value;
        getShowtimesByTheatreAndMovie({ TheaterId: this.selectedTheatre, movieId: this.selectedMovie })
            .then(result => {
                this.showtimeOptions = result.map(showtime => {
                    // console.log(showtime.ShowTiming__c);
                    // Given timestamp in UTC
                    const utcTimestamp =showtime.ShowTiming__c;
                    console.log('UTC: '+ utcTimestamp);

                    // Create a Date object from the UTC timestamp
                    const date = new Date(utcTimestamp);
                    console.log('DATE: '+ date);

                    // // Convert to IST timezone
                    const istDate = date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

                    console.log('IST: '+ istDate);

                    return {
                        label: istDate,
                        value: showtime.Id,
                        availableSeats: showtime.Available_Seats__c,
                        ticketPrice: showtime.Ticket_Price__c,
                        numberOfSeats: 1
                    };   
                });
            })
            .catch(error => {
                this.showToast('Error', 'Failed to retrieve showtimes: ' + error.body.message, 'error');
            });
    }

    handleShowtimeClick(event) {
        // No need to handle this event since we're displaying the booking form in the same tile
    }

    handleSeatsChange(event) {
        const showtimeId = event.currentTarget.dataset.showtimeId;
        const numberOfSeats = parseInt(event.detail.value, 10) || 1;
        this.showtimeOptions = this.showtimeOptions.map(showtime => {
            if (showtime.value === showtimeId) {
                return { ...showtime, numberOfSeats };
            }
            return showtime;
        });
    }

    handleBooking(event) {
        const showtimeId = event.currentTarget.dataset.showtimeId;
        const showtime = this.showtimeOptions.find(showtime => showtime.value === showtimeId);
        if (showtime.numberOfSeats > 0 && showtime.numberOfSeats <= showtime.availableSeats && this.customerName) {
            createBooking({
                showtimeId: showtime.value,
                numberOfSeats: showtime.numberOfSeats,
                movieName: this.selectedMovieName,
                theatreName: this.theatreOptions.find(theatre => theatre.value === this.selectedTheatre)?.label,
                customerName: this.customerName,
                cityName: this.selectedCityName // Pass the selectedCityName value
            })
            .then(result => {
                this.showToast('Success', 'Booking successful!', 'success');
                // Optionally reset component state here
                //this.resetComponentState();
                this.isBookingSuccessful = true;

                // this.bookingDate_b = new Date(result.BookingDate__c);
                this.bookingDate_b = result.BookingDate__c;
                console.log('booking date: ',result.Id);
                // const bookingId = result.Id;
                getBookingDate({ bookingId: result.Id})
                .then(bookingRecord => {
                    console.log('Booking Date:', bookingRecord.BookingDate__c);
                    // Do something with the bookingDate
                    this.bookingDate_b = bookingRecord.BookingDate__c;
                    console.log('moviename', this.selectedMovieName);
                    if (this.selectedMovieName){

                    
                    searchMovies({ searchText: this.selectedMovieName })
                    .then((movieresult) => {
                        this.movieData = JSON.parse(movieresult);
                        console.log('Movie Data:', this.movieData.Poster);
                    })
                    .catch((error) => {
                        console.error('Poster Error:', error);
                        // Handle error
                    });}
                })
                .catch(error => {
                    console.error('Error fetching booking date:', error);
                });

                
                this.customerName_b = result.Customer_Name__c;
                this.movieName_b = result.Movie_Name__c;
                this.numberOfSeats_b = result.NumberOfSeats__c;
                // this.showTime_b = result.ShowTime__c.ShowTiming__c; 
                // console.log(this.showTime_b);
                this.showTime_b = showtime.label;
                this.theaterName_b = result.TheaterName__c;
                this.totalPrice_b = result.Total_Price__c;
                
            })
            .catch(error => {
                this.showToast('Error', 'Error in booking: ' + error.body.message, 'error');
            });
        } else {
            this.showToast('Error', 'Please fill all required fields and ensure the number of seats is greater than zero and less than or equal to the available seats.', 'error');
        }
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        }));
    }
}
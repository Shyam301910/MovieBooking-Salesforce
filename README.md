# Movie Booking Application

This is a Salesforce Lightning Web Components (LWC) project for a movie booking application. The application allows users to search for movies, select cities, theaters, and showtimes, and book tickets.

## Features

- **Movie Search**: Search for movies using the OMDB API.
- **City Selection**: Choose a city to view available movies.
- **Theater and Showtime Selection**: Select theaters and showtimes for a chosen movie.
- **Booking Confirmation**: Displays booking details and movie poster after successful booking.

## Components

### 1. **Movie Search**
- **Files**:
  - [movieSearch.js](force-app/main/default/lwc/movieSearch/movieSearch.js)
  - [movieSearch.html](force-app/main/default/lwc/movieSearch/movieSearch.html)
- **Description**: Allows users to search for movies using the OMDB API and displays movie details.

### 2. **Movie Booking**
- **Files**:
  - [movieBooking.js](force-app/main/default/lwc/movieBooking/movieBooking.js)
  - [movieBooking.html](force-app/main/default/lwc/movieBooking/movieBooking.html)
- **Description**: Enables users to select cities, movies, theaters, and showtimes, and book tickets.

### 3. **Apex Controllers**
- **Files**:
  - [MovieSearchController.cls](force-app/main/default/classes/MovieSearchController.cls): Handles movie search using the OMDB API.
  - [BookingController.cls](force-app/main/default/classes/BookingController.cls): Manages city, movie, theater, and booking data.

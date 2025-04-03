public with sharing class BookingController {
    // Method to fetch cities
    @AuraEnabled(cacheable=true)
    public static List<City__c> getCities() {
        return [SELECT Id, Name FROM City__c ORDER BY Name];
    }

    // Method to fetch movies available in a specific city
    @AuraEnabled(cacheable=true)
    public static List<Movie__c> getMoviesByCity(String cityId) {
        return [SELECT Id, Name FROM Movie__c WHERE City__c = :cityId ORDER BY Name];
    }

    // Method to fetch theaters that are available for a given movie in a specific city
    @AuraEnabled(cacheable=true)
    public static List<Theater__c> getTheatresByMovie(String movieId, String cityId) {
        return [
            SELECT Id, Name
            FROM Theater__c
            WHERE Id IN (SELECT Theater__c FROM ShowTime__c WHERE Movie__c = :movieId)
            AND City__c = :cityId
            ORDER BY Name
        ];
    }

    // Method to fetch showtimes for a specific movie at a specific theater
    @AuraEnabled(cacheable=true)
    public static List<ShowTime__c> getShowtimesByTheatreAndMovie(String TheaterId, String movieId) {
        return [
            SELECT Id, FORMAT(ShowTiming__c), Available_Seats__c, Ticket_Price__c
            FROM ShowTime__c
            WHERE Theater__c = :TheaterId
            AND Movie__c = :movieId
            ORDER BY ShowTiming__c
        ];
    }
    

    // Method to create a booking for a given showtime, number of seats, and additional details
    @AuraEnabled
    public static Booking__c createBooking(
        String showtimeId,
        Integer numberOfSeats,
        String movieName,
        String theatreName,
        String customerName,
        String cityName // Added cityName parameter
    ) {
        ShowTime__c showtime = [
            SELECT Id, Available_Seats__c, Ticket_Price__c
            FROM ShowTime__c
            WHERE Id = :showtimeId
        ];

        if (showtime.Available_Seats__c >= numberOfSeats) {
            Booking__c booking = new Booking__c();
            booking.ShowTime__c = showtimeId;
            booking.NumberOfSeats__c = numberOfSeats;
            booking.Movie_Name__c = movieName;
            booking.TheaterName__c = theatreName;
            booking.Customer_Name__c = customerName;
            booking.Total_Price__c = numberOfSeats * showtime.Ticket_Price__c;
            booking.MovieCity__c = cityName; // Assign cityName to MovieCity__c field
            
            // Update available seats
            showtime.Available_Seats__c -= numberOfSeats;

            update showtime; // Update available seats
            insert booking;
            return booking;
        } else {
            throw new AuraHandledException('Insufficient available seats.');
        }
    }

    @AuraEnabled(cacheable=true)
    public static Booking__c getBookingDate(String bookingId) {
        System.debug('bookingId: '+bookingId);
        return [SELECT BookingDate__c FROM Booking__c WHERE Id = :bookingId];
    }
}
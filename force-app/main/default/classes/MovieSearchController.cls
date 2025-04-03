public with sharing class MovieSearchController {
    @AuraEnabled(cacheable=true)
    public static String searchMovies(String searchText) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://www.omdbapi.com/?t=' + searchText + '&apikey=e4a111b3');
        request.setMethod('GET');
        HttpResponse response = http.send(request);
        if (response.getStatusCode() == 200) {
            return response.getBody();
        } else {
            throw new AuraHandledException('Failed to fetch data: ' + response.getStatus());
        }
    }
}
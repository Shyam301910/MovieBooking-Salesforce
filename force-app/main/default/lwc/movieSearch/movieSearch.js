import { LightningElement, track } from 'lwc';
import searchMovies from '@salesforce/apex/MovieSearchController.searchMovies';

export default class MovieSearch extends LightningElement {
    @track searchText = '';
    @track movieData = null;
    @track isSearching = false;

    handleSearchChange(event) {
        this.searchText = event.target.value;
    }

    searchMovies() {
        if (this.searchText) {
            this.isSearching = true;
            searchMovies({ searchText: this.searchText })
                .then((result) => {
                    this.movieData = JSON.parse(result);
                })
                .catch((error) => {
                    console.error('Error:', error);
                    // Handle error
                })
                .finally(() => {
                    this.isSearching = false;
                });
        }
    }
}
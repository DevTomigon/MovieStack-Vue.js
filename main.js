const url = "https://moviestack.onrender.com/api/movies";
const apiKey = "0ff70d54-dc0b-4262-9c3d-776cb0f34dbd";
const options = {
    headers: {
        "x-api-key": apiKey
    }
};

const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            movies: [],
            genres: [],
            search: "",
            selected: "all",
            moviesFiltered: [],
            selectedMovie: null,
            movieId: "",
            loader: false,
            favorites: [],
            isFavsPage: false,
        };
    },
    beforeCreate() {
        fetch(url, options)
            .then(res => res.json())
            .then(data => {
                this.movies = data.movies;
                this.genres = [...new Set(this.movies.flatMap(movie => movie.genres))];
                this.movieId = new URLSearchParams(window.location.search).get("id");
                this.selectedMovie = this.movies.find(movie => movie.id == this.movieId);

                // Verifica si estamos en la página de favoritas antes de actualizar moviesFiltered
                this.isFavsPage = window.location.pathname.includes("favoritas.html");
                
                // Solo actualiza moviesFiltered si estamos en favoritas.html
                if (this.isFavsPage) {
                    this.updateFilteredMovies();
                } else {
                    // Muestra todas las películas al cargar la página movies
                    this.moviesFiltered = this.movies;
                }

                this.loader = true;
            })
            .catch(error => console.error(error));
    },
    methods: {
        guardarSearch(event) {
            this.search = event.target.value;
            this.filtrar();
        },
        guardarSelect(event) {
            this.selected = event.target.value;
            this.filtrar();
        },
        filtrar() {
            const aux = this.movies.filter(movie => 
                movie.title.toLowerCase().includes(this.search.toLowerCase()) &&
                (this.selected == "all" || movie.genres.includes(this.selected))
            );
            this.moviesFiltered = aux;
        },
        addToFavorites(movieId) {
            const favorites = this.getFavoriteMovies();
            if (Array.isArray(favorites) && !favorites.includes(movieId)) {
                favorites.push(movieId);
                this.saveFavoriteMovies(favorites);
                console.log('Película añadida correctamente a favoritos');

                if (this.isFavsPage) {
                    this.updateFilteredMovies();
                }
            }
        },
        updateFilteredMovies() {
            const favoriteMovies = this.getFavoriteMovies();
            // Muestra solo la película marcada como favorita en favoritas.html
            this.moviesFiltered = this.movies.filter(movie => favoriteMovies.includes(movie.id));
        },
        removeFromFavorites(movieId) {
            const favorites = this.getFavoriteMovies();
            const updatedFavorites = favorites.filter(id => id !== movieId);
            this.saveFavoriteMovies(updatedFavorites);

            if (this.isFavsPage) {
                this.updateFilteredMovies();
            }
        },
        saveFavoriteMovies(favorites) {
            localStorage.setItem('favoriteMovies', JSON.stringify(favorites));
        },
        getFavoriteMovies() {
            const favorites = localStorage.getItem('favoriteMovies');
            return favorites ? JSON.parse(favorites) : [];
        },
    },
});

app.mount("#app");

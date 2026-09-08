// ========================================
// DONAC
// Favorites
// ========================================


// ========================================
// 1. GET FAVORITES
// ========================================

function getFavorites() {

    const savedFavorites =
        localStorage.getItem(
            "donacFavorites"
        );


    if (!savedFavorites) {
        return [];
    }


    return JSON.parse(savedFavorites);

}



// ========================================
// 2. SAVE FAVORITES
// ========================================

function saveFavorites(favorites) {

    localStorage.setItem(
        "donacFavorites",
        JSON.stringify(favorites)
    );

}



// ========================================
// 3. CHECK FAVORITE
// ========================================

function isFavorite(cocktailId) {

    const favorites =
        getFavorites();


    return favorites.includes(
        cocktailId
    );

}



// ========================================
// 4. TOGGLE FAVORITE
// ========================================

function toggleFavorite(cocktailId) {

    let favorites =
        getFavorites();


    if (
        favorites.includes(
            cocktailId
        )
    ) {

        favorites =
            favorites.filter(
                id => id !== cocktailId
            );

    }
    else {

        favorites.push(
            cocktailId
        );

    }


    saveFavorites(favorites);


    updateFavoriteButtons();

}



// ========================================
// 5. UPDATE HEART BUTTONS
// ========================================

function updateFavoriteButtons() {

    const buttons =
        document.querySelectorAll(
            "[data-favorite-id]"
        );


    buttons.forEach(button => {

        const cocktailId =
            button.dataset.favoriteId;


        if (
            isFavorite(cocktailId)
        ) {

            button.classList.add(
                "is-favorite"
            );

            button.textContent = "♥";

        }
        else {

            button.classList.remove(
                "is-favorite"
            );

            button.textContent = "♡";

        }

    });

}
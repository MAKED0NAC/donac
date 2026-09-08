// ========================================
// DONAC
// Home page JavaScript
// ========================================


// ========================================
// 1. LOAD COCKTAIL DATA
// ========================================

async function loadCocktails() {

    try {

        // Učitavamo cocktails.json
        const response = await fetch("data/cocktails.json");


        // Provera da li je JSON uspešno učitan
        if (!response.ok) {

            throw new Error(
                "Could not load cocktails.json"
            );

        }


        // Pretvaramo JSON u JavaScript podatke
        const cocktails = await response.json();


        // Prikazujemo Cocktail of the Day
        displayFeaturedCocktail(cocktails);


        // Prikazujemo Popular cocktails
        displayPopularCocktails(cocktails);


        // Prikazujemo Vodka based cocktails
        displayVodkaCocktails(cocktails);


        // Proveravamo koji cocktails su već favorites
        // i ažuriramo izgled svih srca
        updateFavoriteButtons();

    }
    catch (error) {

        console.error(
            "Error loading cocktails:",
            error
        );

    }

}



// ========================================
// 2. COCKTAIL OF THE DAY
// ========================================

function displayFeaturedCocktail(cocktails) {

    const container =
        document.getElementById(
            "featured-cocktail"
        );


    // Tražimo cocktail koji ima featured: true
    const cocktail =
        cocktails.find(
            cocktail =>
                cocktail.featured === true
        );


    // Ako nema featured cocktail-a
    if (!cocktail) {

        container.innerHTML = `
            <p>
                No featured cocktail available.
            </p>
        `;

        return;

    }


    // Pravimo veliku cocktail karticu
    container.innerHTML = `

        <article
            class="featured-card"
            onclick="openCocktail('${cocktail.id}')"
        >

            <img
                src="${cocktail.image}"
                alt="${cocktail.name}"
                class="featured-image"
            >


            <div class="featured-overlay">


                <div>

                    <h2>
                        ${cocktail.name}
                    </h2>

                    <p>
                        ${cocktail.difficulty}
                        ·
                        ${cocktail.time} min
                    </p>

                </div>


                <button
                    class="favorite-button"
                    data-favorite-id="${cocktail.id}"
                    onclick="
                        event.stopPropagation();
                        toggleFavorite('${cocktail.id}');
                    "
                    aria-label="Add ${cocktail.name} to favorites"
                >
                    ♡
                </button>


            </div>

        </article>

    `;

}



// ========================================
// 3. POPULAR COCKTAILS
// ========================================

function displayPopularCocktails(cocktails) {

    const container =
        document.getElementById(
            "popular-cocktails"
        );


    // Uzimamo popular cocktails,
    // ali NE prikazujemo featured cocktail ponovo
    const popularCocktails =
        cocktails.filter(
            cocktail =>
                cocktail.popular === true &&
                cocktail.featured !== true
        );


    // Prikazujemo prva 2
    container.innerHTML =
        popularCocktails
            .slice(0, 2)
            .map(createCocktailCard)
            .join("");

}



// ========================================
// 4. VODKA BASED COCKTAILS
// ========================================

function displayVodkaCocktails(cocktails) {

    const container =
        document.getElementById(
            "vodka-cocktails"
        );


    // Tražimo cocktails kojima je
    // category = vodka
    const vodkaCocktails =
        cocktails.filter(
            cocktail =>
                cocktail.category === "vodka"
        );


    // Prikazujemo prva 2
    container.innerHTML =
        vodkaCocktails
            .slice(0, 2)
            .map(createCocktailCard)
            .join("");

}



// ========================================
// 5. CREATE SMALL COCKTAIL CARD
// ========================================

function createCocktailCard(cocktail) {

    return `

        <article
            class="cocktail-card"
            onclick="openCocktail('${cocktail.id}')"
        >


            <img
                src="${cocktail.image}"
                alt="${cocktail.name}"
            >


            <div class="cocktail-card-overlay">


                <div>

                    <h3>
                        ${cocktail.name}
                    </h3>

                    <p>
                        ${cocktail.difficulty}
                        ·
                        ${cocktail.time} min
                    </p>

                </div>


                <button
                    class="favorite-button small"
                    data-favorite-id="${cocktail.id}"
                    onclick="
                        event.stopPropagation();
                        toggleFavorite('${cocktail.id}');
                    "
                    aria-label="Add ${cocktail.name} to favorites"
                >
                    ♡
                </button>


            </div>

        </article>

    `;

}



// ========================================
// 6. OPEN COCKTAIL DETAILS
// ========================================

function openCocktail(id) {

    window.location.href =
        `cocktail.html?id=${id}`;

}



// ========================================
// 7. START APP
// ========================================

// Kada se app.js učita,
// pokrećemo učitavanje cocktails.json

loadCocktails();



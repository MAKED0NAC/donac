// ========================================
// DONAC
// Cocktail details page
// ========================================


// ========================================
// 1. LOAD COCKTAIL
// ========================================

async function loadCocktailDetails() {

    try {

        const response =
            await fetch("data/cocktails.json");


        if (!response.ok) {

            throw new Error(
                "Could not load cocktails.json"
            );

        }


        const cocktails =
            await response.json();


        // Čitamo ?id= iz URL-a
        const params =
            new URLSearchParams(
                window.location.search
            );


        const cocktailId =
            params.get("id");


        // Tražimo odgovarajući cocktail
        const cocktail =
            cocktails.find(
                cocktail =>
                    cocktail.id === cocktailId
            );


        // Ako cocktail nije pronađen
        if (!cocktail) {

            displayCocktailNotFound();

            return;

        }


        // Prikaz cocktail-a
        displayCocktail(cocktail);

    }
    catch (error) {

        console.error(
            "Error loading cocktail:",
            error
        );

    }

}



// ========================================
// 2. DISPLAY COCKTAIL
// ========================================

function displayCocktail(cocktail) {

    const container =
        document.getElementById(
            "cocktail-details"
        );


    // Sastojci
    const ingredientsHTML =
        cocktail.ingredients
            .map(ingredient => {

                return `
                    <div class="ingredient-row">

                        <span class="ingredient-name">
                            ${ingredient.name}
                        </span>

                        <span class="ingredient-amount">
                            ${ingredient.amount}
                        </span>

                    </div>
                `;

            })
            .join("");


    // Method steps
    const methodHTML =
        cocktail.method
            .map((step, index) => {

                return `
                    <div class="method-step">

                        <span class="step-number">
                            ${index + 1}
                        </span>

                        <p>
                            ${step}
                        </p>

                    </div>
                `;

            })
            .join("");


    container.innerHTML = `

        <section class="cocktail-hero">

            <img
                src="${cocktail.image}"
                alt="${cocktail.name}"
                class="cocktail-hero-image"
            >


            <div class="cocktail-hero-overlay">

                <div>

                    <h1>
                        ${cocktail.name}
                    </h1>

                    <p>
                        ${cocktail.difficulty}
                        ·
                        ${cocktail.time} min
                    </p>

                </div>


            <button
                class="favorite-button"
                data-favorite-id="${cocktail.id}"
                onclick="toggleFavorite('${cocktail.id}')"
                aria-label="Add ${cocktail.name} to favorites"
                >
                    ♡
            </button>

            </div>

        </section>


        <section class="cocktail-info">

    <p class="cocktail-description">
        ${cocktail.description}
    </p>


    <div class="cocktail-meta-row">

        <span class="info-label">
            Glass
        </span>

        <strong>
            ${cocktail.glass}
        </strong>

    </div>


    <div class="cocktail-meta-row">

        <span class="info-label">
            Garnish
        </span>

        <strong>
            ${cocktail.garnish}
        </strong>

    </div>

</section>


        <section class="recipe-section">


            <div class="recipe-tabs">

                <button
                    class="recipe-tab active"
                    data-tab="ingredients"
                >
                    Ingredients
                </button>

                <button
                    class="recipe-tab"
                    data-tab="method"
                >
                    Method
                </button>

            </div>


            <div
                class="recipe-content active"
                id="ingredients-content"
            >

                ${ingredientsHTML}

            </div>


            <div
                class="recipe-content"
                id="method-content"
            >

                ${methodHTML}

            </div>


        </section>

    `;


    setupTabs();
    
    updateFavoriteButtons();

}



// ========================================
// 3. TABS
// ========================================

function setupTabs() {

    const tabs =
        document.querySelectorAll(
            ".recipe-tab"
        );


    tabs.forEach(tab => {

        tab.addEventListener(
            "click",
            () => {

                const selectedTab =
                    tab.dataset.tab;


                // skidamo active sa svih tabova
                document
                    .querySelectorAll(
                        ".recipe-tab"
                    )
                    .forEach(button => {

                        button.classList.remove(
                            "active"
                        );

                    });


                // aktivni tab
                tab.classList.add(
                    "active"
                );


                // sakrivamo sav content
                document
                    .querySelectorAll(
                        ".recipe-content"
                    )
                    .forEach(content => {

                        content.classList.remove(
                            "active"
                        );

                    });


                // prikazujemo izabrani content
                document
                    .getElementById(
                        `${selectedTab}-content`
                    )
                    .classList.add(
                        "active"
                    );

            }
        );

    });

}



// ========================================
// 4. NOT FOUND
// ========================================

function displayCocktailNotFound() {

    const container =
        document.getElementById(
            "cocktail-details"
        );


    container.innerHTML = `

        <div class="not-found">

            <h1>
                Cocktail not found
            </h1>

            <p>
                This cocktail does not exist.
            </p>

            <a href="index.html">
                Back to Home
            </a>

        </div>

    `;

}



// ========================================
// 5. START
// ========================================

loadCocktailDetails();
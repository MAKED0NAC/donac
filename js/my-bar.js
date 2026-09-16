// ========================================
// DONAC
// My Bar page
// ========================================


let allCocktails = [];


// ========================================
// INGREDIENT NORMALIZATION
// ========================================

function normalizeIngredientName(name) {

    const normalized =
        name
            .trim()
            .toLowerCase();


    const aliases = {

        // JUICES
        "lime juice": "lime juice",
        "lemon juice": "lemon juice",
        "orange juice": "orange juice",
        "pineapple juice": "pineapple juice",
        "cranberry juice": "cranberry juice",
        "grapefruit juice": "grapefruit juice",

        // SYRUPS
        "sugar syrup": "simple syrup",
        "simple syrup": "simple syrup",

        // SODA
        "soda water": "soda water",
        "club soda": "soda water",
        "carbonated water": "soda water",

        // RUM
        "light rum": "white rum",
        "white rum": "white rum",

        // VERMOUTH
        "sweet vermouth": "sweet vermouth",
        "dry vermouth": "dry vermouth",

        // LIQUEURS
        "maraschino liqueur": "maraschino liqueur",

        // BITTERS
        "angostura bitters": "angostura bitters",

        // OTHER
        "egg white": "egg white",
        "ginger beer": "ginger beer"

    };


    return aliases[normalized] || normalized;

}



// ========================================
// 1. LOAD MY BAR
// ========================================

async function loadMyBar() {

    try {

        const response =
            await fetch(
                "data/cocktails.json"
            );


        if (!response.ok) {

            throw new Error(
                "Could not load cocktails.json"
            );

        }


        allCocktails =
            await response.json();


        displayFavorites(
            allCocktails
        );


        displayIngredientOptions(
            allCocktails
        );


        displayMakeResults(
            allCocktails
        );


        setupMyBarTabs();

    }
    catch (error) {

        console.error(
            "Error loading My Bar:",
            error
        );

    }

}



// ========================================
// 2. DISPLAY FAVORITES
// ========================================

function displayFavorites(cocktails) {

    const grid =
        document.getElementById(
            "favorites-grid"
        );


    const emptyState =
        document.getElementById(
            "favorites-empty"
        );


    const favorites =
        getFavorites();


    const favoriteCocktails =
        cocktails.filter(
            cocktail =>
                favorites.includes(
                    cocktail.id
                )
        );


    if (
        favoriteCocktails.length === 0
    ) {

        grid.innerHTML = "";

        emptyState.classList.add(
            "active"
        );

        return;

    }


    emptyState.classList.remove(
        "active"
    );


    grid.innerHTML =
        favoriteCocktails
            .map(createFavoriteCard)
            .join("");


    updateFavoriteButtons();

}



// ========================================
// 3. CREATE FAVORITE CARD
// ========================================

function createFavoriteCard(cocktail) {

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
                        removeFavoriteFromMyBar('${cocktail.id}');
                    "
                    aria-label="Remove ${cocktail.name} from favorites"
                >
                    ♥
                </button>

            </div>

        </article>

    `;

}



// ========================================
// 4. REMOVE FAVORITE
// ========================================

function removeFavoriteFromMyBar(
    cocktailId
) {

    toggleFavorite(
        cocktailId
    );


    const cards =
        document.querySelectorAll(
            "#favorites-grid .cocktail-card"
        );


    cards.forEach(card => {

        const button =
            card.querySelector(
                "[data-favorite-id]"
            );


        if (
            button &&
            button.dataset.favoriteId ===
            cocktailId
        ) {

            card.remove();

        }

    });


    checkEmptyFavorites();

}



// ========================================
// 5. CHECK EMPTY FAVORITES
// ========================================

function checkEmptyFavorites() {

    const grid =
        document.getElementById(
            "favorites-grid"
        );


    const emptyState =
        document.getElementById(
            "favorites-empty"
        );


    const cards =
        grid.querySelectorAll(
            ".cocktail-card"
        );


    if (
        cards.length === 0
    ) {

        emptyState.classList.add(
            "active"
        );

    }

}



// ========================================
// 6. GET MY INGREDIENTS
// ========================================

function getMyIngredients() {

    const savedIngredients =
        localStorage.getItem(
            "donacIngredients"
        );


    if (!savedIngredients) {

        return [];

    }


    try {

        const ingredients =
            JSON.parse(
                savedIngredients
            );


        if (!Array.isArray(ingredients)) {

            return [];

        }


        return [
            ...new Set(
                ingredients.map(
                    normalizeIngredientName
                )
            )
        ];

    }
    catch (error) {

        console.error(
            "Could not read saved ingredients:",
            error
        );

        return [];

    }

}



// ========================================
// 7. SAVE MY INGREDIENTS
// ========================================

function saveMyIngredients(
    ingredients
) {

    const normalizedIngredients =
        [
            ...new Set(
                ingredients.map(
                    normalizeIngredientName
                )
            )
        ];


    localStorage.setItem(
        "donacIngredients",
        JSON.stringify(
            normalizedIngredients
        )
    );

}



// ========================================
// 8. DISPLAY INGREDIENT OPTIONS
// ========================================

function displayIngredientOptions(
    cocktails
) {

    const container =
        document.getElementById(
            "ingredients-list"
        );


    const ingredientMap =
        new Map();


    cocktails.forEach(cocktail => {

        cocktail.ingredients.forEach(
            ingredient => {

                const normalizedName =
                    normalizeIngredientName(
                        ingredient.name
                    );


                if (
                    !ingredientMap.has(
                        normalizedName
                    )
                ) {

                    ingredientMap.set(
                        normalizedName,
                        ingredient.name
                    );

                }

            }
        );

    });


    const uniqueIngredients =
        [...ingredientMap.keys()]
            .sort();


    const savedIngredients =
        getMyIngredients();


    container.innerHTML =
        uniqueIngredients
            .map(ingredient => {

                const isSelected =
                    savedIngredients.includes(
                        ingredient
                    );


                const displayName =
                    ingredientMap.get(
                        ingredient
                    );


                return `

                    <button
                        class="ingredient-chip ${
                            isSelected
                                ? "selected"
                                : ""
                        }"
                        data-ingredient="${ingredient}"
                        onclick="
                            toggleIngredient('${ingredient}')
                        "
                    >
                        ${displayName}
                    </button>

                `;

            })
            .join("");


    updateIngredientCount();

}



// ========================================
// 9. TOGGLE INGREDIENT
// ========================================

function toggleIngredient(
    ingredient
) {

    const normalizedIngredient =
        normalizeIngredientName(
            ingredient
        );


    let ingredients =
        getMyIngredients();


    if (
        ingredients.includes(
            normalizedIngredient
        )
    ) {

        ingredients =
            ingredients.filter(
                item =>
                    item !==
                    normalizedIngredient
            );

    }
    else {

        ingredients.push(
            normalizedIngredient
        );

    }


    saveMyIngredients(
        ingredients
    );


    updateIngredientButtons();

    updateIngredientCount();

    displayMakeResults(
        allCocktails
    );

}



// ========================================
// 10. UPDATE INGREDIENT BUTTONS
// ========================================

function updateIngredientButtons() {

    const savedIngredients =
        getMyIngredients();


    const buttons =
        document.querySelectorAll(
            ".ingredient-chip"
        );


    buttons.forEach(button => {

        const ingredient =
            normalizeIngredientName(
                button.dataset.ingredient
            );


        if (
            savedIngredients.includes(
                ingredient
            )
        ) {

            button.classList.add(
                "selected"
            );

        }
        else {

            button.classList.remove(
                "selected"
            );

        }

    });

}



// ========================================
// 11. UPDATE INGREDIENT COUNT
// ========================================

function updateIngredientCount() {

    const count =
        getMyIngredients().length;


    const counter =
        document.getElementById(
            "ingredient-count"
        );


    counter.textContent =
        `${count} selected`;

}



// ========================================
// 12. CLEAR INGREDIENTS
// ========================================

function clearIngredients() {

    saveMyIngredients([]);


    updateIngredientButtons();

    updateIngredientCount();

    displayMakeResults(
        allCocktails
    );

}



// ========================================
// 13. DISPLAY MAKE RESULTS
// ========================================

function displayMakeResults(
    cocktails
) {

    const selectedIngredients =
        getMyIngredients();


    const canMakeGrid =
        document.getElementById(
            "can-make-grid"
        );


    const almostMakeGrid =
        document.getElementById(
            "almost-make-grid"
        );


    const canMakeEmpty =
        document.getElementById(
            "can-make-empty"
        );


    const canMake = [];

    const almostMake = [];


    cocktails.forEach(
        cocktail => {

            const cocktailIngredients =
                cocktail.ingredients.map(
                    ingredient => ({
                        original:
                            ingredient.name,

                        normalized:
                            normalizeIngredientName(
                                ingredient.name
                            )
                    })
                );


            // Remove duplicate ingredients after
            // normalization.
            const uniqueCocktailIngredients =
                cocktailIngredients.filter(
                    (
                        ingredient,
                        index,
                        array
                    ) =>

                        array.findIndex(
                            item =>
                                item.normalized ===
                                ingredient.normalized
                        ) === index
                );


            const missingIngredients =
                uniqueCocktailIngredients.filter(
                    ingredient =>

                        !selectedIngredients.includes(
                            ingredient.normalized
                        )
                );


            if (
                missingIngredients.length === 0
            ) {

                canMake.push(
                    cocktail
                );

            }
            else if (
                missingIngredients.length === 1
            ) {

                almostMake.push({

                    cocktail:
                        cocktail,

                    missingIngredient:
                        missingIngredients[0]
                            .original

                });

            }

        }
    );


    // CAN MAKE

    if (
        canMake.length === 0
    ) {

        canMakeGrid.innerHTML = "";

        canMakeEmpty.style.display =
            "block";

    }
    else {

        canMakeEmpty.style.display =
            "none";


        canMakeGrid.innerHTML =
            canMake
                .map(
                    createResultCard
                )
                .join("");

    }


    // MISSING ONE INGREDIENT

    almostMakeGrid.innerHTML =
        almostMake
            .map(item =>

                createAlmostCard(
                    item.cocktail,
                    item.missingIngredient
                )

            )
            .join("");

}



// ========================================
// 14. CREATE RESULT CARD
// ========================================

function createResultCard(
    cocktail
) {

    return `

        <article
            class="cocktail-card result-card"
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

                    <p class="can-make-label">
                        ✓ You can make this
                    </p>

                </div>

            </div>

        </article>

    `;

}



// ========================================
// 15. CREATE ALMOST CARD
// ========================================

function createAlmostCard(
    cocktail,
    missingIngredient
) {

    return `

        <article
            class="cocktail-card result-card"
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

                    <p class="missing-label">
                        Missing:
                        ${missingIngredient}
                    </p>

                </div>

            </div>

        </article>

    `;

}



// ========================================
// 16. MY BAR TABS
// ========================================

function setupMyBarTabs() {

    const tabs =
        document.querySelectorAll(
            ".my-bar-tab"
        );


    tabs.forEach(tab => {

        tab.addEventListener(
            "click",
            () => {

                const selectedTab =
                    tab.dataset.tab;


                document
                    .querySelectorAll(
                        ".my-bar-tab"
                    )
                    .forEach(button => {

                        button.classList.remove(
                            "active"
                        );

                    });


                tab.classList.add(
                    "active"
                );


                document
                    .querySelectorAll(
                        ".my-bar-content"
                    )
                    .forEach(content => {

                        content.classList.remove(
                            "active"
                        );

                    });


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
// 17. OPEN COCKTAIL
// ========================================

function openCocktail(id) {

    window.location.href =
        `cocktail.html?id=${id}`;

}



// ========================================
// 18. START
// ========================================

loadMyBar();
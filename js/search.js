// ========================================
// DONAC
// Search page
// ========================================


let allCocktails = [];

let activeCategory = "all";


// ========================================
// 1. LOAD COCKTAILS
// ========================================

async function loadSearchPage() {

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


        createCategoryFilters(
            allCocktails
        );


        displaySearchResults(
            allCocktails
        );


        setupSearchInput();

    }
    catch (error) {

        console.error(
            "Error loading Search page:",
            error
        );

    }

}



// ========================================
// 2. CREATE CATEGORY FILTERS
// ========================================

function createCategoryFilters(
    cocktails
) {

    const container =
        document.getElementById(
            "filter-list"
        );


    const categories =
        cocktails.map(
            cocktail =>
                cocktail.category
        );


    const uniqueCategories =
        [...new Set(categories)]
            .sort();


    const allCategories = [
        "all",
        ...uniqueCategories
    ];


    container.innerHTML =
        allCategories
            .map(category => {

                const label =
                    category === "all"
                        ? "All"
                        : capitalizeWord(
                            category
                        );


                return `

                    <button
                        class="filter-button ${
                            category ===
                            activeCategory
                                ? "active"
                                : ""
                        }"
                        data-category="${category}"
                        onclick="
                            selectCategory('${category}')
                        "
                    >
                        ${label}
                    </button>

                `;

            })
            .join("");

}



// ========================================
// 3. SELECT CATEGORY
// ========================================

function selectCategory(
    category
) {

    activeCategory =
        category;


    updateFilterButtons();

    filterCocktails();

}



// ========================================
// 4. UPDATE FILTER BUTTONS
// ========================================

function updateFilterButtons() {

    const buttons =
        document.querySelectorAll(
            ".filter-button"
        );


    buttons.forEach(button => {

        const category =
            button.dataset.category;


        if (
            category ===
            activeCategory
        ) {

            button.classList.add(
                "active"
            );

        }
        else {

            button.classList.remove(
                "active"
            );

        }

    });

}



// ========================================
// 5. SEARCH INPUT
// ========================================

function setupSearchInput() {

    const input =
        document.getElementById(
            "search-input"
        );


    input.addEventListener(
        "input",
        filterCocktails
    );

}



// ========================================
// 6. FILTER COCKTAILS
// ========================================

function filterCocktails() {

    const input =
        document.getElementById(
            "search-input"
        );


    const searchText =
        input.value
            .trim()
            .toLowerCase();


    const filteredCocktails =
        allCocktails.filter(
            cocktail => {

                const searchableText = [
                     cocktail.name,
                     cocktail.category,
                     cocktail.description,
                     ...cocktail.tags,
                     ...cocktail.ingredients.map(
                        ingredient =>
                        ingredient.name
                    )
                    ]
                  .join(" ")
                 .toLowerCase();


const matchesSearch =
    searchableText.includes(
        searchText
    );


                const matchesCategory =
                    activeCategory ===
                        "all" ||
                    cocktail.category ===
                        activeCategory;


                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );


    displaySearchResults(
        filteredCocktails
    );

}



// ========================================
// 7. DISPLAY SEARCH RESULTS
// ========================================

function displaySearchResults(
    cocktails
) {

    const grid =
        document.getElementById(
            "search-results"
        );


    const emptyState =
        document.getElementById(
            "search-empty"
        );


    const counter =
        document.getElementById(
            "results-count"
        );


    counter.textContent =
        `${cocktails.length} ${
            cocktails.length === 1
                ? "result"
                : "results"
        }`;


    if (
        cocktails.length === 0
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
        cocktails
            .map(createSearchCard)
            .join("");


    updateFavoriteButtons();

}



// ========================================
// 8. CREATE SEARCH CARD
// ========================================

function createSearchCard(
    cocktail
) {

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
                        ${capitalizeWord(
                            cocktail.category
                        )}
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
// 9. CAPITALIZE WORD
// ========================================

function capitalizeWord(
    word
) {

    return (
        word.charAt(0)
            .toUpperCase() +
        word.slice(1)
    );

}



// ========================================
// 10. OPEN COCKTAIL
// ========================================

function openCocktail(id) {

    window.location.href =
        `cocktail.html?id=${id}`;

}



// ========================================
// 11. START
// ========================================

loadSearchPage();
// MVP:
//
// Query user input to determine which word to search
// Error handling for missing words
// Fetch dictionary and thesaurus APIs from Merriam-Webster website
// Access definition and synonyms from JSON object
// Populate the results section with definition and synonyms
//
// Stretch Goals:
//
// Add an image of word searched from appropriate API
// Create small scrolling gallery of available images
// Offer audible definition when available

const app = {};

// getting the results from the API Call

app.getDesiredWord = function () {
	// Selecting the form element
	app.form = document.querySelector("form");

	// Adding the event listener to the submit button
	app.form.addEventListener("submit", function (event) {
		event.preventDefault();
		app.desiredWord = document.getElementById("search").value;
		// console.log(app.desiredWord);
		if (app.desiredWord === "") {
			Swal.fire({
				title: "Please search for a word and try again!",
				showClass: {
					popup: "animate__animated animate__fadeInDown",
				},
				hideClass: {
					popup: "animate__animated animate__fadeOutUp",
				},
				icon: "error",
				iconColor: "#b55656",
				confirmButtonColor: "#b55656"
			});
		}

		app.getResult();
		app.form.reset();
	});
};

app.getResult = function () {
	// Calling API for defination array
	app.dictKey = "a9cac565-bc55-4024-9e9a-7f276804fe69";
	app.dictURL = new URL(
		`https://www.dictionaryapi.com/api/v3/references/collegiate/json/${app.desiredWord}?key=${app.dictKey}`
	);

	// Calling API for Thesaurus array
	app.thesaurusKey = "fb667759-bffa-458e-99cc-52ad3a241442";
	app.thesaurusURL = new URL(
		`https://www.dictionaryapi.com/api/v3/references/thesaurus/json/${app.desiredWord}?key=${app.thesaurusKey}`
	);

	// Calling API for Image Array
	app.imageKey = "ZszcTbGp8p_fudEWMdnRe90mPPyhfueWD_g4dy24bDE";
	app.imageUrl = new URL(`https://api.unsplash.com/search/photos`);

	const url = new URL(app.imageUrl);
	url.search = new URLSearchParams({
		client_id: app.imageKey,
		query: `${app.desiredWord}`,
		per_page: 3,
	});

	fetch(app.dictURL)
		.then(function (res) {
			return res.json();
		})
		.then(function (jsonResult) {
			if (jsonResult[0].meta === undefined) {
				Swal.fire({
					title: "We could not find that word, try searching for another!",
					showClass: {
						popup: "animate__animated animate__fadeInDown",
					},
					hideClass: {
						popup: "animate__animated animate__fadeOutUp",
					},
					icon: "error",
					iconColor: "#b55656",
					confirmButtonColor: "#b55656",
				});
			}
			app.definitions = [];
			for (let i = 0; i < jsonResult.length; i++) {
				// Regular expression (RegExp) search to capture appropriate defitinitons using target meta.id with ":" followed by any digit from 0-9

				// Example: this returns the first 2 entries from the array of definitions for the word "world" but ignores any other definitions in the array that contain "world" in the meta.id
				app.regexSearch = new RegExp(`${app.desiredWord}:\d*?`);

				// If there exists a word with more than one definition of the literal match of the word itself, return all those definitions (Example: "fly")
				if (jsonResult[i].meta.id.match(app.regexSearch)) {
					app.definitions.push(jsonResult[i]);
				}

				// Else, return the sole definition (Example: "apple")
				else if (jsonResult[i].meta.id === app.desiredWord) {
					app.definitions.push(jsonResult[i]);
				}
			}
			// console.log(app.definitions);
			// }
		})
		.then(function () {
			fetch(app.thesaurusURL)
				.then(function (res) {
					return res.json();
				})
				.then(function (jsonResult) {
					app.synonyms = [];

					// Error handling for words that return array with similarly spelled words instead of literal synonyms
					if (typeof jsonResult[0] == "string") {
						app.synonyms.push(
							`${capitalize(
								app.desiredWord
							)} has no known synonyms to display.`
						);
					} else {
						for (let i = 0; i < jsonResult.length; i++) {
							// Regular expression (RegExp) search to capture appropriate defitinitons using target meta.id with ":" followed by any digit from 0-9

							if (jsonResult[i].meta.id.match(app.regexSearch)) {
								app.synonyms.push(jsonResult);
							} else if (
								jsonResult[i].meta.id === app.desiredWord
							) {
								app.synonyms.push(jsonResult[i].shortdef[0]);
							}
						}

						// Error handling for words with no relevant synonyms
						if (app.synonyms.length === 0) {
							app.synonyms.push(
								`${capitalize(
									app.desiredWord
								)} has no known synonyms to display.`
							);
						}
						// console.log(app.synonyms);
					}
				})
				.then(function () {
					fetch(url)
						.then(function (res) {
							return res.json();
						})
						.then(function (jsonResult) {
							app.images = jsonResult.results;
							// console.log(app.images);
							app.displayResult(
								app.definitions,
								app.synonyms,
								app.images
							);
						});
				});
		});
};

// Displaying the resullts on the page
app.displayResult = function (definitionArray, synonymsArray, imageArray) {
	// Creating an array with the definitions of the word to display to screen

	app.desiredWordHeader = document.querySelector(".desiredWord");
	// Added the line below to clear the header element when repeating a search
	app.desiredWordHeader.innerHTML = "";
	const createH2 = document.createElement("h2");
	createH2.innerHTML = capitalize(app.desiredWord);
	app.desiredWordHeader.appendChild(createH2);

	// Adding the aduio to the desired word

	// Match the first letter of the word
	const subdirectory = app.desiredWord.charAt(0);
	//  Match the Id of the word to the  audio sound
	const audioID = app.definitions[0].hwi.prs[0].sound.audio;
	app.audioUrl = `https://media.merriam-webster.com/audio/prons/en/us/mp3/${subdirectory}/${audioID}.mp3`;

	const audioButton = document.createElement("button");
	audioButton.innerHTML = '<i class="fas fa-volume-up"></i>';

	audioButton.addEventListener("click", function () {
		const audio = new Audio(app.audioUrl);
		audio.play();
	});
	app.desiredWordHeader.appendChild(audioButton);

	// Add event listener to play audio file from URL

	// displaying the class resultd on page load

	const results = document.querySelector(".results");
	results.style.display = "block";

	//   Adding h3 heading for the definitions
	const definitionsSection = document.querySelector(".defH3");
	definitionsSection.style.display = "block";

	const definitionsList = document.querySelector(".definitionsList");

	//   Adding h3 heading for the synonyms
	const synonymsSection = document.querySelector(".synH3");
	synonymsSection.style.display = "block";

	const synonymsList = document.querySelector(".synonymsList");

	definitionsList.innerHTML = "";
	synonymsList.innerHTML = "";

	for (let i = 0; i < definitionArray.length; i++) {
		let liEl = document.createElement("li");
		liEl.innerHTML = capitalize(`${definitionArray[i].shortdef}`);
		definitionsList.appendChild(liEl);
	}

	// Add line break between definitions and synonyms

	for (let i = 0; i < synonymsArray.length; i++) {
		let liEl = document.createElement("li");
		liEl.innerHTML = capitalize(`${synonymsArray[i]}`);
		synonymsList.appendChild(liEl);
	}

	// Selecting the the ul from the Index.html to display the image result on the page

	const imageslist = document.querySelector(".imageGallery");
	imageslist.innerHTML = "";

	for (let i = 0; i < imageArray.length; i++) {
		let liEl = document.createElement("li");
		liEl.innerHTML = `<img src="${imageArray[i].urls.small}" alt="${imageArray[i].alt_description}">`;
		imageslist.appendChild(liEl);
	}
};

// Helper Functions

// To capitalize strings
function capitalize(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

// Kicking off
app.init = function () {
	// calling the get result
	app.getDesiredWord();
};

// Calling init function
app.init();

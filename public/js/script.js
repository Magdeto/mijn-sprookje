let hero = "";
let villain = "";
let genre = "";
let storyContext = "";
let userChoice = "";


//--------------- Functions to check if all selections are made and then generate the image and text ----------- //
function checkAndGenerateImage() {
  if (hero && villain && genre) {
    
    // console.log("Generated prompt:", prompt);

    generateImage(); // Call the function to generate the image
  }
}

function checkAndGenerateText() {
  if (hero && villain && genre) {
    const textPrompt = `
    Write a short, engaging, and age-appropriate story, no longer than 50 words. 
    The story must feature:
    1. A main protagonist who is a ${hero}.
    2. An antagonist represented by a ${villain}.
    3. Themes, tone, and elements that align with the ${genre} genre.
    The story should immediately begin with a captivating narrative, avoiding introductions, meta-comments, or disclaimers. Ensure the story is suitable for children, with a simple yet imaginative plot that encourages creativity and engagement. Should not be longer than 30 words. The story should stop when commencement reached and leaving the reader with a cliff-hanger.
    `;

    // console.log("Generated prompt:", textPrompt);

    generateText(textPrompt); // Call the function to generate the text
  }
}

// ------------------------  Add an event listener to the parent container --------------------- //
document.getElementById("button-container").addEventListener("click", (event) => {
  // Check if the clicked element is a button
  const button = event.target;
  if (button.tagName === "BUTTON") {
    // Get the category (hero, villain, genre) and value from the button's attributes
    const category = button.getAttribute("data-category");
    const value = button.getAttribute("data-value");

    // Update the corresponding variable based on the category
    if (category === "hero") {
      hero = value;
      console.log("Hero:", hero);
    } else if (category === "villain") {
      villain = value;
      console.log("Villain:", villain);
    } else if (category === "genre") {
      genre = value;
      console.log("Genre:", genre);
    }

    // Check if all selections are made and execute the generation of text and image
    checkAndGenerateImage();
    checkAndGenerateText();
  }
});


// ---------------------------------------- Function to generate text ----------------------------------//
async function generateText(prompt) {
  try {
    const response = await fetch('/generate-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();

    if (data.text) {

      // console.log('Generated Text:', data.text);

      // Uses ternary operator to update the story context. If there is no context, it uses the generated text as a context
      storyContext = storyContext ? `${storyContext} ${data.text}` : data.text;

      // Display the text and generate images
      displayText(data.text);

      //Predefined image prompt based on the text generated
      const imagePrompt = `Generate two images based on this context ${data.text}. Create a vibrant and animated 2D illustration suitable for children. The second image should include elements of mystery such as darken sky or gloomy atmosphere. Do not put any text on the images.`

      generateImage(imagePrompt, ["imageContainer1", "imageContainer2"]);

    } else {
      console.error('Error fetching text:', data.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

//  ----------------------------  Function to generate two images based on the text -------------------- //
async function generateImage(prompt, containerIds) {
  try {
    const response = await fetch("/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();
    // iterates and creates a image container 
    if (response.ok) {
      containerIds.forEach((containerId, index) => {
        const imageContainer = document.getElementById(containerId);

        // Append new image
        const imgElem = document.createElement("img");
        imgElem.src = data.images[index];
        imgElem.style.width = "300px";
        imageContainer.appendChild(imgElem);
      });
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// ----------------------------------------  Function to display the text ------------------------------- //
function displayText(text) {
  const textContainer = document.getElementById("output-container");
  
  // Create a paragraph element
  const textElement = document.createElement("p");
  textElement.textContent = text;

  // Append to the output container
  textContainer.appendChild(textElement);

  // Display demo feature for choices after the text
  displayChoices();
}

// --------------------------------- Function to display demo choices feature ------------------------------ //
function displayChoices() {
  const choicesContainer = document.getElementById("choices-container");
  
  const choices = [
    "Continue the story by introducing a magical forest.",
    "Add a mysterious traveler who tells a secret."
  ];
  // iterates through the choices and creates a button for each item of the array //
  choices.forEach((choiceText) => {
    const choiceButton = document.createElement("button");
    choiceButton.textContent = choiceText;
    choiceButton.onclick = () => handleChoice(choiceText);
    choicesContainer.appendChild(choiceButton);
  });
}

// --------------------------------- Function to handle user choice ------------------------------- //
function handleChoice(choice) {
  userChoice = choice;

  // console.log("User Choice:", userChoice);

  const continuationPrompt = `
    Continue the story including ${userChoice}, based on the provided context, ensuring seamless integration and by including a denouement in the story narrative. Present the continuation immediatelly without summarizing the current context. The text should be no longer than 30 words. Here is the context: ${storyContext}.
  `;

  // Generate the continuation text and display it
  generateContinuation(continuationPrompt);
}

// ------------------------- Function to generate and display the continuation text ------------------------ //
async function generateContinuation(prompt) {
  try {
    const response = await fetch('/generate-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();

    if (data.text) {

      // console.log('Continuation Text:', data.text);

      // Update the story context
      storyContext += ` ${data.text}`;

      // Display the continuation text
      const continuationContainer = document.getElementById("continuation-container");
      const textElement = document.createElement("p");
      textElement.textContent = data.text;
      continuationContainer.appendChild(textElement);
    } else {
      console.error('Error fetching continuation:', data.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
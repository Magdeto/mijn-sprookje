document.addEventListener("DOMContentLoaded", function () {
    const characterSection = document.querySelector(".character-section");
    const talkButton = document.querySelector(".talk-button");
    const micText = document.getElementById("mic-text");

    // Function to make the character speak by fetching audio from the back-end
    async function makeCharacterSpeak(text) {
        try {
            characterSection.classList.remove("hidden");

            // Send a request to the back-end text-to-speech endpoint
            const response = await fetch('/ai/textToAudio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }), // Send the text to be converted to audio
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            // Get the audio as a blob and create a URL for it
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            // Play the audio
            const audio = new Audio(audioUrl);
            audio.play();

            // Show the microphone button after the audio finishes playing
            audio.onended = showMicrophoneButton;
        } catch (error) {
            console.error("Error making character speak:", error);
        }
    }

    function showMicrophoneButton() {
        talkButton.style.display = "block";
        micText.style.display = "block";
    }

    // Add the event listener for the button
    const button = document.querySelector('.talk-button .talk-btn');
    if (button) {
        button.addEventListener('click', function() {
            console.log('Button clicked');
            makeCharacterSpeak("Hello! I am ready to talk. Press the button to start.");
        });
    } else {
        console.error('Button not found');
    }
});
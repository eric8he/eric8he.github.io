document.getElementById("openmax-upload").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Gather form data, including the file
    const formData = new FormData(this);

    // Send a POST request with fetch
    fetch("http://35.193.160.193:80", {
        method: "POST",
        body: formData // Send the FormData object directly
    })
    .then(response => {
        if (!response.ok) {
            console.log(response);
        throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Parse the JSON response
    })
    .then(data => {
        console.log("Response received:", data); // Log the JSON response to the console
    })
    .catch(error => {
        console.error("Error:", error); // Log any errors
    });
});

imgImp = document.getElementById('imgInp');
imgInp.onchange = evt => {
    const [file] = imgInp.files;
    if (file) {
        document.getElementById("openmax-image").src = URL.createObjectURL(file);
        document.getElementById("openmax-image").hidden = false;
        document.getElementById("openmax-filename").textContent = file.name;
    }
}
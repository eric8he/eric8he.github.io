const ClassificationTable = ({ vals }) => {
    if (!vals || !Array.isArray(vals)) {
        return null; // Return nothing if vals is not provided or not an array
    }


    const redToGreenHex = (percent) => {
        // Clamp the input to be between 0 and 100
        percent = Math.min(100, Math.max(0, percent));
        const proportion = Math.log(percent + 1)/Math.log(100);
        
        // Calculate the red and green values based on the percentage
        const red = Math.floor(255 * (1 - proportion));
        const green = Math.floor(255 * proportion);
        
        // Convert the RGB values to a hex string
        const redHex = red.toString(16).padStart(2, '0');
        const greenHex = green.toString(16).padStart(2, '0');
        
        return `#${redHex}${greenHex}00`;
    }

    const formatConfidence = (value) => {
        const num = Number(value);
        return isNaN(num) ? value : num.toFixed(5);
    };

    const renderTable = (data) => (
        <table className="itable">
            <thead>
                <tr>
                    <th>Class</th>
                    <th>Conf</th>
                </tr>
            </thead>
            <tbody>
                {data.map((val, index) => (
                    <tr key={index} style={{color: redToGreenHex(formatConfidence(val[1]))}}>
                        <td>{val[0]}</td>
                        <td>{formatConfidence(val[1])}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    if (vals.length === 2) {
        // Render the two-column table
        return (
            <table>
                <thead>
                    <tr>
                        <th>
                            <h2>OpenMax</h2>
                        </th>
                        <th>
                            <h2>Naive</h2>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{renderTable(vals[0])}</td>
                        <td>{renderTable(vals[1])}</td>
                    </tr>
                </tbody>
            </table>
        );
    } else {
        // Render the single-column table
        return (
            <table>
                <thead>
                    <tr>
                        <th>
                            <h2>Naive Classification</h2>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{renderTable(vals[0])}</td>
                    </tr>
                </tbody>
            </table>
        );
    }
};

document.getElementById("openmax-upload").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the default form submission

    // Gather form data, including the file
    const formData = new FormData(this);


    var resp = fetch("https://openmax-demo.onrender.com", {
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
            console.log(data);
            ReactDOM.render(<ClassificationTable vals={data.vals} />, document.getElementById('table-root'));
        })
});

var imgImp = document.getElementById('imgInp');
imgInp.onchange = evt => {
    const [file] = imgInp.files;
    if (file) {
        document.getElementById("openmax-image").src = URL.createObjectURL(file);
        document.getElementById("openmax-image").hidden = false;
        document.getElementById("openmax-filename").textContent = file.name;
        document.getElementById("openmax-filename").hidden = false;
        document.getElementById("choose-overlay").hidden = true;
    }
}


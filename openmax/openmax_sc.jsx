const ClassificationTable = ({ vals }) => {
    if (!vals || !Array.isArray(vals)) {
        return null; // Return nothing if vals is not provided or not an array
    }


    const redToGreenHSL = (percent) => {
        // Clamp the input to be between 0 and 100
        percent = Math.min(100, Math.max(0, percent));
        const proportion = Math.log(percent + 1)/Math.log(100);
        
        // Convert the percentage to a hue value between 0 and 120
        const hue = proportion * 120;
        
        return `hsl(${hue}, 100%, 50%)`;
    }

    const formatConfidence = (value) => {
        const num = Number(value);
        return isNaN(num) ? value : num.toFixed(5);
    };

    const renderTable = (data) => (
        <table className="itable w-full">
            <thead>
                <tr>
                    <th>Class</th>
                    <th>Conf</th>
                </tr>
            </thead>
            <tbody>
                {data.map((val, index) => (
                    <tr key={index} style={{color: redToGreenHSL(formatConfidence(val[1]))}}>
                        <td style={{marginRight: "5px"}}>{val[0]}</td>
                        <td style={{textAlign: "right", marginLeft: "5px"}}>{formatConfidence(val[1])}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    if (vals.length === 2) {
        // Render the two-column table
        return (
            <div class="items-center">
                <h3 class="text-3xl font-semibold text-center w-full">Classification Results</h3>
                <table class="w-full">
                    <thead>
                        <tr>
                            <th>
                                <h2 class="text-2xl">OpenMax</h2>
                            </th>
                            <th>
                                <h2 class="text-2xl">Naive</h2>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{renderTable(vals[0])}</td>
                            <td style={{paddingLeft: "10px"}}>{renderTable(vals[1])}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    } else {
        // Render the single-column table
        return (
            <div class="items-center">
                <h3 class="text-3xl font-semibold text-center w-full">Classification Results</h3>
                <table class="w-full">
                    <thead>
                        <tr>
                            <th>
                                <h2 class="text-2xl">Naive Classification</h2>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{renderTable(vals[0])}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
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


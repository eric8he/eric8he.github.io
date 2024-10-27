const ClassificationTable = ({ vals }) => {
    if (!vals || !Array.isArray(vals)) {
        return null; // Return nothing if vals is not provided or not an array
    }

    const formatConfidence = (value) => {
        const num = Number(value);
        return isNaN(num) ? value : num.toFixed(5);
    };

    const renderTable = (data) => (
        <table className="itable">
            <thead>
                <tr>
                    <th>Classification</th>
                    <th>Confidence</th>
                </tr>
            </thead>
            <tbody>
                {data.map((val, index) => (
                    <tr key={index}>
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
                            <h2>OpenMax Classification</h2>
                        </th>
                        <th>
                            <h2>Naive Classification</h2>
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


    var resp = fetch("http://35.193.160.193:80", {
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


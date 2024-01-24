// function toggleDropdown() {
//     var dropdownContent = document.getElementById("dropdownContent");
//     if (dropdownContent.style.display === "block") {
//         dropdownContent.style.display = "none";
//     } else {
//         dropdownContent.style.display = "block";
//     }
// }

function toggleDropdown() {
    var dropdownContent = document.getElementById("dropdownContent");
    dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";
}

function sendSearch() {
    var query = document.getElementById('search-input').value;
    fetch('/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({query: query}),
    })
    .then(response => response.json())
    .then(data => {
        var resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = '';
        let item1, item2, item3;

        data.forEach(function(item){
            // Assuming each 'item' is an array with three elements
            let classCode = item[0]; // Class code
            let classTitle = item[1]; // Class title
            let classDescription = item[2]; // Class description
        
            resultsDiv.innerHTML += `
                <div class="result-box">
                    <span class="class-code">${classCode}</span>
                    <span class="class-title">${classTitle}</span>
                    <div class="class-description">${classDescription}</div>
                </div>`;
        });        
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}
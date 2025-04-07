function loadPage(page) {
    console.log("Loading page: " + page);
    let loader = document.getElementById('loader');
    let content = document.getElementById('content');

    loader.style.display = "block";
    fetch(`src/pages/${page}.html`)
        .then(response => {
            console.log("Fetch Response: ", response);
            if (!response.ok) throw new Error("Page not found");
            return response.text();
        })
        .then(data => {
            console.log("Data Loaded:", data);
            content.innerHTML = data;
            loader.style.display = "none"; 
            
            history.pushState({ page: page }, "", `#${page}`);
        })
        .catch(error => {
            console.error("Error loading page: ", error);
            loadPage('404'); 
        });
}

window.addEventListener("popstate", function (event) {
    let page = event.state && event.state.page ? event.state.page : "MobilePrepaid";  
    loadPage(page);
});

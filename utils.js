function updateWarning(text) {
    document.getElementById("greet").innerHTML = text
}

// Loop before a token expire to fetch a new one
function initializeRefreshTokenStrategy(shellSdk, auth) {

    shellSdk.on(SHELL_EVENTS.Version1.REQUIRE_AUTHENTICATION, (event) => {
        sessionStorage.setItem('token', event.access_token);
        setTimeout(() => fetchToken(), (event.expires_in * 1000) - 5000);
    });

    function fetchToken() {
        shellSdk.emit(SHELL_EVENTS.Version1.REQUIRE_AUTHENTICATION, {
            response_type: 'token'  // request a user token within the context
        });
    }

    sessionStorage.setItem('token', auth.access_token);
    setTimeout(() => fetchToken(), (auth.expires_in * 1000) - 5000);
}

function getActivityContext(cloudHost, account, company, activity_id) {
    let addressUrl = `https://ds.coresuite.com/ds/api/directory/v1/accounts/${encodeURIComponent(account)}`;
    const header = {
        'Content-Type': 'application/json',
        'X-Client-ID': '000179c6-c140-44ec-b48e-b447949fd5c9',
        'X-Client-Version': '1.0',
        'Authorization': `bearer ${sessionStorage.getItem('token')}`,
    };
    let url = `https://${cloudHost}/api/data/v4/Activity/${activity_id}?dtos=Activity.43&account=${account}&company=${company}`
    let body = JSON.stringify({
        "query" : "SELECT a from Activity a"
    });
    let method = 'POST';
    return new Promise(resolve => {
        // Fetch Activity object
        fetch(addressUrl, {
            method: "GET",
            headers: header
        }).then(response => {
            debugger
            response.json()
        }).then(json => {
            console.log(json);
        }).catch(err => {
            console.log(err);
        })
    })
}


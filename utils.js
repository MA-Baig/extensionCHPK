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
    const headers = {
        'Content-Type': 'application/json',
        'X-Client-ID': 'sap-fsm-extension',
        'X-Client-Version': '1.0.0',
        'Authorization': `bearer ${sessionStorage.getItem('token')}`,
    };

    return new Promise(resolve => {
        // Fetch Activity object
        fetch(`https://${cloudHost}/api/data/v4/Activity/${activity_id}?dtos=Activity.43&account=${account}&company=${company}`, {
            headers
        }).then(response => {
            debugger
            response.json()
        }).then(json => {

        })
    })
}
var globalCompanyObject;
var shellReferenceObject = {};
let globalTimeOutId;

function updateWarning(text) {
    document.getElementById("greet").innerHTML = text
}

function isInsideShell(FSMShell) {
    const { ShellSdk, SHELL_EVENTS } = FSMShell;
    if (!ShellSdk.isInsideShell()) {
        updateWarning('⚠️ Unable to reach shell event API');
    } else {
        // Initialise ShellSDK to connect with parent shell library
        const shellSdk = ShellSdk.init(parent, '*');

        // Initialise the extension by requesting the fsm context
        shellSdk.emit(SHELL_EVENTS.Version1.REQUIRE_CONTEXT, {
            clientIdentifier: '000179c6-c140-44ec-b48e-b447949fd5c9',
            clientSecret: '46342ddc-22aa-4f11-98a7-e9032b55477f',
            auth: {
                response_type: 'token'  // request a user token within the context
            }
        });

        // Callback on FSM context response
        shellSdk.on(SHELL_EVENTS.Version1.REQUIRE_CONTEXT, (event) => {
            const {
                // extract required context from event content
                auth
            } = JSON.parse(event);
            globalCompanyObject = JSON.parse(event);

            // Access_token has a short life stpan and needs to be refreshed before expiring
            // Each extension need to implement its own strategy to fresh it.
            shellReferenceObject["shellSdk"] = shellSdk;
            shellReferenceObject["SHELL_EVENTS"] = SHELL_EVENTS;
            shellReferenceObject["jsonEvent"] = JSON.parse(event);

            return callbackLimiter(shellSdk, SHELL_EVENTS, globalCompanyObject);
        });
    }
}

async function callbackLimiter(shellSdk, SHELL_EVENTS, globalCompanyObject) {
    shellSdk.emit(SHELL_EVENTS.Version1.REQUIRE_AUTHENTICATION, {
        response_type: 'token'
    });
    return refreshTokenNFetchData(shellSdk, SHELL_EVENTS, globalCompanyObject);
}

async function refreshTokenNFetchData(shellSdk, SHELL_EVENTS, globalCompanyObject) {
    clearTimeout(globalTimeOutId); // Here we clear the previous timeout id that's stored

    // Request for the new token
    // shellSdk.emit(SHELL_EVENTS.Version1.REQUIRE_AUTHENTICATION, {
    //     response_type: 'token'
    // });

    // Response for the request
    shellSdk.on(SHELL_EVENTS.Version1.REQUIRE_AUTHENTICATION, async (event) => {
        sessionStorage.setItem('token', event.access_token);

        // Next call for loading the data asynchronously time to time
        let inputValue = document.getElementById("inputId") ? document.getElementById("inputId").value : 10; // i.e default value
        let loadDataTimePeriod = Number(inputValue) * 60 * 1000; // time in milli seconds i.e 1min * 60sec * 1000ms
        globalTimeOutId = setTimeout((shellSdk, SHELL_EVENTS, globalCompanyObject) => { 
            // callbackLimiter(shellSdk, SHELL_EVENTS, globalCompanyObject); 
            shellSdk.emit(SHELL_EVENTS.Version1.REQUIRE_AUTHENTICATION, {
                response_type: 'token'
            });
        }, loadDataTimePeriod, shellSdk, SHELL_EVENTS, globalCompanyObject);
        
        return fetchData(comapnyObject);
    });
}

async function fetchData(comapnyObject) {
    const sameDayObj = {
        'listName' : 'sameDayList',
        'body' : JSON.stringify({ "query": "select act.id, act.createDateTime, act.code, scall.code, scall.subject, add.location, add.location from ServiceCall scall INNER JOIN Activity act ON act.object.objectId = scall.id INNER JOIN Address add ON add.id = act.address WHERE scall.priority = 'HIGH' AND scall.typeCode != 'GEMR' AND act.status = 'DRAFT' AND act.executionStage = 'DISPATCHING'" })
    };

    const emergencyObj = {
        'listName' : 'emergencyList',
        'body' : JSON.stringify({ "query": "select rr.id,rr.code, act.id,act.udf.ZZEMRALERT , act.externalId , act.startDateTime, act.code, act.timeZoneId, scall.code, scall.subject, scall.createDateTime, add.location, eq.id as equipment_id from ServiceCall scall INNER JOIN Activity act ON act.object.objectId = scall.id INNER JOIN Address add ON add.id = act.address INNER JOIN Region rr ON rr.id = act.region INNER JOIN Equipment eq ON eq.id = act.equipment WHERE scall.priority = 'HIGH' AND scall.typeCode = 'GEMR' AND act.status = 'DRAFT' AND act.executionStage = 'DISPATCHING'" })
    };

    const { cloudHost, account, company, accountId, companyId } = comapnyObject; // extract required context from event content
    const header = {
        "Content-Type": "application/json",
        "X-Client-ID": "000179c6-c140-44ec-b48e-b447949fd5c9",
        "X-Client-Version": "1.0",
        "Authorization": `bearer ${sessionStorage.getItem('token')}`,
        "X-Account-ID": accountId,
        "X-Company-ID": companyId
    };
    let url = `https://${cloudHost}/api/query/v1?account=${account}&company=${company}&dtos=Activity.43;ServiceCall.27;Address.22;Region.9;Equipment.24`;
    let method = 'POST';

    return Promise.all([fetch(url, {method: method, headers: header, body: sameDayObj['body']}), fetch(url, {method: method, headers: header, body: emergencyObj['body']})]).then(responses => {
        Promise.all(responses.map(response => response.json()))
    }).then(data => {
        const [data1, data2] = data;
    }).catch(error => {
        console.error('Error:', error);
    })

    /** 
    try {
        let response = await fetch(url, {
            method: method,
            headers: header,
            body: body
        });
        if (!response.ok) {throw false};

        let jsonResponse = await response.json();
        document.getElementById(listId).innerHTML = '';
        createMapUrlAndAddItemToList(listId, jsonResponse, cloudHost);

        if (listId === 'emergencyList' && jsonResponse.data && jsonResponse.data.length > 0){
            updateCallForAlert(jsonResponse, comapnyObject);
        }

        return true
    } catch (error) {
        document.getElementById('emergencyList').innerHTML = '';
        document.getElementById('sameDayList').innerHTML = '';
        
        clearTimeout(globalTimeOutId);
        refreshTokenNFetchData(shellReferenceObject["shellSdk"], shellReferenceObject["SHELL_EVENTS"], shellReferenceObject["jsonEvent"]);
    }
    */
}

function updateCallForAlert(jsonResponse, comapnyObject) {
    jsonResponse.data.forEach(async data => {
        let {scall, rr, act, equipment_id } = data;
        let premise = equipment_id ? "Dispatcher Area" : "Off-Premise";
        if (act && Array.isArray(act.udfValues)){
        let ZZEMRALERT = act.udfValues.find(udf => udf.name === "ZZEMRALERT");
            if (ZZEMRALERT && ZZEMRALERT.value === "false") {
                //Construct the PATCH request body
                let patchRequestBody = {
                    "udfValues": [
                        {
                            "meta": {
                                "externalId": "ZZEMRALERT"
                            },
                            "value": true
                        }
                    ]
                };
                await postUpdatedZZEMRALERTValue(comapnyObject, patchRequestBody, act);
           }
        }
    });
}

async function postUpdatedZZEMRALERTValue(comapnyObject, patchRequestBody, act) {
    // Request new token and then update the property to the server
    let [ shellSdk, SHELL_EVENTS ] = [ shellReferenceObject["shellSdk"], shellReferenceObject["SHELL_EVENTS"] ];
    shellSdk.emit(SHELL_EVENTS.Version1.REQUIRE_AUTHENTICATION, {
        response_type: 'token'
    });

    shellSdk.on(SHELL_EVENTS.Version1.REQUIRE_AUTHENTICATION, async (event) => {
        sessionStorage.setItem('token', event.access_token);

        const { cloudHost, accountId, companyId } = comapnyObject;
        const header = {
            "Content-Type": "application/json",
            "X-Client-ID": "000179c6-c140-44ec-b48e-b447949fd5c9",
            "X-Client-Version": "1.0",
            "Authorization": `bearer ${sessionStorage.getItem('token')}`,
            "X-Account-ID": accountId,
            "X-Company-ID": companyId
        };
        let url = `https://${cloudHost}/api/data/v4/Activity/externalId/${act.externalId}?dtos=Activity.43&forceUpdate=true`;
        let body = JSON.stringify(patchRequestBody);
        let method = 'PATCH';
        // Make the POST request to update the ZZEMRALERT value
        const response = await fetch(url, {
            method: method,
            headers: header,
            body: body
        });

        if (response.ok) {
            const responseData = await response.json();
            console.log('Updated ZZEMRALERT value:', responseData);
        };

        alert(`New Emergency Received Service Order #${scall.code}, Work Center: ${rr.code.substring(8)}, Premise: ${premise}`);
    });
}
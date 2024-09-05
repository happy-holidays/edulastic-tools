function http_get(url, callback, headers=[], method="GET", content=null) {
  let request = new XMLHttpRequest();
  request.addEventListener("load", callback);
  request.open(method, url, true);
  for (const header of headers) {
    request.setRequestHeader(header[0], header[1]);
  }
  request.send(content);
}

function main() {
  let url_regex = /https:\/\/app\.edulastic\.com\/home\/class\/([a-f0-9]+)\/test\/([a-f0-9]+)\/testActivityReport\/([a-f0-9]+)/;
  if (!url_regex.test(window.location.href)) {
    alert("Error: Invalid URL.\n\nFor reference, the URL should look like this:\nhttps://app.edulastic.com/home/class/CLASS_ID/test/TEST_ID/testActivityReport/TEST_REPORT_ID");
    return;
  }
  
  let matches = url_regex.exec(window.location.href);
  let group_id = matches[1];
  let test_id = matches[3];
  let request_url = `https://app.edulastic.com/api/test-activity/${test_id}/report?groupId=${group_id}`;
  
  // Retrieve tokens from localStorage or sessionStorage
  let token_list = JSON.parse(localStorage.getItem("tokens") || sessionStorage.getItem("tokens"));
  let token = localStorage.getItem(token_list ? token_list[0] : null) || sessionStorage.getItem(token_list ? token_list[0] : null);

  if (!token) {
    alert("Error: Unable to retrieve authorization token.");
    return;
  }

  let headers = [
    ["Authorization", `Bearer ${token}`]  // Add 'Bearer ' if required by the API
  ];

  http_get(request_url, function() {
    if (this.status != 200) {
      alert(`Error: Status code ${this.status} received while trying to fetch the API.`);
      return;
    }

    // Log the response to inspect its structure
    console.log("API Response:", this.responseText);

    let report;
    try {
      report = JSON.parse(this.responseText);
    } catch (error) {
      alert("Error: Failed to parse the response.");
      return;
    }

    // Adjust these fields if the structure has changed
    let wrong = report?.result?.testActivity?.wrong || 0;
    let total = report?.result?.questionActivities?.length || 0;

    if (total > 0) {
      let percent = (100 * (total - wrong) / total).toFixed(2);
      alert(`${total - wrong}/${total} questions correct (~${percent}%)`);
    } else {
      alert("Error: No questions found in the report.");
    }
  }, headers);
}

main();

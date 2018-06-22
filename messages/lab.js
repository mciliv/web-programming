// lab.js
// 8 March 2016
//

function parse() {

	request = new XMLHttpRequest();

	// Step 1: Make the request
	request.open("GET","data.json",true);

	// Step 2: Handle the request
	request.onreadystatechange = dispMessages;

	// Step 3: Data is ready, so there's a response
	function dispMessages() {
		if (request.readyState == 4 && request.status == 200)
		{
			result = '';
			raw = request.responseText;
			theMessageData = JSON.parse(raw);

			elem = document.getElementById("messages");

			for (i = 0; i < theMessageData.length; i++)
			{
				result += "<span class = 'theMessage'>" +
				theMessageData[i].content + " </span>" +
				"<span class = 'person'>" + theMessageData[i].username +
				"</span>" + "<br>";			
			}

			elem.innerHTML = result;
		}
		else if (request.readyState == 4 && request.status != 200)
		{
			document.getElementById("messages").innerHTML = "<p>" +
			request.status + " Error </p>";
		}
	};

	// Step 4: Send off the request
	request.send(null);
}



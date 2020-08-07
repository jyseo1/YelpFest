var displayError = document.getElementById('card-errors');
function errorHandler(err){
	changeLoadingState(false);
	displayError.textContent = err;
}
var orderData = {
	items: [{ id: "yelpcamp-registration-fee" }],
	currency: "usd"
};

// Set your publishable key: remember to change this to your live publishable key in production
// See your keys here: https://dashboard.stripe.com/account/apikeys
// var stripe = Stripe("<%= process.env.STRIPE_PUBLISHABLE_KEY %>");
var stripe = Stripe("pk_test_51H2mOEDwQ0YfduTneHE9BTlQLAKuRIt47vxQoVZfCtMB3uMHP0IbmLTLlRnVV1AmxnyDm6V2varc7cGu8nLcoT1300aJsLkh69");

var elements = stripe.elements();

// Set up Stripe.js and Elements to use in checkout form
var style = {
	base: {
		color: "#32325d",
	}
};

var card = elements.create("card", { style: style });
card.mount("#card-element");

// Elements validates user input as it's typed
card.addEventListener('change', function(event) {
	if (event.error) {
		console.log("Error from if() in card.addEventListener");
		errorHandler(event.error.message);
	} else {
		errorHandler("");
	}
});

// Submit Payment to Stripe
var form = document.getElementById('payment-form');

form.addEventListener('submit', function(ev) {
	ev.preventDefault();
	
	changeLoadingState(true);

	stripe.createPaymentMethod("card", card)
		.then(function(result) {
			if (result.error) {
				console.log("Error from if() in createPaymentMethod");
				errorHandler(result.error.message);
			} else {
				orderData.paymentMethodId = result.paymentMethod.id;

				return fetch("/pay", {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify(orderData)
				});
			}
		})
		.then(function(result) {
			return result.json();
		})
		.then(function(response) {
			if (response.error) {
				console.log("This is from .then(function((response)): " + response.error);
				errorHandler(response.error);
			} else {
				changeLoadingState(false);
				//redirect to /campgrounds with a query string
				//that invokes a success flash message
				window.location.href = "/campgrounds?paid=true"
			}
		})
		.catch(function(err){
			console.log("This is from .catch: " + err);
			errorHandler(err.error);
		});
});

// Show a spinner on payment submission
function changeLoadingState(isLoading) {
if (isLoading) {
	document.querySelector("button#submit").disabled = true;
	document.querySelector("#spinner").classList.remove("hidden");
	document.querySelector("#button-text").classList.add("hidden");
} else {
	document.querySelector("button#submit").disabled = false;
	document.querySelector("#spinner").classList.add("hidden");
	document.querySelector("#button-text").classList.remove("hidden");
}
};

const appServerKey =
	'BEqnQC92JJnV8nb07SduDA_edw0LZ_DQV5gEccn9PEf7G2GPMdhJaz2wKTx1L1PZ8lRNyS3kcpZioQFA1xP0LqM';

let hasSubscription = false;
let serviceWorkerRegistration = null;
let subscriptionData = false;

function urlB64ToUint8Array(base64String) {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding)
		.replace(/\-/g, '+')
		.replace(/_/g, '/');

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

function subscribeUser() {
	serviceWorkerRegistration.pushManager
		.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlB64ToUint8Array(appServerKey),
		})
		.then(function (subscription) {
			fetch('/push/subscribe', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(subscription),
			})
				.then(function (response) {
					return response;
				})
				.then(function (text) {
					console.log('User is subscribed.');
					hasSubscription = true;
				})
				.catch(function (error) {
					hasSubscription = false;
					console.error('error fetching subscribe', error);
				});
		})
		.catch(function (err) {
			console.log('Failed to subscribe the user: ', err);
		});
}

function unsubscribeUser() {
	serviceWorkerRegistration.pushManager
		.getSubscription()
		.then(function (subscription) {
			if (subscription) {
				subscriptionData = {
					endpoint: subscription.endpoint,
				};

				fetch('/push/unsubscribe', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(subscriptionData),
				})
					.then(function (response) {
						return response;
					})
					.then(function (text) {
						hasSubscription = false;
					})
					.catch(function (error) {
						hasSubscription = true;
						console.error('error fetching subscribe', error);
					});

				hasSubscription = false;
				return subscription.unsubscribe();
			}
		});
}

function initPush() {
	goBtn.addEventListener('click', function () {
		if (hasSubscription) {
			unsubscribeUser();
		} else {
			subscribeUser();
		}
	});

	// Set the initial subscription value
	serviceWorkerRegistration.pushManager
		.getSubscription()
		.then(function (subscription) {
			hasSubscription = !(subscription === null);
		});
}

navigator.serviceWorker.register('/js/sw.js').then((sw) => {
	serviceWorkerRegistration = sw;
	initPush();
});

self.addEventListener('push', function (event) {
	let notificationData = {};

	try {
		notificationData = event.data.json();
	} catch (e) {
		notificationData = {
			title: 'Default title',
			body: 'Default message',
			icon: '/default-icon.png',
		};
	}

	event.waitUntil(
		self.registration.showNotification(notificationData.title, {
			body: notificationData.body,
			icon: notificationData.icon,
		})
	);
});

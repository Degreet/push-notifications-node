const express = require('express');
const webPush = require('web-push');
const streamToString = require('stream-to-string');
const dotenv = require('dotenv');
dotenv.config();

const port = process.env.PORT;
const app = express();
const subs = [];

webPush.setVapidDetails(
	'mailto:degreetpro@gmail.com',
	process.env.PUBLIC_KEY,
	process.env.PRIVATE_KEY
);

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(async (req, _, next) => {
	try {
		const body = JSON.parse(await streamToString(req));
		req.body = body;
	} catch {}

	return next();
});

app.get('/', (req, resp) => {
	resp.render('index');
});

app.post('/push/subscribe', function (req, resp) {
	const subscription = {
		endpoint: req.body.endpoint,
		keys: {
			p256dh: req.body.keys.p256dh,
			auth: req.body.keys.auth,
		},
	};

	subs.push(subscription);
	resp.status(200).send('subscribe');
});

app.post('/push/unsubscribe', (req, resp) => {
	const idx = subs.findIndex((user) => user.endpoint == req.body.endpoint);
	if (idx >= 0) subs.splice(idx, 1);
	resp.status(200).send('unsubscribe');
});

const notify = () => {
	const payload = JSON.stringify({
		title: 'Welcome',
		body: 'Thank you for enabling push notifications',
		icon: '/android-chrome-192x192.png',
	});

	subs.forEach((sub) => {
		webPush.sendNotification(sub, payload, {
			TTL: 3600,
		});
	});
};

global.notify = notify; // for debug in console
setInterval(notify, 60000);
app.listen(port, () => console.log('http://localhost:3000/'));

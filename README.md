
## Noted
The app is maintained and developed by **Damian Piechocki**.
Noted is an web application, which **allows storing notes and manipulating them**.
Users are being appropriately **authenticated**, upon performing actions on their accounts.
**Gemini 1.5 flash integration** makes it so that note taking is more convienient by having a personal assitant.
Integration of speech recognition is also planned, so that users can take notes with the greatest comfort possible.
The site is **responsive**, ensuring that the layout of elements remain neet.

## Technologies and third party services in use:
  - Node.js(express.js)
  - Mongodb
  - Docker
  - EJS templating language and CSS
  - Gemini developer API(https://ai.google.dev/?authuser=1)

## Booting
The server can be started using 
```console
	node server.js
```
or running a docker file
```console
	docker build -t noted .
	docker run -p 3000:3000 noted
```

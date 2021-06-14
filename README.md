# Building Mobile Companion Apps with **tru.ID** PhoneCheck API

## Requirements

- A mobile phone with a SIM card and mobile data connection
- [Node.js](https://nodejs.org)
- Other requirements

## Getting Started

Clone the `starter-files` branch via:

```
git clone -b starter-files --single-branch https://github.com/tru-ID/mobile-companion
```

If you're only interested in the finished code in `main` then run:

```
git clone -b main https://github.com/tru-ID/mobile-companion.git
```

Create a [tru.ID Account](https://tru.id)

Install the tru.ID CLI via:

```bash
npm i -g @tru_id/cli

```

Input your **tru.ID** credentials which can be found within the tru.ID [console](https://developer.tru.id/console)

Install the **tru.ID** CLI [development server plugin](https://github.com/tru-ID/cli-plugin-dev-server)

Create a new project via:

```bash
tru projects:create passwordless-auth-web --project-dir .
```

Next you need to setup the server.

Copy the values of `.env.example` into a `.env` file via:

```bash
cd server && cp .env.example .env
```

configure the following values in your `.env`:

`TRU_ID_CLIENT`: The client ID found in the `tru.json` file in the root directory.
`TRU_ID_SECRET`: The client secret found in the `tru.json` file in the root directory.

## Starting Project

To start the server first install dependencies via:

```bash
npm install
```

then run

```bash
npm dev
```

then run ngrok. In the terminal where ngrok is running, run the following:

```bash
ngrok http 4000
```

this will give you a `https` website e.g.

```bash
https://0d834043fe8d.ngrok.io -> http://localhost:4000
```

To start the frontend application first open up a new terminal and install dependencies via:

```bash
 cd web && npm install
```

then run:

```bash
npm start
```

To start the mobile application, first open up a new terminal and install dependencies via:

```bash
cd mobile && npm install
```

then run:

```bash
npm run android
#or
npm run ios
```

## Troubleshooting

[//]: # 'Include troubleshooting guides, if any'

## References

- [**tru.ID** docs](https://developer.tru.id/docs)

## Meta

Distributed under the MIT License. See [LICENSE](https://github.com/tru-ID/{repo-name}/blob/main/LICENSE.md)

[**tru.ID**](https://tru.id)

import express from "express"
import serverless from "serverless-http"
import querystring from "querystring"
import cors from "cors"
import axios from "axios"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPaths = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(__dirname, "../../.env")
]

envPaths.forEach((envPath) => {
    dotenv.config({ path: envPath })
})

const app = express()
const router = express.Router()

const redirect_uri = process.env.REDIRECT_URI || "http://127.0.0.1:9000/.netlify/functions/api/callback"

const getSpotifyConfig = () => {
    const clientId = process.env.CLIENT_ID || process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.CLIENT_SECRET || process.env.SPOTIFY_CLIENT_SECRET

    return {
        clientId,
        clientSecret
    }
}

const hasSpotifyConfig = () => {
    const { clientId, clientSecret } = getSpotifyConfig()
    return Boolean(clientId && clientSecret)
}

const sendMissingSpotifyConfig = (res) => {
    res.status(500).send(
        "Missing Spotify API environment variables. Set CLIENT_ID and CLIENT_SECRET locally, or configure them in Netlify."
    )
}

router.use(cors())

router.get("/", (req, res) => {
    console.log("hi")
	res.send("Hi from root")
})

router.get("/scrape", async (req, res) => {
    const url = req.headers.url
    console.log(url)
    const response = await axios.get(url)
    res.send(response.data)
})

router.get("/login", (req, res) => {
    const { clientId } = getSpotifyConfig()

    if (!clientId) {
        return sendMissingSpotifyConfig(res)
    }

    let queryParams = querystring.stringify({
        client_id: clientId,
        response_type: "code",
        redirect_uri: redirect_uri,
        scope: "user-top-read user-modify-playback-state"
    })
    res.redirect("https://accounts.spotify.com/authorize?" + queryParams)
})

router.get("/callback", async (req, res) => {
    try {
        const { clientId, clientSecret } = getSpotifyConfig()

        if (!clientId || !clientSecret) {
            return sendMissingSpotifyConfig(res)
        }

        let code = req.query.code || null
        const tokenResponse = await axios.post("https://accounts.spotify.com/api/token", 
            querystring.stringify({
                grant_type: "authorization_code",
                code: code,
                redirect_uri: redirect_uri
            }), 
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": "Basic " + (Buffer.from(
                        clientId + ":" + clientSecret
                    ).toString("base64"))
                }
            }
        )
        
        let accessToken = tokenResponse.data.access_token
        let uri = process.env.FRONTEND_URI || "http://127.0.0.1:3000"
        console.log("Authorization complete!")
        res.redirect(uri + "?" + "access_token=" + accessToken)
    } catch (error) {
        console.error("Error getting access token:", error)
        res.status(500).send("Error during authorization")
    }
})

app.use(cors())
app.use(`/.netlify/functions/api`, router)
app.use(`/`, router)

if (!process.env.NETLIFY && process.env.NODE_ENV !== "production") {
    const apiHost = process.env.API_HOST || "127.0.0.1"
    const apiPort = Number(process.env.API_PORT || 9000)

    app.listen(apiPort, apiHost, () => {
        console.log(`Server is running on http://${apiHost}:${apiPort}`)
        console.log(`Spotify config loaded: ${hasSpotifyConfig() ? "yes" : "no"}`)
    })
}

export default app;
export const handler = serverless(app);

import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import config from "./config";

const spotifyClient = SpotifyApi.withClientCredentials(
  config.spotifyClientId,
  config.spotifySecretKey
);

export default spotifyClient;

# Blindspot

Driving directions that pass the fewest surveillance cameras.

Blindspot is a web app you can install on your phone. Search for a destination and it compares two routes: the fastest one, and the one that passes the fewest mapped cameras, such as Flock and other license plate readers, red-light and speed cameras, and public street cameras. You can drive the camera-avoiding route with turn-by-turn voice directions inside the app, or hand it off to Google Maps.

**Live app:** https://pixelghost23.github.io/blindspot/

## Features

- **Fewest-camera routing that uses side streets.** Blocks only the road stretch each camera watches, so workarounds through nearby side streets and cross streets stay available. Cameras that truly can't be avoided are let through one at a time instead of failing the whole route, and a smaller-roads route and the server's alternates are compared too.
- **Direction-aware cameras.** When OpenStreetMap records which way a camera points (`direction` / `camera:direction`), only the road in front of it counts. Plate readers only count for traffic moving toward or away from them, so cross streets aren't avoided for nothing. Cameras with no direction are treated as seeing every way.
- **Extra-time budget.** Choose how much longer you'll drive to avoid cameras (5, 10, 15 or 30 minutes, or any). The status line explains why any cameras remain: at your start or destination, on the only road through, or too long a detour.
- **Turn-by-turn navigation** with voice, "camera ahead" alerts, automatic rerouting around cameras if you miss a turn, and a fast-forward preview drive.
- **Cameras on this route:** a list of each camera you'll pass, with operator, facing direction and how far into the trip it is, plus how well the area is mapped.
- **Report a camera.** Press and hold the map. Your report is saved on your phone and avoided right away. You can also post it as an anonymous OpenStreetMap note so mappers can add it for everyone.
- **Saved places:** Home, Work and starred destinations.
- **Share a trip** as a link that opens Blindspot with the same start and destination.
- **Open in Google Maps** (keeps the route through 8 waypoints), Apple Maps or MapQuest (destination only).
- **Installable and offline-friendly:** add it to your home screen. The app shell and recently viewed map tiles are cached, and so is the camera data for 7 days.
- Light and dark themes, large touch targets and screen-reader labels.

## How it works

1. Search ([Photon](https://photon.komoot.io), with [Nominatim](https://nominatim.org) as fallback) turns an address into coordinates.
2. [Valhalla](https://valhalla.github.io/valhalla/) on the FOSSGIS public server returns the fastest route plus alternates.
3. [Overpass API](https://overpass-api.de) returns OpenStreetMap camera nodes (`man_made=surveillance`, `highway=speed_camera`) around the trip.
4. For each camera the route passes, Blindspot asks Valhalla to skip only the stretch of road that camera watches (`exclude_locations`), so cross streets and side streets right next to it stay usable. If the new route still passes the camera, it blocks more of that road, and as a last resort the whole area around it (`exclude_polygons`). A route that prefers smaller roads (`use_highways: 0`) and the server's alternates are compared too. The result is the route with the fewest cameras that fits your time budget.
5. The map is drawn with [MapLibre GL JS](https://maplibre.org) and [OpenFreeMap](https://openfreemap.org) tiles.

It's all one `index.html` with no build step. `sw.js` adds offline caching and `manifest.webmanifest` makes it installable.

## Privacy

- No account, no analytics and no tracking.
- Saved places, settings, recent searches and your camera reports are stored only in your browser.
- To work, the app sends searches, start/end points and route requests to the free community services listed above. They see those requests, the same as any map app that uses them.
- Reports you choose to send to OpenStreetMap become public notes showing the location and your text.

## Limits

- **Camera data is crowdsourced.** "0 cameras" means none that are mapped. Many areas are incomplete, so report cameras you see.
- **Shared free servers.** Blindspot uses free community servers with fair-use policies. It limits itself to 14 routing requests per search, but it isn't built for heavy traffic. Running it for many users would need its own routing and data servers.
- **Trip length.** Trips are limited to about 100 miles because of the camera lookup.
- **iPhone browser limits.** Web apps can't keep navigating with the screen locked, so the app keeps the screen awake while you drive. Voice needs the phone's silent switch off.
- **Handing off to other apps.** Google Maps may pick its own roads between the 8 waypoints. Apple Maps and MapQuest only get the destination.

## Run your own copy

1. Fork or copy this repo.
2. Go to **Settings → Pages**, set **Source** to *Deploy from a branch*, and choose `main` / `(root)`.
3. Open `https://<your-username>.github.io/<repo>/`.

To test locally, serve the folder over HTTPS, or open it on `localhost` (`python3 -m http.server`). Location and the service worker need a secure origin.

## Credits

- Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors (ODbL).
- Plate-reader mapping by [DeFlock](https://deflock.me).
- Routing by Valhalla on the [FOSSGIS](https://www.fossgis.de) server, search by Photon ([komoot](https://www.komoot.com)), and map tiles by [OpenFreeMap](https://openfreemap.org).

# Art Bounty Site

A hosted NodeJS application that continuosly runs on a server. Users will be able to login if they exist in a DynamoDB table and see what Collin is needing in the world of art assets.

### How to Run

- `sudo apt-get update && sudo apt-get install nodejs npm`
- `npm install`
- `npm start`

### How to Configure

On the first run, all needed directories will be created.

##### Bounties

```json
    {
        "thumbnail": "",
        "price": 20,
        "tags": ["sprite", "game", "animation"],
        "description": "Here is a shitton of text",
        "specifications": ["8 colors", "64x64", "8 frames of stitching animation", "each stitch has a unique texture for color-blind users"]
    }
```
- Place all .json configuration files inside of `bounties/unclaimed`

##### Thumbnails

- Place all images with the exact same name as `thumbnail` inside of `public/img`
    - If no `thumbnail` property, `public/no-image.png` will be loaded for the bounty

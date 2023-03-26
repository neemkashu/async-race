# RS async race
___
## Setup and Running

- Clone this repo: `$ git clone https://github.com/neemkashu/async-race.git`.
- Go to downloaded folder: `$ cd async-race`.
- Install dependencies: `$ npm install`.
- Start server: `$ npm start`.
- Open the app at: `http://127.0.0.1:8080`.
___
## Setup Server

**The application employs a server mock to handle its API requests**

Use the following repository
https://github.com/neemkashu/async-race-api#readme

- Use `node 14.x` or higher.
- Clone this repo: `$ git clone https://github.com/mikhama/async-race-api.git`.
- Go to downloaded folder: `$ cd async-race-api`.
- Install dependencies: `$ npm install`.
- Start server: `$ npm start`.
- Now you can send requests to the address: `http://127.0.0.1:3000`.
___
## Async Race App
This web application allows the user to create, update, and delete cars, as well as view and sort the winners of previous races. There are two main views in the application: "Garage" and "Winners". New winners are generated after successful races.

### Features
- Two views: "Garage" and "Winners"
- View state is saved when switching between views
- Create, update, and delete cars in the "Garage" view
- Random car creation with a combination of names and colors
- Pagination for the "Garage" and "Winners" views
- Run and stop a race
- All buttons are individually locked and unlocked depending on the app state

### Garage View
The "Garage" view displays a list of cars in the user's garage, along with their colors and names. Users can select colors from an RGB-Palette to color their cars. Pagination is used to display a maximum of 7 cars per page, and users can create up to 100 new random cars at once. Additionally, users can start and stop the car's animation with a button, and the animation will work on any screen size.

### Winners View
The "Winners" view shows a table of the winners from previous races. The table can be sorted by number of wins or best time, and pagination is used to display a maximum of 10 winners per page. The table includes the car's image, name, number of wins, and best time. If a car wins more than once, its number of wins is incremented and its best time is only updated if it is better than the previous one.

### Race
Users can start a race with all the cars on the current page by clicking a `race` button.  Users can also reset the race to its initial state with `stop` button. Car engines (animation) start after server requiest. Server respones with the velocity of a car. During the race server can send a reponce 500 or 200 to sumilate accidential engine stop.
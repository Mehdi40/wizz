# Candidate Takehome Exercise
This is a simple backend engineer take-home test to help assess candidate skills and practices.  We appreciate your interest in Voodoo and have created this exercise as a tool to learn more about how you practice your craft in a realistic environment.  This is a test of your coding ability, but more importantly it is also a test of your overall practices.

If you are a seasoned Node.js developer, the coding portion of this exercise should take no more than 1-2 hours to complete.  Depending on your level of familiarity with Node.js, Express, and Sequelize, it may not be possible to finish in 2 hours, but you should not spend more than 2 hours.  

We value your time, and you should too.  If you reach the 2 hour mark, save your progress and we can discuss what you were able to accomplish. 

The theory portions of this test are more open-ended.  It is up to you how much time you spend addressing these questions.  We recommend spending less than 1 hour.  


For the record, we are not testing to see how much free time you have, so there will be no extra credit for monumental time investments.  We are looking for concise, clear answers that demonstrate domain expertise.

# Project Overview
This project is a simple game database and consists of 2 components.  

The first component is a VueJS UI that communicates with an API and renders data in a simple browser-based UI.

The second component is an Express-based API server that queries and delivers data from an SQLite data source, using the Sequelize ORM.

This code is not necessarily representative of what you would find in a Voodoo production-ready codebase.  However, this type of stack is in regular use at Voodoo.

# Project Setup
You will need to have Node.js, NPM, and git installed locally.  You should not need anything else.

To get started, initialize a local git repo by going into the root of this project and running `git init`.  Then run `git add .` to add all of the relevant files.  Then `git commit` to complete the repo setup.  You will send us this repo as your final product.
  
Next, in a terminal, run `npm install` from the project root to initialize your dependencies.

Finally, to start the application, navigate to the project root in a terminal window and execute `npm start`

You should now be able to navigate to http://localhost:3000 and view the UI.

You should also be able to communicate with the API at http://localhost:3000/api/games

If you get an error like this when trying to build the project: `ERROR: Please install sqlite3 package manually` you should run `npm rebuild` from the project root.

# Practical Assignments
Pretend for a moment that you have been hired to work at Voodoo.  You have grabbed your first tickets to work on an internal game database application. 

#### FEATURE A: Add Search to Game Database
The main users of the Game Database have requested that we add a search feature that will allow them to search by name and/or by platform.  The front end team has already created UI for these features and all that remains is for the API to implement the expected interface.  The new UI can be seen at `/search.html`

The new UI sends 2 parameters via POST to a non-existent path on the API, `/api/games/search`

The parameters that are sent are `name` and `platform` and the expected behavior is to return results that match the platform and match or partially match the name string.  If no search has been specified, then the results should include everything (just like it does now).

Once the new API method is in place, we can move `search.html` to `index.html` and remove `search.html` from the repo.

#### FEATURE B: Populate your database with the top 100 apps
Add a populate button that calls a new route `/api/games/populate`. This route should populate your database with the top 100 games in the App Store and Google Play Store.
To do this, our data team have put in place 2 files at your disposal in an S3 bucket in JSON format:

- https://wizz-technical-test-dev.s3.eu-west-3.amazonaws.com/ios.top100.json
- https://wizz-technical-test-dev.s3.eu-west-3.amazonaws.com/android.top100.json

# Theory Assignments
You should complete these only after you have completed the practical assignments.

The business goal of the game database is to provide an internal service to get data for all apps from all app stores.  
Many other applications at Voodoo will use consume this API.

#### Question 1:
We are planning to put this project in production. According to you, what are the missing pieces to make this project production ready? 
Please elaborate an action plan.

According to me, here are some things that I'd think of before releasing this product in a production environment :
- Authentication and rights management
- More security (like validating payloads for example, or setting up a rate limiting logic)
- More safety in the code (implementing tests, linter, prettier, ... to avoid making mistakes)
- Real observability (more logs, more explicit ones, error management, alerting, ...)
- I don't know if this use case would requires a cache system tbh
- Environment variables and secrets management
- I don't really know if SQLite is suitable for this use case (I guess if it's just for read operations on such amount of data, it should be fine) - but maybe it should be a good idea to create some indexes (once again, I'm not sure with this amount of data and this kind of app if this is really a priority)
- Documentation (technical, product, ... with a Swagger, and a Notion to explain the product in detail)
- CI/CD (with automated tests, linter, prettier, deployment (IaC like Terraform, Cloud Formation, ...), DB migrations if needed, ...)
- I don't know if a dockerized environment is absolutely necessary, as we're using an in-memory database (it would have been if we were using a Postgres I guess)

#### Question 2:
Let's pretend our data team is now delivering new files every day into the S3 bucket, and our service needs to ingest those files
every day through the populate API. Could you describe a suitable solution to automate this? Feel free to propose architectural changes.

A suitable solution to automate would need :
- a solution to trigger the action : As this files would be updated every day, I don't think an event based system is required. A CRON job should do the job, it's easier to implement and to maintain (the CRON could run every day at 5am for example, so the system isn't impacted)
If this request takes too much time, there is a possibility that the CRON timed out. We could implement a queue system with a worker waiting for this to handle the job, but I think that the CRON won't time out as this is quite simple behavior (we're not saving 10 billions of items in the database).

We would then have a CRON that trigger a small function (a Lambda or a Cloud function should be okay) that will fetch the S3 files, format it to our Game model and save it in the database.

I thought about this solution with the current volumetry of data. If we need to save a lot more data, maybe I'd do some changed on the architecture. I would start benchmarking the database (is SQLite suitable ?), then I'd start benchmarking other part of the solution.
First of all, I'd probably start checking the whole pipeline and try to identify where are the bottlenecks.
I don't think creating a whole super awesome architecture is the perfect solution, if the product is basic and if a more "basic" architecture can handle what we want to do.


/*
This script analyses PRs to figure out which organization reviewed them.

It takes 2 arguments:
- a relative path to a JSON file containing the reviews to analyse (reviews.json). This is probably the output of a previous call to query-reviews.js
- a relative path to an "organizations.json" file, which lists the members of each organization in each month

Given these, it sorts all the reviews in the given timeframe by their reviewer, then maps reviewers to organizations using the organizations.json file.

Finally it lists:
- the total number of reviews made in the period
- the number made by each organization

node analyse-reviews.js PATH/TO/REVIEWS.JSON PATH/TO/ORGANIZATIONS.JSON
*/

const fs = require('fs');

const reviewsFile = process.argv[2];
const orgsFile = process.argv[3];

function initializeMonths(json) {

  const months = {
    '2022-07': [],
    '2022-08': [],
    '2022-09': []
  }

  for (const review of json) {
    if (!review.submitted_at) continue;
    const prefix = review.submitted_at.slice(0, 7);
    const month = months[prefix];
    if (!month) continue;
    const creatorIndex = month.findIndex(contributor => contributor.name === review.user.login);
    if (creatorIndex === -1) {
      month.push({
        name: review.user.login,
        count: 1
      });
    } else {
      month[creatorIndex].count++;
    }
  }

  return months;
}

function analyse(months, organization) {

  let contributions = 0;
  for (const monthName of Object.keys(months)) {
    const team = organization[monthName];
    const users = months[monthName].filter(user => team.includes(user.name));
    contributions += users.reduce((previousValue, currentValue) => previousValue + currentValue.count, 0)
  }
  return contributions;

}

function logAll(months) {
  let contributions = 0;

  for (const monthName of Object.keys(months)) {
    contributions += months[monthName].reduce((previousValue, currentValue) => previousValue + currentValue.count, 0)
  }
  console.log(`All reviews: ${contributions}`)
}

const reviewsJSON = fs.readFileSync(reviewsFile, 'utf8');
const reviews = JSON.parse(reviewsJSON);

const months = initializeMonths(reviews);

const orgJSON = fs.readFileSync(orgsFile, 'utf8');
const organizations = JSON.parse(orgJSON);

logAll(months);

console.log(`OWD : ${analyse(months, organizations['owd'])}`);
console.log(`W3C : ${analyse(months, organizations['w3c'])}`);
console.log(`Mozilla : ${analyse(months, organizations['mozilla'])}`);
console.log(`Vinyl : ${analyse(months, organizations['vinyl'])}`);


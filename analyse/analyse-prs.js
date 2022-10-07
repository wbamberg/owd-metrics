/*
This script analyses PRs to figure out which organization created them.

It takes 2 arguments:
- a relative path to a JSON file containing the reviews to analyse (prs.json). This is probably the output of a previous call to query-prs.js
- a relative path to an "organizations.json" file, which lists the members of each organization in each month

Given these, it sorts all the PRs in the given timeframe by their creator, then maps creators to organizations using the organizations.json file.

Finally it lists:
- the total number of PRs committed in the period
- the number committed by each organization

node analyse-prs.js PATH/TO/PRS.JSON PATH/TO/ORGANIZATIONS.JSON
*/

const fs = require('fs');

const prsFile = process.argv[2];
const orgsFile = process.argv[3];

function initializeBuckets(json) {

  const buckets = {
    '2022-07': [],
    '2022-08': [],
    '2022-09': []
  }

  const prs = json.filter(pr => pr.merged_at !== null);

  for (const pr of prs) {
    const prefix = pr.merged_at.slice(0, 7);
    const bucket = buckets[prefix];
    if (!bucket) continue;
    const creatorIndex = bucket.findIndex(contributor => contributor.name === pr.user.login);
    if (creatorIndex === -1) {
      bucket.push({
        name: pr.user.login,
        count: 1
      });
    } else {
      bucket[creatorIndex].count++;
    }
  }

  return buckets;
}

function analyse(buckets, organization) {
  let contributions = 0;
  for (const bucketName of Object.keys(buckets)) {
    const team = organization[bucketName];
    const users = buckets[bucketName].filter(user => team.includes(user.name));
    contributions += users.reduce((previousValue, currentValue) => previousValue + currentValue.count, 0)
  }
  return contributions;
}

function logAll(buckets) {
  let contributions = 0;
  const contributors = [];
  for (const bucketName of Object.keys(buckets)) {
    contributions += buckets[bucketName].reduce((previousValue, currentValue) => previousValue + currentValue.count, 0);
    
    const usersInBucket = buckets[bucketName].map( item => item.name);

    for (const userInBucket of usersInBucket) {
      if (!contributors.includes(userInBucket)) {
        contributors.push(userInBucket);
      }
    }
  }
  console.log(`Total contributors: ${contributors.length}`);
  console.log(`All merged PRs: ${contributions}`)
}

const prJSON = fs.readFileSync(prsFile, 'utf8');
const prs = JSON.parse(prJSON);

const buckets = initializeBuckets(prs);

const orgJSON = fs.readFileSync(orgsFile, 'utf8');
const organizations = JSON.parse(orgJSON);

logAll(buckets);

console.log(`OWD : ${analyse(buckets, organizations['owd'])}`);
console.log(`W3C : ${analyse(buckets, organizations['w3c'])}`);
console.log(`Mozilla : ${analyse(buckets, organizations['mozilla'])}`);
console.log(`Vinyl : ${analyse(buckets, organizations['vinyl'])}`);

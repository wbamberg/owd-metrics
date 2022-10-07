# OWD-metrics

This repository contains some scripts which we use to generate metrics about OWD's activities.

It's split into three main parts:

- **query**: contains scripts to fetch data from GitHub, using the GitHub API. To use these scripts you'll need a GitHub Personal Access Token. The scripts can take a while to run. There are two scripts here:
  - **query-prs.js**: fetches PRs merged to mdn/content
  - **query-reviews.js**: fetches reviews of PRs merged to mdn/content
- **data**: contains data which the analyse scripts needs. This contains:
  - **data.zip**: a zip containing the output of a previous run of the query scripts, so you can test out the analyse scripts without needing to fetch data
  - **organizations.json**: a JSON file that maps organizations to people, so we can know which organizations can claim credit for which PRs/reviews
- **analyse.js**: contains scripts to analyse the data:
  - **analyse-prs.json**: given organizations.json and the output of query-prs.js, figures out the number of PRs that each organization was responsible for.
  - **analyse-reviews.json**: given organizations.json and the output of query-reviews.js, figures out the number of reviews that each organization was responsible for.

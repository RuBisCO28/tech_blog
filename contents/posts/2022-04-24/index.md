---
title:      "Design Twitter"
date:       "2022-04-24"
category: "EN"
---

# Introduction
In this article, I'll try to design `Twitter`.

## STEP1: Constraints and user cases
### Use Case
- People can post tweets
- Follow other people
- Favorite tweets

### What we should figure out
- How many users do we expect this system to handle?
  - Aim for 10 million users generating around 100 million requests per day
  - Expect that each user will be following 200 other users on average, but expect some extraordinary users with tens of thousands of followers
- How many requests will that generate?
  - Expect that there will be a maximum of 10 million tweets per day and each tweet will probably be favorites twice on average but again, expect some big outliers

### Math
- Edge of the network of users
  - 200 follows * 10 MN = 2 BN edges
- The number of favorites
  - 10 MN tweets * 2(twice fav) = 20 MN favorites

### Summary
- 10 million users
- 10 million tweets per day
- 20 million tweets favorites per day
- 100 million HTTP requests to the site(daily)
  - 1150 requests per second
- 2 billion "follow relations"
- Some users and tweets could generate an extraordinary amount of traffic

## STEP2: High-level Design
### Layer
- Application Layer
  - posting new tweets(write)
  - following a user(write)
  - favoring a tweet(write)
  - displaying data about users and tweets(read)
- Data storage layer
  - the data storage that we will use to store all the data that needs to be persisted

## STEP3 Understanding bottlenecks and Scalable Design
### Handling user requests
- 1150 HTTP requests per second
- Set a load balancer and a set of application servers running behind it
- The load balancer routes requests to the servers using some predefined logic
- Disadvantage
  - A single load balancer is a single point of failure, configuring multiple load balancers further increases complexity.

### Storing the data
- The data
  - Users profiles
  - A set of tweets
  - Follow relationships
  - Favorites
- Tweets will be generated at an average speed of 10 million per day
  - for a single year there will be 3.65 billion incoming tweets
  - Aim for a solution that can store efficiently at least 10 BLN tweets for now
  - 1 tweet : 140 characters
  - 140 * 10 BLN = 1.4 trillion => 2.8 TB(1 character: 2byte, 1TB = 2^40 bytes)
- 2 billion each connection
  - follower and followed => 2 user IDs
  - 8(two 4 bytes integer) * 2BN = 16BN bytes => 16 GB(1GB = 2^30 bytes)
- The favorites are expected to grow at a rate of 20 mln per day
  - Let’s say we want to be able to store at least 20 bln such objects
  - They can probably just point to one user and one tweet through their IDs
  - 8 bytes(User IDs) + 4 bytes(Tweet ID) = 12 bytes
  - 12 * 20 BLN = 240 BLN bytes => 240 GB
- Expected Data: 2.6 - 2.7 terabytes

### Read/Write access
- In order to handle the incoming read requests we may need to use a caching solution
  - A database stores data on disk and it is much slower to read from disk than from memory
  - Databases usually have their own caching mechanisms but with memcached we have better control over what gets cached and how
- Add the appropriate indexes
  - This will also be vital for executing quick queries joining tables
- Partitioning the data

## STEP4: Low-level Design(Optional)
### Database Scheme

### Building a RESTful API

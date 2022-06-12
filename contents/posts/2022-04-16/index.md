---
title:      "Design Pastebin.com (or Bit.ly)"
date:       "2022-04-16"
category: "EN"
---

# Introduction
In this article, I'll try to design `Pastebin.com (or Bit.ly)`.

## STEP1: Constraints and user cases
### Use Case
- Shortening: take a url => return a much shorter url
- Redirection: take a short url => redirect to the original url
- Custom url
- Analytics
- Automatic link expiration
- Manual link removal
- UI vs API

### Decide which one should be worry about
- Shortening: take a url => return a much shorter url
- Redirection: take a short url => redirect to the original url
- Custom url
- High availability of the system

### What we should figure out
- Amount of traffic the system should handle
- Amount of data the system should work
- How many requests a month should the site handle 
- How many new URLs per month should the site handle

### Estimation
- Compare with well-known services and assume constraints
- Twitter: 15 BN new tweets
- All shortened URLs per month: 1.5 BN
  - Between 1 in 20 and 1 in 10 tweets contains a shortened URL
- Sites below the top 3: shorten 300M per month
  - This service is not gonna be in the top 3 most popular URL shortening services
  - But it's gonna be in the top 10
  - These the top three sites probably shortened 80% leaving the other 20%
- We: 100MLN urls each month
  - Large players will probably be getting between 10% to a third of that

### Math(Requests and URLs)
- New urls per month: 100MLN
- 1BN requests per month
  - 20% of all URLs generate 80% of the traffic
- Requests per second 400+ (40: shortens, 360: redirects)
  - 1BN / (30 day * 24 hour * 60 min * 60 second)
  - 10% come from shortening and 90% come from redirection
- Total urls: 5 years x 12 months x 100MLN = 6BN urls

### Math(Data)
- 3TBs for all urls, 36GB for all hashes (over 5 years)
  - (6BN urls * 500 bytes) / 1TB(2 ** 40)
  - 500 bytes per URL
- New data written per second: 40 * (500 + 6): 20K
  - 6 bytes per hash(6 characters: url)
- Data read per second: 360 redirects * 506 bytes: 180K

## STEP2: Abstract design
### Layer
- Application server layer(serves the requests)
  - Shortening service
    - generate on your hash
    - check if it's in the datastore, if not store new mapping
  - Redirection service
- Data storage layer(keep track of the hash => url mappings)
  - Acts like a big hash table
    - stores new mappings
    - retrieves a value given a key

### define how the hashing would work
- hashed_url = convert_to_base62(md5(original_url + random_salt))[:6]

## STEP3 Understanding bottlenecks
- What is the URL shortening problem all about 
- Where are we going to have heartache once we start scaling

### Bottlenecks
- Traffic is probably not going to be very hard, data - more interesting

## STEP4 Scalable Design
### Constraints
- Billions of objects
- Each object is fairly small(< 1K)
- There are no relationships between the objects
- Reads are 9x more frequent than writes (360 reads, 40 writes per second)
- 3TBs of urls, 36GB of hashes

### Application Server Layer
- Start with one machine
- Measure how far it takes us (load tests)
- Add a load balancer + a cluster machines over time to deal with spike-y traffic, to increase availability

### Data Storage
- Use one MySQL table with two fields
- mappings
  - hash: varchar(6)
  - original_url: varchar(512)
- Create unique index on the hash(36GB+) : We want to hold it in memory
  - Op1: Vertical scaling of the MySQL machine for a while
  - Op2: Eventually, partition the data by taking the first char of the hash mod the number of partitions
    - 5 partitions, 600GB of data, 8GB of indexes
- Think about a master-slave setup
  - Master-slave (reading from the slaves, writes to the master)


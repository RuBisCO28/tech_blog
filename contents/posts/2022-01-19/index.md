---
title:      "Scalability"
date:       "2022-01-19"
category: "EN"
---

# Introduction
In this article, I'll try to dig deeper into `Scalability`.

## Clones
### App Codebase
Public servers of a scalable web service are hidden behind a load balancer.  
This load balancer evenly distributes load onto your cluster of app servers.   
So user should always get the same result of their request back.  
Every server contains exactly the same codebase and doesn't store any user related data like sessions on local server.  

### Sessions
Regarding sessions, they need to be stored in a centralized data store.  
It can be an external database or an external persistent cache, like Redis.  
This external persistent cache will have better performance than an external database.  
By external I mean that the data store does not reside on the application servers.  
Instead, it is somewhere in or near the data center of your application servers.  

### Deployment
How can you make sure that a code change is sent to all your servers without one server still serving old code?  
You can now create an image file.  
Whenever you start a new instance/clone, just do an initial deployment of your latest code and you are ready!

## Database
Our servers can now horizontally scale and we can already serve thousands of concurrent requests.   
But somewhere down the road our application gets slower and slower and finally breaks down. 
You can choose from the following 2 paths:

### Path #1
- The following new actions to keep our database running will be more expensive and time consuming than the previous one. 
  - Stick with MySQL and keep the “beast” running.  
  - Do master-slave replication (read from slaves, write to master) and upgrade our master server by adding RAM  
  - “sharding”, “denormalization” and “SQL tuning” 

### Path #2
- Denormalize right from the beginning and include no more Joins in any database query. 
- You can stay with MySQL, and use it like a NoSQL database, or you can switch to a better and easier to scale NoSQL database like MongoDB or CouchDB.

## Cache
Our users still have to suffer slow page requests when a lot of data is fetched from the database.  
The solution is the implementation of a cache.  
With “cache” it means in-memory caches like Memcached or Redis.  

###  In-memory caches
A cache is a simple key-value store and it should reside as a buffering layer between application and data storage.  
Whenever application has to read data it should at first try to retrieve the data from cache.
Only if it’s not in the cache should it then try to get the data from the main data source.

### Why should you do that?
Because a cache is lightning-fast.  
It holds every dataset in RAM and requests are handled as fast as technically possible.

### 2 Patterns
#### Cached Database Queries
That’s still the most commonly used caching pattern.  
Whenever you do a query to our database, we store the result dataset in cache.  
A hashed version of your query is the cache key.  
The next time you run the query, we first check if it is already in the cache.  
This pattern has several issues and the main issue is the expiration.
It is hard to delete a cached result when you cache a complex query.
When one piece of data changes, you need to delete all cached queries who may include that table cell.

#### Cached Objects
In general, see your data as an object like you already do in your code (classes, instances, etc.).  
Let your class assemble a dataset from your database and then store the complete instance of the class or the assembled dataset in the cache. 
When your class has finished the “assembling” of the data array, directly store the data array, or better yet the complete instance of the class, in the cache.  
This allows you to easily get rid of the object whenever something did change and makes the overall operation of your code faster and more logical.

### Some ideas of objects to cache
- user sessions (never use the database!)
- fully rendered blog articles
- activity streams
- user<->friend relationships 

## Asynchronism
- In general, there are two ways / paradigms asynchronism can be done. 

### SSG
- Doing the time-consuming work in advance and serving the finished work with a low request time.
- Pages of a website, maybe built with a massive framework or CMS, are pre-rendered and locally stored as static HTML files on every change. 
- This pre-computing of overall general data can extremely improve websites and web apps and makes them very scalable and performant.

### Async
A user comes to your website and starts a very computing intensive task which would take several minutes to finish.
So the frontend of your website sends a job onto a job queue and immediately signals back to the user: your job is in work, please continue to the browse the page.  
The job queue is constantly checked by a bunch of workers for new jobs.  
If there is a new job then the worker does the job and after some minutes sends a signal that the job was done. 
The frontend, which constantly checks for new “job is done” - signals, sees that the job was done and informs the user about it.

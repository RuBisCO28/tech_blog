---
title:      "Scalability"
date:       "2022-01-19"
category: "EN"
---

# Introduction
In this article, I'll try to dig deeper into `Scalability`.

# Clones
## App Codebase
Public servers of a scalable web service are hidden behind a load balancer.  
This load balancer evenly distributes load onto your cluster of app servers.   
So user should always get the same result of their request back.  
Every server contains exactly the same codebase and doesn't store any user related data like sessions on local server.  

## Sessions
Regarding sessions, they need to be stored in a centralized data store.  
It can be an external database or an external persistent cache, like Redis.  
This external persistent cache will have better performance than an external database.  
By external I mean that the data store does not reside on the application servers.  
Instead, it is somewhere in or near the data center of your application servers.  

## Deployment
How can you make sure that a code change is sent to all your servers without one server still serving old code?  
You can now create an image file.  
Whenever you start a new instance/clone, just do an initial deployment of your latest code and you are ready!

# Database
your servers can now horizontally scale and you can already serve thousands of concurrent requests. 
But somewhere down the road your application gets slower and slower and finally breaks down. 

Now the required changes are more radical than just adding more cloned servers and may even require some boldness. 
In the end, you can choose from 2 paths:

## Path #1
stick with MySQL and keep the “beast” running. 
Hire a database administrator (DBA,) tell him to do master-slave replication (read from slaves, write to master) and upgrade your master server by adding RAM, RAM and more RAM. 
In some months, your DBA will come up with words like “sharding”, “denormalization” and “SQL tuning” and will look worried about the necessary overtime during the next weeks. 
At that point every new action to keep your database running will be more expensive and time consuming than the previous one. 
You might have been better off if you had chosen Path #2 while your dataset was still small and easy to migrate.

## Path #2
denormalize right from the beginning and include no more Joins in any database query. 
You can stay with MySQL, and use it like a NoSQL database, or you can switch to a better and easier to scale NoSQL database like MongoDB or CouchDB.
Joins will now need to be done in your application code. The sooner you do this step the less code you will have to change in the future. But even if you successfully switch to the latest and greatest NoSQL database and let your app do the dataset-joins, soon your database requests will again be slower and slower. You will need to introduce a cache.


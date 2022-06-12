---
title:      "RDBMS and Scalability"
date:       "2022-05-03"
category: "EN"
---

# Introduction
A relational database like SQL is a collection of data items organized in tables.
In this article, I'll try to dig deeper into `RDBMS and Scalability`.

## Replication
### Master-slave replication
The master serves reads and writes, replicating writes to one or more slaves, which serve only reads.  
Slaves can also replicate to additional slaves in a tree-like fashion.  
If the master goes offline, the system can continue to operate in read-only mode until a slave is promoted to a master or a new master is provisioned.  
Disadvantage is that additional logic is needed to promote a slave to a master.  

### Master-master replication
Both masters serve reads and writes and coordinate with each other on writes.  
If either master goes down, the system can continue to operate with both reads and writes.
Disadvantage is that most master-master systems are either loosely consistent (violating ACID) or have increased write latency due to synchronization.  
Conflict resolution comes more into play as more write nodes are added and as latency increases.  

### Common disadvantage
- There is a potential for loss of data if the master fails before any newly written data can be replicated to other nodes.
- If there are a lot of writes, the read replicas can get bogged down with replaying writes and can't do as many reads.
- The more read slaves, the more you have to replicate, which leads to greater replication lag.

## Federation
Federation (or functional partitioning) splits up databases by function.  
For example, instead of a single, monolithic database, you could have three databases: forums, users, and products, resulting in less read and write traffic to each database and therefore less replication lag.  
Smaller databases result in more data that can fit in memory, which in turn results in more cache hits due to improved cache locality.  
With no single central master serializing writes you can write in parallel, increasing throughput.

### Disadvantage
- Federation is not effective if your schema requires huge functions or tables.
- You'll need to update your application logic to determine which database to read and write.

## Sharding
Sharding distributes data across different databases such that each database can only manage a subset of the data.  
Taking a users database as an example, as the number of users increases, more shards are added to the cluster.

### Disadvantages
- You'll need to update your application logic to work with shards, which could result in complex SQL queries.
- Data distribution can become lopsided in a shard. For example, a set of power users on a shard could result in increased load to that shard compared to others.
- Rebalancing adds additional complexity. A sharding function based on consistent hashing can reduce the amount of transferred data.
- Joining data from multiple shards is more complex.
- Sharding adds more hardware and additional complexity.

## Denormalization
Denormalization attempts to improve read performance at the expense of some write performance  
In most systems, reads can heavily outnumber writes 100:1 or even 1000:1.  
A read resulting in a complex database join can be very expensive, spending a significant amount of time on disk operations.

### Disadvantages
- Data is duplicated.
- Constraints can help redundant copies of information stay in sync, which increases complexity of the database design.
- A denormalized database under heavy write load might perform worse than its normalized counterpart.

## SQL tuning
It's important to benchmark and profile to simulate and uncover bottlenecks.

## SQL or NoSQL
### Reasons for SQL
- Structured data
- Strict schema
- Relational data
- Need for complex joins
- Transactions
- Clear patterns for scaling
- More established: developers, community, code, tools, etc
- Lookups by index are very fast

### Reasons for NoSQL
- Semi-structured data
- Dynamic or flexible schema
- Non-relational data
- No need for complex joins
- Store many TB (or PB) of data
- Very data intensive workload
- Very high throughput for IOPS


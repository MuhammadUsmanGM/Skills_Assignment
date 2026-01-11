# Performance Guidelines for Code Reviews

## Algorithm Complexity
- [ ] Time complexity is appropriate for expected data sizes
- [ ] Space complexity is optimized
- [ ] O(n²) operations are avoided when possible
- [ ] Sorting and searching algorithms are efficient
- [ ] Recursive algorithms have proper base cases to prevent stack overflow

## Database Queries
- [ ] Queries have proper indexing
- [ ] N+1 query problems are avoided
- [ ] Joins are optimized
- [ ] Only necessary data is selected
- [ ] Pagination is implemented for large datasets
- [ ] Query execution plans are reasonable

## Caching Strategies
- [ ] Frequently accessed data is cached appropriately
- [ ] Cache invalidation strategy is implemented
- [ ] Cache size limits are set to prevent memory issues
- [ ] Cache warming strategies are considered

## Memory Management
- [ ] Memory leaks are prevented
- [ ] Objects are properly disposed of
- [ ] Large objects are handled efficiently
- [ ] Object pooling is considered for frequently created objects

## Network Efficiency
- [ ] HTTP requests are minimized
- [ ] API responses are properly compressed
- [ ] Connection pooling is used appropriately
- [ ] Asynchronous operations are implemented where beneficial
- [ ] Request/response sizes are optimized

## Code Optimization
- [ ] Expensive operations are not performed in loops
- [ ] Lazy loading is implemented where appropriate
- [ ] Unnecessary computations are avoided
- [ ] Proper data structures are used for the task
- [ ] String concatenation in loops is optimized

## Resource Utilization
- [ ] File handles are properly closed
- [ ] Database connections are returned to the pool
- [ ] Threading and concurrency are handled properly
- [ ] Background jobs are used for long-running operations

## Monitoring Considerations
- [ ] Performance metrics are available
- [ ] Logging is not excessive
- [ ] Error handling doesn't impact performance significantly

## Frontend Performance
- [ ] Assets are properly minified and compressed
- [ ] Images are optimized
- [ ] Critical rendering path is optimized
- [ ] JavaScript execution time is minimized
- [ ] CSS is optimized and critical styles are inlined

## Common Performance Anti-patterns
- Nested loops over large datasets
- Synchronous operations in performance-critical paths
- Creating objects unnecessarily in loops
- Blocking I/O operations in UI threads
- Loading entire datasets when only partial data is needed
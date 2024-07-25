const { Pool } = require('pg');

// Database connection configuration
const pool = new Pool({
    connectionString: 'postgresql://nubmaster:RQM0rRXyAWxV5aVhPdj5YNDj6kzKLDN0@dpg-cqgf4k2ju9rs73cd4hjg-a.oregon-postgres.render.com/lavkanal',
    ssl: { rejectUnauthorized: false }
});

// Function to run EXPLAIN ANALYZE
async function runExplainAnalyze(query) {
    const client = await pool.connect();
    try {
        const explainQuery = `EXPLAIN ANALYZE ${query}`;
        const result = await client.query(explainQuery);

        console.log('EXPLAIN ANALYZE Output:');
        result.rows.forEach((row, index) => {
            console.log(`Row ${index}: ${row['QUERY PLAN']}`);
        });
    } catch (err) {
        console.error('Error running EXPLAIN ANALYZE:', err.message);
    } finally {
        client.release();
    }
}

// Example query to analyze
const exampleQuery = 'SELECT * FROM products WHERE identifier = \'o2z6p6bzs7\';';

// Run the EXPLAIN ANALYZE command
runExplainAnalyze(exampleQuery);

// Close the pool when done
pool.end();

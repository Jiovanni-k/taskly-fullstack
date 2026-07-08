import "dotenv/config";


if (!process.env.TEST_DATABASE_URL) {
  throw new Error("TEST_DATABASE_URL is not set.");
}

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

//this file is for setting up the test environment before running the tests. 
// This file is executed before running the tests.

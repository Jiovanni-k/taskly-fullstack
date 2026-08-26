import app from './app.js';
import 'dotenv/config'; // This is crucial because without it we cannot have values to the things
// in the .env file, they would be undefined.

app.listen(3000, () => {
  console.log('Server is running on port 3000...');
});

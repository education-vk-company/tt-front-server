const mongoose = require('mongoose');

const initDB = () => {
  mongoose.connect(
    // 'mongodb+srv://tt-test:tt-test2019@cluster0-qvhdw.mongodb.net/test?retryWrites=true&w=majority',
    'mongodb+srv://tt-test:tt-test2019@tt-ftont-cluster-nkk7e.azure.mongodb.net/test?retryWrites=true&w=majority',
     { useNewUrlParser: true, useUnifiedTopology: true }
  );

  mongoose.connection.once('open', () => {
    console.log('connected to database');
  });
}

module.exports = initDB;

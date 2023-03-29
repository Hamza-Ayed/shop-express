const mongoose = require('mongoose');

const connectDB = async () => {
    try {

        mongoose.connect(process.env.MONGO_DB_KEY,
        )
            .then(() => {
                console.log('Connected to MongoDB Atlas');
            })
            .catch((err) => {
                console.error(err);
            });
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};
//mongoose.Promise.global.Promise;
module.exports = connectDB;



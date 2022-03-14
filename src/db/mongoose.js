const mongoose = require ('mongoose');

mongoose.connect('mongodb://localhost:27017/blog-app', { //task-manager-api is the db name made in robo 3T
useNewUrlParser: true,
useUnifiedTopology: true
});


//mongoose.connect('mongodb://localhost:27017/myapp');
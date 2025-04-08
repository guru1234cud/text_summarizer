const mongoose = require("mongoose")

const studentschema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    age:{
        type:String,
        required:true
    }
})

module.exports = mongoose.model('userdetails',studentschema)



// POST
exports.activity = function(req, res){
    // console.log(req.body.message)
    var s = req.body.message
    data = { message : s };
    res.send(data);
    res.type('application/json')
};

// GET
exports.activities = function(req, res){
    res.send("activities");
};
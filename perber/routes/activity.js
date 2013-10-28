

exports.activity = function(req, res){
    console.log(req.body.message)
    res.send("activity");
};


exports.activities = function(req, res){
    res.send("activities");
};
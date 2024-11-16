const restrictResources = async(req, res, next) => {
    const user = await req.user;

    console.log(req.headers.authorization);

    console.log("user is" + user);

    if(!user){
        console.log("no user");
        return res.status(401).json({ error: 'user required' });    
    }

    if(user.role === "client"){
        console.log("caught ya bastard");
        return res.status(403).json({error: "You do not have permission to access this resource"});
    }

    next();
}

module.exports = {restrictResources};
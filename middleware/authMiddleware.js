const protect = (req, res, next) => {
    const {user} = req.session;

    if (!user) {
        return res.status(401).json({status: "fail", message: "unauthorize"});
    }

    req.user = user; 

    next();
};

module.exports = protect
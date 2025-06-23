const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1]; // Extract token after "Bearer "

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: verified.id }; // keep as object for consistency
        next();
    } catch (err) {
        res.status(400).json({ msg: 'Token is not valid' });
    }
}

module.exports = auth;

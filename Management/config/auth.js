module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if(req.isAuthenticated()) {
            if (req.user.requirePasswordChange[0] == "true") {
                res.redirect(req.user.requirePasswordChange[1])
            }
            return next();
        }
        req.flash('error_msg', 'Please log in to head to the dashboard!');
        res.redirect('/');
    },
    ensureNotAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) {
            res.redirect('/dashboard')
        }
        return next();
    },
    ensureAdmin: function(req, res, next) {
        if (req.isAuthenticated()) {
            if (req.user.group == "Admin") {
                return next();
            }
            res.redirect('/dashboard')
            
        }
        
    }
}
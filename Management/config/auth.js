module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if(req.isAuthenticated()) {
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
            if (req.user.group == "admin") {
                return next();
            }
            res.redirect('/dashboard')
            
        }
        
    }
}
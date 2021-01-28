const restrictedPaths = ['/getCart', '/getStatus/key=tracked48'] 
module.exports = {
    createTrack: (req) => {
        if (!restrictedPaths.includes(req.originalUrl)) {
            if (req.method == "GET") {
                var layout = {
                    dp: req.originalUrl,
                    ea: "PageVisit",  // action
                    ec: "GET",  // category
                    el: req.originalUrl, // label
                    ev: 1, // value 
            }
            } else if ("POST") {
                var layout = {
                    dp: req.originalUrl,
                    ea: req.body,  // action
                    ec: "POST",  // category
                    el: req.originalUrl, // label
                    ev: 1, // value 
                }
            }
            req.visitor.pageview(layout).send()
        }
    }
}
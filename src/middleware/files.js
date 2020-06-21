const multer = require('multer')

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('file must be an image!'))
        }

        cb(undefined, true)
    }
})

module.exports = upload
import crypto from "node:crypto"
import fs from "node:fs"
import path from "node:path"
import multer from "multer"

const uploadDir = path.resolve(process.env.UPLOAD_DIR || "/tmp/cognimesh-uploads")

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

const ALLOWED_TYPES = new Map([
    ["application/pdf", ".pdf"],
    ["image/png", ".png"],
    ["image/jpeg", ".jpg"],
    ["image/webp", ".webp"]
])

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadDir)
    },
    filename(req, file, cb) {
        const extension = ALLOWED_TYPES.get(file.mimetype) || ".bin"
        cb(null, `${crypto.randomUUID()}${extension}`)
    }
})

const fileFilter = (req, file, cb) => {
    if (!ALLOWED_TYPES.has(file.mimetype)) {
        const error = new Error("Only PDF, PNG, JPEG, and WEBP files are allowed")
        error.status = 400
        return cb(error)
    }

    cb(null, true)
}

export default multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024,
        files: 1
    }
})

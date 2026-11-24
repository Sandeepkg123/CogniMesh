import fs from "node:fs/promises"

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

const checks = {
    "application/pdf": (buffer) => buffer.subarray(0, 5).toString("ascii") === "%PDF-",
    "image/png": (buffer) => buffer.subarray(0, 8).equals(PNG_SIGNATURE),
    "image/jpeg": (buffer) =>
        buffer.length >= 3 &&
        buffer[0] === 0xff &&
        buffer[1] === 0xd8 &&
        buffer[2] === 0xff,
    "image/webp": (buffer) =>
        buffer.length >= 12 &&
        buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
        buffer.subarray(8, 12).toString("ascii") === "WEBP"
}

export const hasValidFileSignature = async (filePath, mimeType) => {
    const check = checks[mimeType]

    if (!check) {
        return false
    }

    const handle = await fs.open(filePath, "r")

    try {
        const buffer = Buffer.alloc(12)
        const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0)
        return check(buffer.subarray(0, bytesRead))
    } finally {
        await handle.close()
    }
}

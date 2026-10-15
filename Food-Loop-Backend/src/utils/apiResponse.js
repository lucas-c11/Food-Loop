const mongoose = require("mongoose");

function sendError(res, error) {
    const clientError = error instanceof mongoose.Error.ValidationError
        || error instanceof mongoose.Error.CastError
        || error.code === 11000;
    const status = clientError ? 400 : 500;
    const message = clientError
        ? error.message
        : "An unexpected server error occurred";

    return res.status(status).json({ message });
}

function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateObjectBody(body, allowedFields, { allowEmpty = false } = {}) {
    if (!isPlainObject(body)) return "Request body must be a JSON object";
    if (!allowEmpty && Object.keys(body).length === 0) return "Request body must not be empty";
    const unknown = Object.keys(body).filter((field) => !allowedFields.includes(field));
    if (unknown.length) return `Unsupported field(s): ${unknown.join(", ")}`;
    return null;
}

module.exports = { sendError, isPlainObject, validateObjectBody };

var RESUMEABLE = {
    1012: true,
    1006: true,
    1002: true,
    1001: true,
    5000: true
};

var activities_id = {
    0: "PLAYING",
    2: "LISTENING",
    3: "WATCHING",
};

var activities_name = {
    "PLAYING": 0,
    "LISTENING": 2,
    "WATCHING": 3,
};

var Formats = {
    "png": "png",
    "jpg": "jpg",
    "jpeg": "jpeg",
    "webp": "webp",
    "gif": "gif",
    "auto": "webp"
};

module.exports = {RESUMEABLE, activities_id, activities_name, Formats};
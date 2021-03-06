const express = require("express");
const multer = require("multer");
const path = require("path");
const bodyParser = require("body-parser");
const { imageFilter } = require("./helpers");

const app = express();
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// parsing the request bodys
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// let's define the storage location for our images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },

    // By default, multer removes file extensions so let's add them back
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    },
});
// let upload = multer({ storage: storage, fileFilter: imageFilter });

// File Validation and Upload
app.post("/upload-profile-pic", (req, res) => {
    console.log("Working");
    // 'profile_pic' is the name of our file input field in the HTML form
    let upload = multer({ storage: storage, fileFilter: imageFilter }).single(
        "profile_pic"
    );

    upload(req, res, function (err) {
        // req.file contains information of uploaded file
        // req.body contains information of text fields, if there were any
        console.log(req.file);
        console.log(req.body);

        if (req.fileValidationError) {
            return res.send(req.fileValidationError);
        } else if (!req.file) {
            return res.send("Please select an image to upload");
        } else if (err instanceof multer.MulterError) {
            return res.send(err);
        } else if (err) {
            return res.send(err);
        }

        // Display uploaded image for user validation
        res.send(
            `You have uploaded this image: <hr/><img src="${req.file.path}" width="500"><hr /><a href="./">Upload another image</a>`
        );
    });
});

app.get("/showimage", (req, res) => {
    // res.sendFile(path.join(__dirname,'/uploads/profile_pic-1613934631285.jpg'));
    res.send(
        `You have uploaded this image: <hr/><img src="/uploads/profile_pic-1613934631285.jpg" width="500"><hr /><a href="./">Upload another image</a>`
    );
});

// Uploading Multiple Files
app.post("/upload-multiple-images", (req, res) => {
    // 10 is the limit I've defined for number of uploaded files at once
    // 'multiple_images' is the name of our file input field
    let upload = multer({
        storage: storage,
        fileFilter: imageFilter,
    }).array("multiple_images", 10);

    upload(req, res, function (err) {
        console.log(req.files);
        if (req.fileValidationError) {
            return res.send(req.fileValidationError);
        } else if (!req.files) {
            return res.send("Please select an image to upload");
        } else if (err instanceof multer.MulterError) {
            return res.send(err);
        } else if (err) {
            return res.send(err);
        }

        let result = "You have uploaded these images: <hr />";
        const files = req.files;
        let index, len;

        // Loop through all the uploaded images and display them on frontend
        for (index = 0, len = files.length; index < len; ++index) {
            result += `<img src="${files[index].path}" width="300" style="margin-right: 20px;">`;
        }
        result += '<hr/><a href="./">Upload more images</a>';
        res.send(result);
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));

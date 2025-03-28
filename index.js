import express from "express";

const app = express();

const PORT = 3000;

app.get("/get", (req, res) => {
    res.json("send responce")
})

app.listen(PORT, () => {
    console.log("app is listening");

})


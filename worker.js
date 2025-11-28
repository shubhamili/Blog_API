import { ConnectDB } from "./src/config/dbConfig.js";
import { notificationWorker } from "./src/queue/notificationQueue.js";


ConnectDB().then((req, res) => {
    console.log("DB connected");
    // app.listen(PORT, () => {
    //     console.log(`Server is running on port http://localhost:${PORT}`);
    // })
}).catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});


console.log("here",);
notificationWorker()

// have to run this in seperate terminal    
import app from "./app.js" ;
import dotenv from "dotenv"

dotenv.config();

const PORT= process.env.PORT || 3000;
app.listen(PORT, ()=>{return console.log(`Server is running on port ${PORT}`)});
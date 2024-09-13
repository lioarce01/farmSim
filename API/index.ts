import app from './src/index'
import * as dotenv from 'dotenv';
dotenv.config()

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})
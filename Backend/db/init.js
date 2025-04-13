import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { pool } from "../config/db.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const initDatabase = async () => {
  try {
    // Read the schema SQL file
    const schemaSQL = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8")

    // Split the SQL file into individual statements
    const statements = schemaSQL.split(";").filter((statement) => statement.trim() !== "")

    // Execute each statement
    for (const statement of statements) {
      await pool.query(statement + ";")
    }

    console.log("Database initialized successfully")
    return true
  } catch (error) {
    console.error("Error initializing database:", error.message)
    return false
  }
}

export default initDatabase

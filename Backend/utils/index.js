import { v4 as uuidv4 } from "uuid"

// Generate a UUID
export const generateUUID = () => uuidv4()

// Format a database row to camelCase
export const formatRow = (row) => {
  if (!row) return null

  const formattedRow = {}
  for (const key in row) {
    // Convert snake_case to camelCase
    const camelKey = key.replace(/_([a-z])/g, (match, p1) => p1.toUpperCase())
    formattedRow[camelKey] = row[key]
  }
  return formattedRow
}

// Format multiple rows to camelCase
export const formatRows = (rows) => {
  if (!rows) return []
  return rows.map(formatRow)
}

// Convert camelCase object keys to snake_case for SQL
export const toSnakeCase = (obj) => {
  const snakeCaseObj = {}
  for (const key in obj) {
    // Convert camelCase to snake_case
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    snakeCaseObj[snakeKey] = obj[key]
  }
  return snakeCaseObj
}

// Build SET clause for UPDATE queries
export const buildSetClause = (data) => {
  const snakeCaseData = toSnakeCase(data)
  const setClauses = []
  const values = []

  for (const key in snakeCaseData) {
    setClauses.push(`${key} = ?`)
    values.push(snakeCaseData[key])
  }

  return {
    setClause: setClauses.join(", "),
    values,
  }
}

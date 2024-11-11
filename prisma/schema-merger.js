const fs = require("fs")
const path = require("path")

const modelsDir = path.join(__dirname, "models")
const schemaPath = path.join(__dirname, "schema.prisma")

const mergeSchemas = () => {
    let schemaContent = `` // main file

    fs.readdirSync(modelsDir).forEach(file => {
        const filePath = path.join(modelsDir, file)
        const modelContent = fs.readFileSync(filePath, "utf8")
        schemaContent += modelContent + "\n\n"
    })

    fs.writeFileSync(schemaPath, schemaContent)
}

mergeSchemas()
console.log("Success message...")

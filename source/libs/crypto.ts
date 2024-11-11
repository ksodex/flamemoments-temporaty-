import { randomBytes, createCipheriv, createDecipheriv, createHash } from "crypto"

export class Crypto {
    static GenerateRandomString(prefix: string, length: number): string {
        return prefix + randomBytes(length).toString("hex")
    }

    static CreateSHA256(data: string): string {
        return createHash('sha256').update(data).digest('hex')
    }

    static Encrypt(text: string, password: string): string {
        const iv = randomBytes(16)
        const key = createHash('sha256').update(password).digest()
        const cipher = createCipheriv('aes-256-cbc', key, iv)
    
        let encryptedData = cipher.update(text, 'utf8', 'hex')
        encryptedData += cipher.final('hex')
    
        return encryptedData
    }
    
    static Decrypt(encryptedData: string, password: string, iv: string): string {
        const key = createHash('sha256').update(password).digest()
        const decipher = createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'))
    
        let decryptedData = decipher.update(encryptedData, 'hex', 'utf8')
        decryptedData += decipher.final('utf8')
    
        return decryptedData
    }
}

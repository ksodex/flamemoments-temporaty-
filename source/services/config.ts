import "dotenv/config"

export const COOKIE_SECRET = process.env.COOKIE_SECRET
export const ADDITIONAL_PATH = process.env.ADDITIONAL_PATH

export const ACCOUNT_SERVICE = {
    LISTEN_ADDRESS: "0.0.0.0",
    LISTEN_PORT: 9865,

    REQUEST_PER_SECOND: "10"
}
export const STORE_SERVICE = {
    LISTEN_ADDRESS: "0.0.0.0",
    LISTEN_PORT: 9855,

    REQUEST_PER_SECOND: "10"
}
export const PROMOUTION_SERVICE = {
    LISTEN_ADDRESS: "0.0.0.0",
    LISTEN_PORT: 9845,

    REQUEST_PER_SECOND: "10"
}
